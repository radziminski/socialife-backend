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
import { EventCategory } from '../event-category.enum';

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
  longitude: string;

  @Column()
  latitude: string;

  @Column({ nullable: true })
  isCanceled: boolean | null;

  @Column({
    type: 'enum',
    enum: EventCategory,
    default: EventCategory.Music,
  })
  category: EventCategory;

  @ManyToOne(
    () => OrganizationProfile,
    (organizationProfile) => organizationProfile.events,
    { cascade: true },
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
