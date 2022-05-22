import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { BaseEntity } from 'src/common/entity/base.entity';
import { Event } from 'src/event/entities/event.entity';
import { Region } from '../region.enum';
import { User } from './user.entity';

@Entity()
export class OrganizationProfile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  email: string | null;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  coverUrl: string | null;

  @Column()
  website: string;

  @Column({
    type: 'enum',
    enum: Region,
    default: Region.Poland,
  })
  region: Region;

  @Column()
  city: string;

  @OneToMany(() => Event, (event) => event.createdBy)
  events: Event[];

  @OneToOne(() => User, (user) => user.organizationProfile)
  @JoinColumn()
  user: User;
}
