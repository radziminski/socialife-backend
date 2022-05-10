import { ProjectFile } from './project-file.entity';
import { ProjectUser } from './project-user.entity';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ name: 'created_at' })
  createdAt: string;

  @Column({ name: 'edited_at', nullable: true })
  editedAt: string;

  @OneToMany(() => ProjectUser, (projectUser) => projectUser.project, {
    cascade: true,
  })
  users: ProjectUser[];

  @OneToMany(() => ProjectFile, (projectFile) => projectFile.project, {
    cascade: true,
  })
  files: ProjectFile[];
}
