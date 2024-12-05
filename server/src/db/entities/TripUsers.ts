import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Trip } from './Trip';
import { User } from './User';

@Entity('TripUsers')
export class TripUsers {
  @PrimaryColumn()
  trip_id!: string;

  @PrimaryColumn()
  user_email!: string;

  @Column({
    type: 'enum',
    enum: ['Manager', 'Editor', 'Viewer'],
    default: 'Viewer',
  })
  permission_level!: 'Manager' | 'Editor' | 'Viewer';

  @ManyToOne(() => Trip, (trip) => trip.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })  // Make sure the join column matches the column name
  trip!: Trip;

  @ManyToOne(() => User, (user) => user.trips, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_email' })  // Same for the user_email column
  user!: User;
}
