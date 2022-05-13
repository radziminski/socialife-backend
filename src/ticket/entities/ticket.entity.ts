import { PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EventTicket } from '../../event/entities/event-ticket.entity';
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  createdAt: string;

  @Column({ nullable: true })
  editedAt: string;

  @OneToMany(() => EventTicket, (eventTicket) => eventTicket.ticket)
  eventTickets: EventTicket[];
}
