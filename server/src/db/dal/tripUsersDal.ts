import { AppDataSource } from "../database_init";
import { Trip } from "../entities/Trip";
import { TripUsers } from "../entities/TripUsers";

export class TripUserDal {
  tripUserRepository = AppDataSource.getRepository(TripUsers);

  async createTripUser(trip: Trip, user_id: string) {
    const tripUser = this.tripUserRepository.create({
      trip: trip,
      user_id: user_id,
      permission_level: 'Manager', // Defaulting to Manager role here
    });

    await this.tripUserRepository.save(tripUser);
  }

  // Find an existing TripUsers record by trip_id and user_id
  async findTripUser(trip_id: string, user_id: string) {
    const tripUser = await this.tripUserRepository.findOne({
      where: { trip_id, user_id },
    });
    return tripUser;
  }
}
