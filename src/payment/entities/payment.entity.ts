import { BaseEntity } from '../../common/entity/base.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Entity,
  ManyToOne,
} from 'typeorm';
import { PaymentMethod } from '../payment-method.enum';
import { Ticket } from '../../ticket/entities/ticket.entity';
import { PaymentStatus } from '../payment-status.enum';
import { Profile } from '../../user/entities/profile.entity';

@Entity()
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  netPrice: number;

  @Column()
  totalPrice: number;

  @Column({ nullable: true })
  vat: number;

  @Column({ nullable: true })
  fees: number;

  @Column()
  bankName: string;

  @Column({ nullable: true })
  lastFourDigits: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
  })
  status: PaymentStatus;

  @OneToMany(() => Ticket, (ticket) => ticket.payment)
  tickets: Ticket[];

  @ManyToOne(() => Profile, (profile) => profile.payments)
  author: Profile;
}
