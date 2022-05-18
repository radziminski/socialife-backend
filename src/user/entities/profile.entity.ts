import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Ticket } from '../../ticket/entities/ticket.entity';
import { EventLike } from '../../event/entities/event-like.entity';
import { BaseEntity } from 'src/common/entity/base.entity';
import { Region } from '../region.enum';

@Entity()
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName: string | null;

  @Column({
    type: 'enum',
    enum: Region,
    default: Region.Poland,
  })
  region: Region;

  @OneToMany(() => EventLike, (eventLike) => eventLike.user)
  eventLikes: EventLike[];

  @OneToMany(() => Ticket, (ticket) => ticket.owner)
  tickets: Ticket[];
}
