import { getActivityByXid } from "../../opentripmap";
import { Trip } from "../../db/entities/Trip";
import { AppDataSource } from "../../db/database_init";
import { TripDal, TripUserDal, UnsavedTrip, UserDal } from "../../db";
import { TripActivities } from "../../db/entities/TripActivities";
import { QueryRunner } from "typeorm";

export class TripService {
  tripDal = new TripDal();
  tripUserDal = new TripUserDal();
  userDal = new UserDal();

  async getTrips(userId: string) {
    const trips = await this.tripDal.getTripsForUser(userId);
    return trips;
  }

  async getTripById(id: string) {
    const trip = await this.tripDal.getTripById(id);
    console.log("Trip queried:", trip);
    return trip;
  }

  async createTrip(trip: UnsavedTrip, user_id: string) {
    const savedTrip = await this.tripDal.createTrip(trip);
    // Add the creator as a Manager for the trip
    await this.tripUserDal.createTripUser(savedTrip, user_id, 'Manager');
    return savedTrip;
  }

  async updateTrip(id: string, updates: Partial<Trip>) {
    const trip = await this.tripDal.getTripById(id);
    if (!trip) {
      return null;
    }

    // Merge updates and save
    Object.assign(trip, updates);
    const updatedTrip = await this.tripDal.updateTrip(trip);
    return updatedTrip;
  }

  async deleteTrip(id: string) {
    const trip = await this.tripDal.getTripById(id);
    if (!trip) {
      return 'NotFound';
    }

    // Perform deletion in a transaction
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // 1. Delete associated activities
      await this.tripDal.deleteTripActivities(id, queryRunner);

      // 2. Delete the trip users
      await this.tripDal.deleteTripUsers(id, queryRunner);

      // 3. Delete the trip itself
      await this.tripDal.deleteTrip(id, queryRunner);

      // Commit the transaction
      await queryRunner.commitTransaction();
      return 'Success';
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error deleting trip and activities:', error);
      return 'Error';
    } finally {
      await queryRunner.release();
    }
  }

  async searchTrips(filters: any, user_id: string) {
    const trips = await this.tripDal.searchTrips(filters);

    // Fetch the trips the user has permission to access
    const permittedTrips = await Promise.all(
      trips.map(async (trip) => {
        const tripUser = await this.tripUserDal.findTripUser(trip.id, user_id);
        return tripUser ? trip : null;
      })
    );

    // Filter out trips where the user has no permission
    return permittedTrips.filter((trip) => trip !== null);
  }

  async getUserPermissionForTrip(trip_id: string, user_id: string) {
    const tripUser = await this.tripUserDal.findTripUser(trip_id, user_id);
    if (!tripUser){
      return null;
    }
    return tripUser.permission_level; // Returns the TripUsers entity or null if not found
  }

  async addActivityToTrip(trip_id: string, xid: string) {
    // Find the trip by ID
    const trip = await this.tripDal.getTripById(trip_id);
    if (!trip) {
      return 'TripNotFound';
    }

    // Find existing activities for the trip
    const existingActivities = await this.tripDal.getTripActivities(trip_id);

    // Collect the existing xids of the activities
    const existingXids = existingActivities.map(activity => activity.xid);

    // Check if the xid is already in the existing activities
    if (existingXids.includes(xid)) {
      return 'ActivityExists';
    }

    // Create a new activity entry
    const activity = new TripActivities();
    activity.xid = xid;
    activity.trip_id = trip_id;
    activity.trip = trip;

    // Save the new activity
    const savedActivity = await this.tripDal.addTripActivity(activity);
    return savedActivity;
  }

  async getTripActivities(trip_id: string) {
    // Find the trip by ID
    const trip = await this.tripDal.getTripById(trip_id);
    if (!trip) {
      return null;
    }

    // Fetch the activity IDs (xids) associated with the trip
    const tripActivities = await this.tripDal.getTripActivities(trip_id);

    // If there are no activities, return an empty list
    if (!tripActivities.length) {
      return [];
    }

    // Extract xids from tripActivities
    const activityIds = tripActivities.map(activity => activity.xid);

    // Fetch detailed activity data for each xid
    const detailedActivities = await Promise.all(
      activityIds.map(async (xid) => {
        try {
          return await getActivityByXid(xid);
        } catch (err) {
          console.error(`Error fetching activity with xid ${xid}:`, err);
          return null; // Return null for failed fetches
        }
      })
    );

    // Filter out null results in case of failed fetches
    const filteredActivities = detailedActivities.filter(activity => activity !== null);

    return filteredActivities;
  }

  async removeActivityFromTrip(trip_id: string, xid: string) {
    // Find the trip by ID
    const trip = await this.tripDal.getTripById(trip_id);
    if (!trip) {
      return 'TripNotFound';
    }

    // Find the activity with the specific xid for this trip
    const activity = await this.tripDal.findTripActivity(trip_id, xid);

    if (!activity) {
      return 'ActivityNotFound';
    }

    // Remove the activity
    await this.tripDal.removeTripActivity(activity);

    return 'Success';
  }

  async addPermissionToTrip(trip_id: string, user_email: string, permission_level: 'Editor' | 'Viewer') {
    // Validate trip existence
    const trip = await this.tripDal.getTripById(trip_id);
    if (!trip) {
      throw new Error("Trip not found");
    }
    // Validate user existence
    const user = await this.userDal.getUserByEmail(user_email);
    if (!user) {
      throw new Error("User not found in the system");
    }
  
    // Check if the user already has a permission for the trip
    const existingTripUser = await this.tripUserDal.findTripUser(trip_id, user.id);
    if (existingTripUser) {
      throw new Error(`User already has permission: ${existingTripUser.permission_level}`);
    }

    console.log("trip : ",trip)
    console.log("user : ",user)
  
    // Add the new permission
    return await this.tripUserDal.createTripUser(trip, user.id, permission_level);
  }

  // Change user permission for a specific trip
  async changeUserPermission(trip_id: string, user_email: string, newPermission: 'Manager' | 'Editor' | 'Viewer') {
    // Validate trip existence
    const trip = await this.tripDal.getTripById(trip_id);
    if (!trip) {
      throw new Error("Trip not found");
    }
    // Validate user existence
    const user = await this.userDal.getUserByEmail(user_email);
    if (!user) {
      throw new Error("User not found in the system");
    }
    const tripUser = await this.tripUserDal.findTripUser(trip_id, user.id);
    if (!tripUser) {
      throw new Error("This user dont have permissions for this trip");
    }
    const result = await this.tripUserDal.updateUserPermission(tripUser, newPermission);
    
    return result;
  }

  // Delete user permission for a specific trip
  async deleteUserPermission(trip_id: string, user_email: string) {
    // Validate user existence
    const user = await this.userDal.getUserByEmail(user_email);
    if (!user) {
      throw new Error("User not found is the system");
    }
    const tripUser = await this.tripUserDal.findTripUser(trip_id, user.id);
    if (!tripUser) {
      throw new Error("This user dont have permissions for this trip");
    }
    const result = await this.tripUserDal.deleteUserPermission(tripUser);

    return result;
  }

  async getAllUserIdPermissions(trip_id: string) {
    // Validate user existence
    const users = await this.tripUserDal.findTripUsersAndPermissions(trip_id);
    if (!users) {
      throw new Error("Authorized users not found for this trip");
    }
    return users;
  }


}
