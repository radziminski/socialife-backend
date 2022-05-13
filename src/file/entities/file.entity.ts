import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { FileType } from '../file.types';

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

  @Column({
    type: 'enum',
    enum: FileType,
    default: FileType.Image,
  })
  type: FileType;

  @Column({ nullable: true })
  originalName: string;

  @Column()
  createdAt: string;

  @Column({ nullable: true })
  size: number;

  @Column({ name: 'mime_type' })
  mimeType: string;
}
