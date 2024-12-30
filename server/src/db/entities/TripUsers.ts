import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Trip } from './Trip';
import { User } from './User';

@Entity('TripUsers')
export class TripUsers {
  @PrimaryColumn()
  trip_id!: string;

  @PrimaryColumn()
  user_id!: string;

  @Column({
    type: 'enum',
    enum: ['Manager', 'Editor', 'Viewer'],
    default: 'Viewer',
  })
  permission_level!: 'Manager' | 'Editor' | 'Viewer';

  @ManyToOne(() => Trip, (trip) => trip.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip!: Trip;

  @ManyToOne(() => User, (user) => user.trips, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
