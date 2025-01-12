import express, { Request, Response, NextFunction } from 'express';
import { TripService } from './tripService';
import { Trip } from '../../db/entities/Trip';

export const tripRouter = express.Router();

// Helper function to wrap async route handlers
const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const tripService = new TripService();

// GET all trips with permission check
tripRouter.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user_id = req.query.userId as string;

  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ message: "User id is required and must be a valid string." });
  }

  try {
    // Fetch all trips
    const trips = await tripService.getTrips(user_id);
    
    // Check if user has any permission for each trip
    const tripsWithPermission = [];
    for (const trip of trips) {
      // Assuming that `getUserPermissionForTrip` checks user's permission for a specific trip
      const permission = await tripService.getUserPermissionForTrip(trip.id, user_id);
      
      if (permission) {
        // User has some permission, add to the result
        tripsWithPermission.push({ trip, permission });
      }
    }

    if (tripsWithPermission.length === 0) {
      return res.status(404).json({ message: 'You do not have permission for any trips.' });
    }

    // Respond with trips and their permissions
    res.status(200).json(tripsWithPermission);
  } catch (err) {
    console.error('Error fetching trips:', err);
    res.status(500).send('Failed to fetch trips');
  }
}));

// Fetch specific trip by id with permission check
tripRouter.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params; // Get trip ID from the request params
  const user_id = req.query.userId as string; // Get user ID from the request query

  console.log('Fetching trip for id:', id);

  // Check if user_id is provided
  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ message: `User id is required and must be a valid string.` });
  }

  try {
    // Fetch the trip by ID
    const trip = await tripService.getTripById(id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if the user has any permission for this trip
    const permission = await tripService.getUserPermissionForTrip(id, user_id);

    if (!permission) {
      return res.status(403).json({ message: 'You do not have permission to view this trip' });
    }

    // If user has permission, send the trip details
    res.status(200).json(trip);
  } catch (err) {
    console.error('Error fetching trip:', err);
    res.status(500).send('Failed to fetch trip');
  }
}));

// POST route to create a new trip with permission assignment
tripRouter.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { title, description, location, from_date, to_date } = req.body;
  const user_id = req.query.userId as string;

  // Validate input
  if (!title || !description || !location || !from_date || !to_date || !user_id) {
    return res.status(400).json({
      message: 'title, description, location, from_date, to_date, and user_id are required.'
    });
  }
  
  const trip = { title, description, location, from_date, to_date };
  try {
    const savedTrip = await tripService.createTrip(trip, user_id);
    res.status(201).json(savedTrip);
  } catch (err) {
    console.error('Error creating trip:', err);
    res.status(500).send('Failed to create trip');
  }
}));

// PUT /:id
tripRouter.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {...updates } = req.body; // separate user_id from other fields
  const user_id = req.query.userId as string; // Get user ID from the request query

  if (!user_id) {
    return res.status(400).json({ message: 'user_id is required to update trip.' });
  }
  // Check if the user has permission to modify the trip
  const tripUser = await tripService.getUserPermissionForTrip(id, user_id);
  const userPermission = tripUser?.permission_level;
  if (!tripUser || (userPermission !== 'Manager' && userPermission !== 'Editor')) {
    return res.status(403).json({ message: 'Forbidden: You do not have permission to modify this trip' });
  }
  try {
    const result = await tripService.updateTrip(id, updates);
    if (result === null) {
      return res.status(404).json({ message: 'Trip not found' });
    } else {
      res.status(200).json(result);
    }
  } catch (err) {
    console.error('Error updating trip:', err);
    res.status(500).send('Failed to update trip');
  }
}));

// DELETE /:id
tripRouter.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user_id = req.query.userId as string; // Get user ID from the request query

  if (!user_id) {
    return res.status(400).json({ message: 'user_id is required to delete trip.' });
  }

  // Check if the user has permission to modify the trip
  const tripUser = await tripService.getUserPermissionForTrip(id, user_id);
  const userPermission = tripUser?.permission_level
  if (!tripUser || (userPermission !== 'Manager')) {
    return res.status(403).json({ message: 'Forbidden: You do not have permission to modify this trip' });
  }

  try {
    const result = await tripService.deleteTrip(id);
    if (result === 'NotFound') {
      return res.status(404).json({ message: 'Trip not found' });
    } else if (result === 'Success') {
      res.status(200).json({ message: 'Trip and associated activities deleted successfully' });
    } else {
      res.status(500).json({ message: 'Error deleting trip and activities' });
    }
  } catch (err) {
    console.error('Error deleting trip:', err);
    res.status(500).send('Failed to delete trip');
  }
}));

// Search trip by title/location/from_date/to_date
tripRouter.post('/search', asyncHandler(async (req: Request, res: Response) => {
  const { title, location, from_date, to_date } = req.query;
  const user_id = req.query.userId as string;
  
  if (!user_id) {
    return res.status(400).json({ message: 'Invalid request, user_id is required' });
  }

  console.log({ title, location, from_date, to_date });

  const trips = await tripService.searchTrips({ title, location, from_date, to_date }, user_id);

  if (trips.length === 0) {
    return res.status(404).json({ message: 'No trips found matching the criteria' });
  }

  res.status(200).json(trips);
}));

// Define a route to add activities to a trip
tripRouter.post('/:trip_id/add-activity', asyncHandler(async (req: Request, res: Response) => {
  const { trip_id } = req.params;  // Get trip_id from route params
  const { xid } = req.body; 
  const user_id = req.query.userId as string;        // Expect a single xid string from the request body

  // Check if xid is provided and is a valid string
  if (!xid || typeof xid !== 'string') {
    return res.status(400).json({ message: 'Invalid request, xid must be a string' });
  }

  if (!user_id || typeof user_id !== 'string'){
    return res.status(400).json({ message: 'Invalid request, user_id must to be a string and in query.param' });
  }

  // Check if the user has permission to modify the trip
  const tripUser = await tripService.getUserPermissionForTrip(trip_id, user_id);
  const userPermission = tripUser?.permission_level
  if (!userPermission || (userPermission !== 'Manager' && userPermission !== 'Editor')) {
    return res.status(403).json({ message: 'Forbidden: You do not have permission to modify this trip' });
  }

  const result = await tripService.addActivityToTrip(trip_id, xid);

  if (result === 'TripNotFound') {
    return res.status(404).json({ message: 'Trip not found' });
  } else if (result === 'ActivityExists') {
    return res.status(400).json({ message: 'This xid is already associated with the trip' });
  } else {
    res.status(201).json({ message: 'Activity added to trip', activity: result });
  }
}));

// Define a route to get all activities for a specific trip by trip_id
tripRouter.get('/:trip_id/activities', asyncHandler(async (req: Request, res: Response) => {
  console.log('Fetching activities for trip_id:', req.params.trip_id);
  const { trip_id } = req.params;
  const user_id = req.query.userId as string;

  if (!user_id || typeof user_id !== 'string'){
    return res.status(400).json({ message: 'Invalid request, user_id must to be a string and in query.param' });
  }

  const trip = await tripService.getTripById(trip_id);

  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }
  // Check if the user has permission for the trip
  const userPermission = await tripService.getUserPermissionForTrip(trip_id, user_id);

  if (!userPermission) {
    return res.status(403).json({ message: 'Forbidden: User does not have permission for this trip' });
  }
  const activities = await tripService.getTripActivities(trip_id);

  res.status(200).json({ trip, activities });
}));

// Define a route to remove activities from a trip by xid
tripRouter.delete('/:trip_id/activities', asyncHandler(async (req: Request, res: Response) => {
  const { trip_id } = req.params;  // Get trip_id from route params
  const { xid } = req.body;        // Expect xid string to be deleted
  const user_id = req.query.userId as string;

  // Check if xid is provided and is a valid string
  if (!xid || typeof xid !== 'string') {
    return res.status(400).json({ message: 'Invalid request, xid must be a string' });
  }

  if (!user_id || typeof user_id !== 'string'){
    return res.status(400).json({ message: 'Invalid request, user_id must to be a string and in query.param' });
  }

  // Check if the trip exists
  const trip = await tripService.getTripById(trip_id);

  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }

  // Check user's permission for the trip
  const tripUser = await tripService.getUserPermissionForTrip(trip_id, user_id);
  const userPermission = tripUser?.permission_level
  if (!tripUser || (userPermission !== 'Manager' && userPermission !== 'Editor')) {
    return res.status(403).json({ message: 'Forbidden: User does not have sufficient permissions to remove activities' });
  }

  const result = await tripService.removeActivityFromTrip(trip_id, xid);

  if (result === 'TripNotFound') {
    return res.status(404).json({ message: 'Trip not found' });
  } else if (result === 'ActivityNotFound') {
    return res.status(404).json({ message: 'Activity not found for this trip' });
  } else {
    res.status(200).json({ message: 'Activity removed from trip' });
  }
}));

// Define a route to add permissions to users for a trip
tripRouter.post("/:trip_id/add-permission",asyncHandler(async (req: Request, res: Response) => {
  const { trip_id } = req.params;
  const { email, permission } = req.body;
  const user_id = req.query.userId as string;

  try {
    if (!email || !permission || !user_id) {
      return res.status(400).json({ message: 'Invalid request, user_email, permission and user_id are required' });
    }
      
    if (typeof email !== "string") {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!["Editor", "Viewer"].includes(permission)) {
      return res.status(400).json({ message: "Only Editor or Viewer roles are allowed" });
    }

    if (typeof user_id !== "string") {
      return res.status(400).json({ message: "Invalid user_id format" });
    }

    // Check if the user has Manager permission for the trip
    const tripUser = await tripService.getUserPermissionForTrip(trip_id, user_id);
    const userPermission = tripUser?.permission_level
    if (!tripUser || userPermission !== "Manager") {
      return res.status(403).json({ message: "Forbidden: Only users with Manager permission can add permissions to this trip" });
    }

    const newPermission = await tripService.addPermissionToTrip(trip_id, email, permission);
    res.status(201).json({ message: "Permission added successfully", permission: newPermission });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
  }));

tripRouter.post('/:trip_id/change-permission', asyncHandler(async (req: Request, res: Response) => {
  const { trip_id } = req.params;
  const { email, new_permission } = req.body; // user_email and new_permission are expected in the request body
  const user_id = req.query.userId as string;

  if (!email || !new_permission || !user_id) {
    return res.status(400).json({ message: 'Invalid request, user_email, new_permission and user_id are required' });
  }
  
  if (typeof email !== "string") {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!["Editor", "Viewer"].includes(new_permission)) {
    return res.status(400).json({ message: "Only Editor or Viewer roles are allowed" });
  }

  if (typeof user_id !== "string") {
    return res.status(400).json({ message: "Invalid user_id format" });
  }

  // Check if the user has Manager permission for the trip
  const tripUser = await tripService.getUserPermissionForTrip(trip_id, user_id);
  const userPermission = tripUser?.permission_level
  if (!tripUser || userPermission !== "Manager") {
    return res.status(403).json({ message: "Forbidden: Only users with Manager permission can change permissions for this trip" });
  }

  const result = await tripService.changeUserPermission(trip_id, email, new_permission);

  if (result != 'Permission Updated') {
    return res.status(404).json({ message: result });
  }

  return res.status(200).json({ message: result });
}));

tripRouter.delete('/:trip_id/delete-permission', asyncHandler(async (req: Request, res: Response) => {
  const { trip_id } = req.params;
  const { email } = req.body; // user_email is expected in the request body
  const user_id = req.query.userId as string;

  if (!email || !user_id) {
    return res.status(400).json({ message: 'Invalid request, user_email and user_id are required' });
  }

  if (typeof email !== "string") {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (typeof user_id !== "string") {
    return res.status(400).json({ message: "Invalid user_id format" });
  }

  // Check if the user has Manager permission for the trip
  const tripUser = await tripService.getUserPermissionForTrip(trip_id, user_id);
  const userPermission = tripUser?.permission_level
  if (!tripUser || userPermission !== "Manager") {
    return res.status(403).json({ message: "Forbidden: Only users with Manager permission can delete permissions for this trip" });
  }

  const result = await tripService.deleteUserPermission(trip_id, email);

  if (result != "User Permission Deleted") {
    return res.status(404).json({ message: result });
  }

  return res.status(200).json({ message: result });
}));


tripRouter.get('/:trip_id/permissions', asyncHandler(async (req: Request, res: Response) => {
  const { trip_id } = req.params;

  const usersPermission = await tripService.getAllUserIdPermissions(trip_id);

  if (!usersPermission) {
    return res.status(404).json({ message: usersPermission });
  }

  return res.status(200).json({ message: usersPermission });
}));
