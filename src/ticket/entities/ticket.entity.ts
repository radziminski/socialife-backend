import { PrimaryGeneratedColumn, Column, ManyToOne, Entity } from 'typeorm';
import { TicketType } from './ticket-type.entity';
import { Profile } from '../../user/entities/profile.entity';
import { BaseEntity } from '../../common/entity/base.entity';

@Entity()
export class Ticket extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  secret: string;

  @ManyToOne(() => Profile, (profile) => profile.tickets)
  owner: Profile;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.tickets)
  type: TicketType;
}
