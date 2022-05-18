import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Event } from './event.entity';
import { File } from '../../file/entities/file.entity';
import { BaseEntity } from '../../common/entity/base.entity';

@Entity()
export class EventFile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  isCoverImage?: boolean;

  @ManyToOne(() => File, (file) => file.eventFiles, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  file: File;

  @ManyToOne(() => Event, (event) => event.files, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  event: Event;
}
