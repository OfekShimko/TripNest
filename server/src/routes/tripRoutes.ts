import express, { Request, Response, NextFunction } from 'express';
import { Trip } from '../entities/Trip'; // Import Trip entity
import { AppDataSource } from '../database'; // Import DataSource
import { TripUsers } from '../entities/TripUsers';
import { TripActivities } from '../entities/TripActivities';

export const router = express.Router();
const tripRepository = AppDataSource.getRepository(Trip);

// Helper function to wrap async route handlers
const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// GET all trips
router.get('/', asyncHandler(async (req: Request, res: Response) => {
    try {
          // Use TypeORM to fetch all trips from the trips table
        const trips = await tripRepository.find(); // Finds all trips
        res.status(200).json(trips);
    } catch (err) {
      console.error('Error fetching trips:', err);
      res.status(500).send('Failed to fetch trips');
    }
  })
);

// GET trip by trip_id
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log('Fetching trip for id:', id);
  try {
        // Use TypeORM to fetch all trips from the trips table
      const trip = await tripRepository.findOneBy({ id }); // Finds all trips
      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }
  } catch (err) {
    console.error('Error fetching trip:', err);
    res.status(500).send('Failed to fetch trip');
  }
})
);

// POST route to create a new trip with permission assignment
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { title, description, location, from_date, to_date, user_email } = req.body;

  // Validate input
  if (!title || !description || !location || !from_date || !to_date || !user_email) {
    return res.status(400).json({
      message: 'Title, description, location, from_date, to_date, and user_email are required.',
    });
  }

  // Create the trip
  const newTrip = tripRepository.create({
    id: crypto.randomUUID(),
    title,
    description,
    location,
    from_date: new Date(from_date),
    to_date: new Date(to_date),
  });
  const savedTrip = await tripRepository.save(newTrip);

  // Assign the user with appropriate permission (for example, Manager)
  const tripUserRepository = AppDataSource.getRepository(TripUsers);
  const tripUser = tripUserRepository.create({
    trip: savedTrip,
    user_email,
    permission_level: 'Manager', // Defaulting to Manager role here
  });
  await tripUserRepository.save(tripUser);

  res.status(201).json(savedTrip);
})
);


// PUT route to update a trip by id
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { user_email } = req.body; // Assume user_email is passed to verify permissions

    const trip = await tripRepository.findOneBy({ id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is associated with the trip and has the correct permission
    const tripUserRepository = AppDataSource.getRepository(TripUsers);
    const tripUser = await tripUserRepository.findOne({
      where: { trip_id: id, user_email }});

    if (!tripUser || tripUser.permission_level !== 'Manager') {
      return res.status(403).json({ message: 'You do not have permission to edit this trip' });
    }

    // Merge updates and save
    const updates: Partial<Trip> = req.body;
    Object.assign(trip, updates);
    const updatedTrip = await tripRepository.save(trip);

    res.status(200).json(updatedTrip);
  })
);

// DELETE a specific trip by trip_id
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user_email } = req.body;

  // Find the trip by id
  const trip = await tripRepository.findOneBy({ id });

  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }

  // Check if the user has 'Manager' permission
  const tripUserRepository = AppDataSource.getRepository(TripUsers);
  const tripUser = await tripUserRepository.findOne({
    where: { trip_id: trip.id, user_email },
  });

  if (!tripUser || tripUser.permission_level !== 'Manager') {
    return res.status(403).json({ message: 'You do not have permission to delete this trip' });
  }

  // Perform deletion in a transaction
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    // 1. Delete associated activities
    await queryRunner.manager.delete(TripActivities, { trip_id: id });

    // 2. Delete the trip users
    await queryRunner.manager.delete(TripUsers, { trip_id: id });

    // 3. Delete the trip itself
    await queryRunner.manager.delete(Trip, { id });

    // Commit the transaction
    await queryRunner.commitTransaction();
    res.status(200).json({ message: 'Trip and associated activities deleted successfully' });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error deleting trip and activities:', error);
    res.status(500).json({ message: 'Error deleting trip and activities' });
  } finally {
    await queryRunner.release();
  }
}));

// Search trip by title/location/from_date/to_date
router.post('/search', asyncHandler(async (req: Request, res: Response) => {
  const { title, location, from_date, to_date } = req.query;
  
  console.log({ title, location, from_date, to_date });
  const queryBuilder = tripRepository.createQueryBuilder('trip');

  if (title) {
    queryBuilder.andWhere('trip.title LIKE :title', { title: `%${title}%` });
  }

  if (location) {
    queryBuilder.andWhere('trip.location LIKE :location', { location: `%${location}%` });
  }

  if (from_date) {
    queryBuilder.andWhere('trip.from_date >= :from_date', { from_date });
  }

  if (to_date) {
    queryBuilder.andWhere('trip.to_date <= :to_date', { to_date });
  }

  const trips = await queryBuilder.getMany();

  if (trips.length === 0) {
    return res.status(404).json({ message: 'No trips found matching the criteria' });
  }

  res.status(200).json(trips);
}));


// Define a route to add activities to a trip
router.post('/:trip_id/add-activity', asyncHandler(async (req: Request, res: Response) => {
  const { trip_id } = req.body;  // Expect trip_id from the request body
  const { xid } = req.body;      // Expect a single xid string from the request body

  // Check if xid is provided and is a valid string
  if (!xid || typeof xid !== 'string') {
    return res.status(400).json({ message: 'Invalid request, xid must be a string' });
  }

  const tripActivitiesRepository = AppDataSource.getRepository(TripActivities);
  
  // Find the trip by ID
  const trip = await tripRepository.findOne({ where: { id: trip_id }});
  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }

  try {
    // Find existing activities for the trip
    const existingActivities = await tripActivitiesRepository.find({
      where: { trip_id }
    });

    // Collect the existing xids of the activities
    const existingXids = existingActivities.map(activity => activity.xid);

    // Check if the xid is already in the existing activities
    if (existingXids.includes(xid)) {
      return res.status(400).json({ message: 'This xid is already associated with the trip' });
    }

    // Create a new activity entry
    const activity = new TripActivities();
    activity.xid = xid;
    activity.trip_id = trip_id;
    activity.trip = trip;

    // Save the new activity
    await tripActivitiesRepository.save(activity);

    // Return a success message with the added activity
    res.status(201).json({ message: 'Activity added to trip', activity });
  } catch (error) {
    console.error('Error saving activity:', error);
    res.status(500).json({ message: 'Error saving activity' });
  }
}));

// Define a route to get all activities for a specific trip by trip_id
router.get('/:trip_id/activities', asyncHandler(async (req: Request, res: Response) => {
  console.log('Fetching activities for trip_id:', req.params.trip_id);
  const { trip_id } = req.params;

  const tripActivitiesRepository = AppDataSource.getRepository(TripActivities);

  // Find the trip by ID and include its activities
  const trip = await tripRepository.findOne({where : {id: trip_id}});

  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }

  // Alternatively, fetch activities separately if you didn't load relations
  const activities = await tripActivitiesRepository.find({
    where: { trip_id },
  });

  res.status(200).json({ trip, activities });
}));

// Define a route to remove activities from a trip by xid
router.delete('/:trip_id/activities', asyncHandler(async (req: Request, res: Response) => {
  const { trip_id } = req.body;  // Expect trip_id from the request body
  const { xid } = req.body;      // Expect xid string to be deleted

  // Check if xid is provided and is a valid string
  if (!xid || typeof xid !== 'string') {
    return res.status(400).json({ message: 'Invalid request, xid must be a string' });
  }

  const tripActivitiesRepository = AppDataSource.getRepository(TripActivities);
  
  // Find the trip by ID
  const trip = await tripRepository.findOne({ where: { id: trip_id }});
  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }

  try {
    // Find the activity with the specific xid for this trip
    const activity = await tripActivitiesRepository.findOne({ where: { trip_id, xid } });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found for this trip' });
    }

    // Remove the activity
    await tripActivitiesRepository.remove(activity);

    // Return a success message
    res.status(200).json({ message: 'Activity removed from trip' });
  } catch (error) {
    console.error('Error removing activity:', error);
    res.status(500).json({ message: 'Error removing activity' });
  }
}));
