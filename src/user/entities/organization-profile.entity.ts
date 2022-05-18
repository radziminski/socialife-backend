import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { BaseEntity } from 'src/common/entity/base.entity';
import { Event } from 'src/event/entities/event.entity';

@Entity()
export class OrganizationProfile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  coverUrl: string;

  @Column()
  website: string;

  @OneToMany(() => Event, (event) => event.createdBy)
  events: Event[];
}
