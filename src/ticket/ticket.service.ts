import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketType } from './entities/ticket-type.entity';
import { Repository } from 'typeorm/repository/Repository';
import { EventService } from '../event/event.service';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { Profile } from '../user/entities/profile.entity';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketType)
    private readonly ticketTypeRepository: Repository<TicketType>,
    private readonly eventService: EventService,
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

    // TODO: add uid here
    const secret = '12345';

    const ticket = new Ticket();
    ticket.secret = secret;
    ticket.owner = owner;
    ticket.type = ticketType;

    return this.ticketRepository.save(ticket);
  }
}
