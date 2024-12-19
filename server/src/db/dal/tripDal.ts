import { AppDataSource } from "../database_init";
import { Trip } from "../entities/Trip";
import { TripUsers } from "../entities/TripUsers";
import { TripActivities } from "../entities/TripActivities";
import { QueryRunner } from "typeorm";

export type UnsavedTrip = Omit<Trip, 'id' | 'activities' | 'users'>;

export class TripDal {
    tripRepository = AppDataSource.getRepository(Trip);
    tripUserRepository = AppDataSource.getRepository(TripUsers);
    tripActivitiesRepository = AppDataSource.getRepository(TripActivities);

    async getTripsForUser(userId: string): Promise<Trip[]> {
        return this.tripRepository.createQueryBuilder("trip")
        .leftJoinAndSelect('trip.users', 'tripUsers')
        .leftJoinAndSelect('tripUsers.user', 'user')
        .where('user.id = :userId', { userId })
        .getMany();
      }

    async getTripById(id: string) {
        const trip = await this.tripRepository.findOneBy({ id });
        return trip;
    }

    async createTrip(trip: UnsavedTrip) {
        const newTrip = this.tripRepository.create(trip);
        const savedTrip = await this.tripRepository.save(newTrip);
        return savedTrip;
    }

    async updateTrip(trip: Trip) {
        const updatedTrip = await this.tripRepository.save(trip);
        return updatedTrip;
    }

    async findTripUser(trip_id: string, user_email: string) {
        const tripUser = await this.tripUserRepository.findOne({
            where: { trip_id, user_email },
        });
        return tripUser;
    }

    async deleteTripActivities(trip_id: string, queryRunner: QueryRunner) {
        await queryRunner.manager.delete(TripActivities, { trip_id });
    }

    async deleteTripUsers(trip_id: string, queryRunner: QueryRunner) {
        await queryRunner.manager.delete(TripUsers, { trip_id });
    }

    async deleteTrip(trip_id: string, queryRunner: QueryRunner) {
        await queryRunner.manager.delete(Trip, { id: trip_id });
    }

    async searchTrips(filters: any) {
        const queryBuilder = this.tripRepository.createQueryBuilder('trip');

        if (filters.title) {
            queryBuilder.andWhere('trip.title LIKE :title', { title: `%${filters.title}%` });
        }

        if (filters.location) {
            queryBuilder.andWhere('trip.location LIKE :location', { location: `%${filters.location}%` });
        }

        if (filters.from_date) {
            queryBuilder.andWhere('trip.from_date >= :from_date', { from_date: filters.from_date });
        }

        if (filters.to_date) {
            queryBuilder.andWhere('trip.to_date <= :to_date', { to_date: filters.to_date });
        }

        const trips = await queryBuilder.getMany();
        return trips;
    }

    async getTripActivities(trip_id: string) {
        const activities = await this.tripActivitiesRepository.find({ where: { trip_id } });
        return activities;
    }

    async addTripActivity(activity: TripActivities) {
        const savedActivity = await this.tripActivitiesRepository.save(activity);
        return savedActivity;
    }

    async findTripActivity(trip_id: string, xid: string) {
        const activity = await this.tripActivitiesRepository.findOne({ where: { trip_id, xid } });
        return activity;
    }

    async removeTripActivity(activity: TripActivities) {
        await this.tripActivitiesRepository.remove(activity);
    }
}
