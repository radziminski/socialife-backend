import { ProjectFile } from './../../project/entities/project-file.entity';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  key: string;

  @Column()
  acl: string;

  @Column()
  name: string;

  @Column({ name: 'original_name', nullable: true })
  originalName: string;

  @Column({ name: 'created_at' })
  createdAt: string;

  @Column({ nullable: true })
  length: number;

  @Column({ nullable: true })
  size: number;

  @Column({ nullable: true })
  bitRate: number;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @OneToMany(() => ProjectFile, (projectFile) => projectFile.file)
  projectFiles: ProjectFile[];
}
