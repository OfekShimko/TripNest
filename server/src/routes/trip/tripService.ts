import { getActivityByXid } from "../../opentripmap";
import { Trip } from "../../db/entities/Trip";
import { AppDataSource } from "../../db/database_init";
import { TripDal, TripUserDal, UnsavedTrip } from "../../db";
import { TripActivities } from "../../db/entities/TripActivities";
import { QueryRunner } from "typeorm";

export class TripService {
  tripDal = new TripDal();
  tripUserDal = new TripUserDal();

  async getTrips(userId: string) {
    const trips = await this.tripDal.getTripsForUser(userId);
    return trips;
  }

  async getTripById(id: string) {
    const trip = await this.tripDal.getTripById(id);
    console.log("Trip queried:", trip);
    return trip;
  }

  async createTrip(trip: UnsavedTrip, email: string) {
    const savedTrip = await this.tripDal.createTrip(trip);
    await this.tripUserDal.createTripUser(savedTrip, email);
    return savedTrip;
  }

  async updateTrip(id: string, updates: Partial<Trip>, user_email: string) {
    const trip = await this.tripDal.getTripById(id);
    if (!trip) {
      return null;
    }

    // Check if user is associated with the trip and has the correct permission
    const tripUser = await this.tripDal.findTripUser(id, user_email);

    if (!tripUser || tripUser.permission_level !== 'Manager') {
      return 'Forbidden';
    }

    // Merge updates and save
    Object.assign(trip, updates);
    const updatedTrip = await this.tripDal.updateTrip(trip);
    return updatedTrip;
  }

  async deleteTrip(id: string, user_email: string) {
    const trip = await this.tripDal.getTripById(id);
    if (!trip) {
      return 'NotFound';
    }

    // Check if user has 'Manager' permission
    const tripUser = await this.tripDal.findTripUser(trip.id, user_email);

    if (!tripUser || tripUser.permission_level !== 'Manager') {
      return 'Forbidden';
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

  async searchTrips(filters: any) {
    const trips = await this.tripDal.searchTrips(filters);
    return trips;
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
}
