import { User } from './../../user/entities/user.entity';
import { Project } from './project.entity';
import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Column,
} from 'typeorm';

@Entity()
export class ProjectUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.projectUsers, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => Project, (project) => project.users, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'project_id' })
  projectId: number;
}
