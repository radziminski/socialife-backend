import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Entity,
} from 'typeorm';

import { Event } from 'src/event/entities/event.entity';
import { Ticket } from './ticket.entity';
import { BaseEntity } from '../../common/entity/base.entity';

@Entity()
export class TicketType extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string | null;

  @Column()
  price: number;

  @Column()
  isAvailable: boolean;

  @Column({ nullable: true })
  availableTillDate: string | null;

  @ManyToOne(() => Event, (event) => event.ticketTypes)
  event: Event;

  @OneToMany(() => Ticket, (ticket) => ticket.type)
  tickets: Ticket[];
}
