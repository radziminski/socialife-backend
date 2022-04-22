import { Project } from './project.entity';
import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Column,
} from 'typeorm';
import { File } from '../../file/entities/file.entity';

@Entity()
export class ProjectFile {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => File, (file) => file.projectFiles, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'file_id' })
  file: File;

  @Column({ name: 'file_id' })
  fileId: number;

  @ManyToOne(() => Project, (project) => project.files, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'project_id' })
  projectId: number;
}
