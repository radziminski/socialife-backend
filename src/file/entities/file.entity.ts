import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { FileType } from '../file.types';
import { EventFile } from '../../event/entities/event-file.entity';
import { BaseEntity } from '../../common/entity/base.entity';

@Entity()
export class File extends BaseEntity {
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

  @Column({ nullable: true })
  isOrganizationCover: boolean | null;

  @Column({
    type: 'enum',
    enum: FileType,
    default: FileType.Image,
  })
  type: FileType;

  @Column({ nullable: true })
  originalName: string | null;

  @Column({ nullable: true })
  size: number | null;

  @Column()
  mimeType: string;

  @OneToMany(() => EventFile, (eventFile) => eventFile.file)
  eventFiles: EventFile[];
}
