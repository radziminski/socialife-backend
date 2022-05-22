import { UserService } from './../user/user.service';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { isOrganizationProfile } from '../user/user.utils';
import { EventLike } from './entities/event-like.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly userService: UserService,
  ) {}

  async create(organizationEmail: string, createEventDto: CreateEventDto) {
    if (!this.userService.checkIfHasProfile(organizationEmail)) {
      throw new BadRequestException(
        'Create organization profile before creating an event',
      );
    }

    const profile = await this.userService.getProfile(organizationEmail);

    if (!isOrganizationProfile(profile)) {
      throw new BadRequestException('User has wrong profile type');
    }

    const event = new Event();
    event.title = createEventDto.title;
    event.description = createEventDto.description;
    event.startDate = createEventDto.startDate;
    event.endDate = createEventDto.endDate;
    event.isCanceled = false;
    event.latitude = createEventDto.latitude;
    event.longitude = createEventDto.longitude;
    event.locationName = createEventDto.locationName;
    event.locationRef = createEventDto.locationRef;
    event.category = createEventDto.category;
    event.createdBy = profile;
    event.ticketTypes = [];
    event.likes = [];
    event.files = [];

    const newEvent = await this.eventRepository.save(event);
    return {
      ...newEvent,
      likesNum: 0,
    };
  }

  async findAll() {
    const events = await this.eventRepository.find({ relations: ['likes'] });

    return events.map((event) => this.convertLikesToLikesNumber(event));
  }

  async findAllForOrganization(organizationEmail: string) {
    const user = await this.userService.findOneByEmail(organizationEmail);

    const events = await this.eventRepository.find({
      where: {
        createdBy: {
          id: user.organizationProfile.id,
        },
      },
      relations: ['likes'],
    });

    return events.map((event) => this.convertLikesToLikesNumber(event));
  }

  async findOne(id: number, relations?: string[]) {
    const event = await this.eventRepository.findOne(id, {
      relations: relations ?? ['createdBy'],
    });

    if (!event) {
      throw new BadRequestException(`Event with id ${id} does not exist`);
    }

    return event;
  }

  async findOneWithLikesNumber(id: number, relations = ['createdBy', 'likes']) {
    const event = await this.findOne(id, relations);
    return this.convertLikesToLikesNumber(event);
  }

  async findOneWithFirstLikes(id: number) {
    const event = await this.findOne(id, [
      'createdBy',
      'ticketTypes',
      'likes',
      'likes.user',
    ]);
    const likes = [...(event.likes ?? [])].slice(0, 5);
    const newEvent = this.convertLikesToLikesNumber(event);
    return {
      ...newEvent,
      likes,
    };
  }

  async checkAuthor(event: Event, authorEmail: string) {
    const user = await this.userService.findOneByEmail(authorEmail);

    if (!event.createdBy) {
      throw new BadRequestException('Event does not have an author');
    }

    if (!user.organizationProfile) {
      throw new BadRequestException('Organization does not have profile');
    }

    if (event.createdBy.id !== user.organizationProfile.id) {
      throw new BadRequestException('Only event author can modify it');
    }
  }

  async checkAuthorFromId(id: number, authorEmail: string) {
    const event = await this.findOne(id);
    await this.checkAuthor(event, authorEmail);
  }

  async update(
    id: number,
    organizationEmail: string,
    updateEventDto: UpdateEventDto,
  ) {
    const event = await this.findOne(id);
    await this.checkAuthor(event, organizationEmail);

    return this.eventRepository.save({
      ...event,
      ...updateEventDto,
    });
  }

  async remove(id: number, organizationEmail: string) {
    await this.checkAuthorFromId(id, organizationEmail);

    return this.eventRepository.delete(id);
  }

  async cancel(id: number, organizationEmail: string) {
    const event = await this.findOne(id);
    await this.checkAuthor(event, organizationEmail);

    return this.eventRepository.save({
      ...event,
      isCanceled: true,
    });
  }

  async likeEvent(id: number, email: string) {
    const event = await this.findOne(id, [
      'likes',
      'likes.user',
      'createdBy',
      'ticketTypes',
    ]);

    const user = await this.userService.findOneByEmail(email);
    if (user.organizationProfile) {
      throw new BadRequestException('Organization cannot like events');
    }
    if (!user.profile) {
      throw new BadRequestException('Create user profile first');
    }
    if (
      event.likes &&
      event.likes.some((like) => like.user.id === user.profile.id)
    ) {
      throw new BadRequestException('This user already like this event');
    }

    const eventLike = new EventLike();
    eventLike.user = user.profile;

    return this.eventRepository.save({
      ...event,
      likes: [...(event.likes ?? []), eventLike],
    });
  }

  async unlikeEvent(id: number, email: string) {
    const event = await this.findOne(id, [
      'likes',
      'likes.user',
      'likes.event',
      'createdBy',
      'ticketTypes',
    ]);

    const user = await this.userService.findOneByEmail(email);
    if (
      !user.profile ||
      !event.likes ||
      !event.likes.some((like) => like.user.id === user.profile.id)
    ) {
      throw new BadRequestException('User does not like this event');
    }

    return this.eventRepository.save({
      ...event,
      likes: event.likes.filter(
        (like) =>
          !(like.event.id === event.id && like.user.id === user.profile.id),
      ),
    });
  }

  convertLikesToLikesNumber(event: Event) {
    const { likes, ...restEvent } = event;

    const likesNumber = likes?.length ?? 0;

    return {
      ...restEvent,
      likesNumber,
    };
  }
}
