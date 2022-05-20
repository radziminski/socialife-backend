import {
  Injectable,
  BadRequestException,
  NotAcceptableException,
} from '@nestjs/common';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketType } from './entities/ticket-type.entity';
import { Repository } from 'typeorm/repository/Repository';
import { EventService } from '../event/event.service';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { Profile } from '../user/entities/profile.entity';
import { Ticket } from './entities/ticket.entity';
import { TICKET_SECRET_LENGTH } from '../payment/payment.constant';
import { UserService } from '../user/user.service';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketType)
    private readonly ticketTypeRepository: Repository<TicketType>,
    private readonly eventService: EventService,
    private readonly userService: UserService,
  ) {}

  async createType(
    eventId: number,
    organizationEmail: string,
    createTicketTypeDto: CreateTicketTypeDto,
  ) {
    const event = await this.eventService.findOne(eventId);
    await this.eventService.checkAuthor(event, organizationEmail);

    const ticketType = new TicketType();
    ticketType.title = createTicketTypeDto.title;
    ticketType.description = createTicketTypeDto.description;
    ticketType.availableTillDate = createTicketTypeDto.availableTillDate;
    ticketType.price = createTicketTypeDto.price;
    ticketType.isAvailable = true;
    ticketType.event = event;
    ticketType.tickets = [];

    const newTicketType = await this.ticketTypeRepository.save(ticketType);
    const { event: _, ...restTicketType } = newTicketType;

    return restTicketType;
  }

  async findOneType(id: number, relations?: string[]) {
    const ticketType = await this.ticketTypeRepository.findOne(id, {
      relations,
    });
    if (!ticketType) {
      throw new BadRequestException(`Ticket type with id ${id} does not exist`);
    }

    return ticketType;
  }

  async checkAuthorAndFindOneType(
    id: number,
    eventId: number,
    authorEmail: string,
  ) {
    const ticketType = await this.findOneType(id, ['event', 'event.createdBy']);

    if (ticketType.event.id !== eventId) {
      throw new BadRequestException(
        `Ticket type with id ${id} does not exist on this event`,
      );
    }

    await this.eventService.checkAuthor(ticketType.event, authorEmail);

    if (ticketType.event.id !== eventId) {
      throw new BadRequestException(
        'This event does not have such ticket type',
      );
    }

    return ticketType;
  }

  async findTypesForEvent(eventId: number) {
    const ticketTypes = await this.ticketTypeRepository.find({
      where: {
        event: {
          id: eventId,
        },
      },
    });

    return ticketTypes;
  }

  async updateType(
    id: number,
    eventId: number,
    organizationEmail: string,
    updateTicketTypeDto: UpdateTicketTypeDto,
  ) {
    const ticketType = await this.checkAuthorAndFindOneType(
      id,
      eventId,
      organizationEmail,
    );

    const updatedTicketType = await this.ticketTypeRepository.save({
      ...ticketType,
      ...updateTicketTypeDto,
    });
    const { event: _, ...restTicketType } = updatedTicketType;

    return restTicketType;
  }

  async deleteType(id: number, eventId: number, organizationEmail: string) {
    const ticketType = await this.checkAuthorAndFindOneType(
      id,
      eventId,
      organizationEmail,
    );

    return this.ticketTypeRepository.remove(ticketType);
  }

  async createTicket(owner: Profile, ticketTypeId: number) {
    const ticketType = await this.findOneType(ticketTypeId);

    const secret = this.generateSecret();

    const ticket = new Ticket();
    ticket.secret = secret;
    ticket.owner = owner;
    ticket.type = ticketType;

    return this.ticketRepository.save(ticket);
  }

  generateSecret() {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    const secret = [];
    for (let i = 0; i < TICKET_SECRET_LENGTH; i++) {
      secret.push(
        characters.charAt(Math.floor(Math.random() * charactersLength)),
      );
    }
    return secret.join('');
  }

  async findOne(id: number, relations?: string[]) {
    const ticket = await this.ticketRepository.findOne(id, {
      relations: relations ?? ['owner', 'type', 'type.event'],
      select: ['id', 'secret'],
    });

    if (!ticket) {
      throw new BadRequestException(`Ticket with id ${id} does not exist`);
    }

    return ticket;
  }

  async checkOwnerAndFindOne(id: number, email: string) {
    const profile = await this.userService.findProfileByEmail(email);
    const ticket = await this.findOne(id);

    if (ticket.owner?.id !== profile.id) {
      throw new BadRequestException(`User does not have ticket with id ${id}`);
    }

    return ticket;
  }

  async findUserTickets(email: string) {
    const profile = await this.userService.findProfileByEmail(email);
    return this.ticketRepository.find({
      where: {
        owner: {
          id: profile.id,
        },
      },
      relations: ['type', 'type.event'],
    });
  }

  async checkTicketValidity(
    organizationEmail: string,
    eventId: number,
    ticketTypeId: number,
    ticketId: number,
    ticketSecret: string,
  ) {
    const ticketType = await this.checkAuthorAndFindOneType(
      ticketTypeId,
      eventId,
      organizationEmail,
    );

    const ticket = await this.findOne(ticketId);

    if (ticket.secret === ticketSecret && ticket.type.id === ticketType.id) {
      const { secret: _, ...restTicket } = ticket;
      return restTicket;
    }

    throw new NotAcceptableException('Provided ticket is not valid');
  }
}
