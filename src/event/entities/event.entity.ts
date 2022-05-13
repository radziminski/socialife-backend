import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { EventLike } from './event-like.entity';
import { EventTicket } from './event-ticket.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  startDate: string;

  @Column()
  endDate: string;

  @Column()
  locationName: string;

  @Column()
  longitude: number;

  @Column()
  latitude: number;

  @Column()
  createdAt: string;

  @Column({ nullable: true })
  editedAt: string;

  @OneToMany(() => EventLike, (eventLike) => eventLike.event, {
    cascade: true,
  })
  likes: EventLike[];

  @OneToMany(() => EventTicket, (eventTicket) => eventTicket.event, {
    cascade: true,
  })
  tickets: EventTicket[];
}
