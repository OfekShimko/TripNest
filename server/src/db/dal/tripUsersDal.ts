import { AppDataSource } from "../database_init";
import { Trip } from "../entities/Trip";
import { TripUsers } from "../entities/TripUsers";

export class TripUserDal {
    tripUserRepository = AppDataSource.getRepository(TripUsers);

    async createTripUser(trip: Trip, user_email: string) {
        const tripUser = this.tripUserRepository.create({
            trip: trip,
            user_email,
            permission_level: 'Manager', // Defaulting to Manager role here
        });
        await this.tripUserRepository.save(tripUser);
    }

    async findTripUser(trip_id: string, user_email: string) {
        const tripUser = await this.tripUserRepository.findOne({
            where: { trip_id, user_email },
        });
        return tripUser;
    }
}
