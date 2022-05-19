import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TicketType } from './entities/ticket-type.entity';
import { Ticket } from './entities/ticket.entity';
import { EventModule } from '../event/event.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, TicketType]), EventModule],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
