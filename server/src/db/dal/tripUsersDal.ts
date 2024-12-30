import { AppDataSource } from "../database_init";
import { Trip } from "../entities/Trip";
import { TripUsers } from "../entities/TripUsers";
import { User } from "../entities/User";

export class TripUserDal {
    tripUserRepository = AppDataSource.getRepository(TripUsers);
    userRepository = AppDataSource.getRepository(User);

    async createTripUser(trip: Trip, user_id: string, permission_level: 'Manager' | 'Editor' | 'Viewer') {
        // Check if user exists
        const user = await this.userRepository.findOne({ where: { id: user_id } });
        if (!user) {
            throw new Error('User with this email does not exist');
        }

        const tripUser = this.tripUserRepository.create({
            trip,
            user_id: user.id, // Correctly reference the user's email
            permission_level,
        });

        await this.tripUserRepository.save(tripUser);
    }

    async findTripUser(trip_id: string, user_id: string) {
        const tripUser = await this.tripUserRepository.findOne({
            where: { trip_id, user_id },
        });
        return tripUser;
    }

  // Update user permission level
  async updateUserPermission(tripUser: TripUsers, newPermission: 'Manager' | 'Editor' | 'Viewer') {
    if (newPermission === "Manager")
        return "Could not change user permission to manager - only to Editor or Viewer";

    // Update the permission
    tripUser.permission_level = newPermission;
    await this.tripUserRepository.save(tripUser);

    return 'Permission Updated';
  }


  // Delete user permission for a specific trip
async deleteUserPermission(tripUser: TripUsers) {
    if (tripUser.permission_level === "Manager")
        return "Could not delete the Manager of the trip"
  
    // Delete the user permission from the trip
    await this.tripUserRepository.remove(tripUser);
  
    return 'User Permission Deleted';
  }
  

}
