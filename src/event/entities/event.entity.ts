import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { EventLike } from './event-like.entity';
import { TicketType } from '../../ticket/entities/ticket-type.entity';
import { OrganizationProfile } from '../../user/entities/organization-profile.entity';
import { EventFile } from './event-file.entity';
import { BaseEntity } from '../../common/entity/base.entity';

@Entity()
export class Event extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  startDate: string;

  @Column({ nullable: true })
  endDate: string | null;

  @Column({ nullable: true })
  locationName: string | null;

  @Column({ nullable: true })
  locationRef: string | null;

  @Column()
  longitude: number;

  @Column()
  latitude: number;

  @Column()
  price: number;

  @Column({ nullable: true })
  isCanceled: boolean | null;

  @ManyToOne(
    () => OrganizationProfile,
    (organizationProfile) => organizationProfile.events,
  )
  createdBy: OrganizationProfile;

  @OneToMany(() => EventFile, (eventFile) => eventFile.event, {
    cascade: true,
  })
  files: EventFile[];

  @OneToMany(() => EventLike, (eventLike) => eventLike.event, {
    cascade: true,
  })
  likes: EventLike[];

  @OneToMany(() => TicketType, (ticketType) => ticketType.event, {
    cascade: true,
  })
  ticketTypes: TicketType[];
}
