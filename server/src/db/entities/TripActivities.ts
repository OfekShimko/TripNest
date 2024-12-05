import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Trip } from './Trip';

@Entity('TripActivities')
export class TripActivities {
  @PrimaryColumn()
  xid!: string; // External activity ID

  @PrimaryColumn({ name: 'trip_id' })
  trip_id!: string;

  @ManyToOne(() => Trip, (trip) => trip.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' }) // Ensure the foreign key column is correctly named
  trip!: Trip;
}
