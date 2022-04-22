import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name', nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;
}
