import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { TripActivities } from './TripActivities';
import { TripUsers } from './TripUsers';

@Entity({ name: 'Trip' })
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  title!: string;

  @Column('text')
  description!: string;

  @Column({ length: 255 })
  location!: string;

  @Column('date')
  from_date!: Date;

  @Column('date')
  to_date!: Date;

  @OneToMany(() => TripActivities, (activity) => activity.trip, { cascade: true })
  activities!: TripActivities[];

  @OneToMany(() => TripUsers, (tripUser) => tripUser.trip)
  users!: TripUsers[];
}
