import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  destination!: string;

  @Column()
  date!: string;

  @Column()
  description!: string;
}
