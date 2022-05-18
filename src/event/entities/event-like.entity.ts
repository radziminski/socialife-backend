import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Event } from './event.entity';
import { Profile } from '../../user/entities/profile.entity';
import { BaseEntity } from '../../common/entity/base.entity';

@Entity()
export class EventLike extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Profile, (profile) => profile.eventLikes, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  user: Profile;

  @ManyToOne(() => Event, (event) => event.likes, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  event: Event;
}
