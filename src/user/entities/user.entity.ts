import { Profile } from './profile.entity';
import { UserRole } from '../../auth/roles/user-role.enum';
import { OneToMany } from 'typeorm';
import { EventLike } from '../../event/entities/event-like.entity';
import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'user_auth' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.User,
  })
  role: UserRole;

  @OneToOne(() => Profile, { cascade: true })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @OneToMany(() => EventLike, (eventLike) => eventLike.user)
  eventLikes: EventLike[];
}
