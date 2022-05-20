import { PrimaryGeneratedColumn, Column, ManyToOne, Entity } from 'typeorm';

import { Payment } from './../../payment/entities/payment.entity';
import { TicketType } from './ticket-type.entity';
import { Profile } from '../../user/entities/profile.entity';
import { BaseEntity } from '../../common/entity/base.entity';

@Entity()
export class Ticket extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ select: false })
  secret: string;

  @ManyToOne(() => Profile, (profile) => profile.tickets)
  owner: Profile;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.tickets)
  type: TicketType;

  @ManyToOne(() => Payment, (payment) => payment.tickets)
  payment: Payment;
}
