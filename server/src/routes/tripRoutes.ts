import express, { Request, Response, NextFunction } from 'express';
import { Trip } from '../entities/Trip'; // Import Trip entity
import { AppDataSource } from '../database'; // Import DataSource
import { TripUsers } from '../entities/TripUsers';

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

// GET a specific trip by title
router.get('/:title',asyncHandler(async (req: Request, res: Response) => {
    const { title } = req.params;
    const trip = await tripRepository.findOneBy({ title });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.status(200).json(trip);
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

  // Check if the trip with the same title already exists
  const existingTrip = await tripRepository.findOne({
    where: { title }, // Search for trip with the same title
  });

  if (existingTrip) {
    return res.status(400).json({
      message: 'A trip with this title already exists.',
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


// PUT route to update a trip by title
router.put('/:title', asyncHandler(async (req: Request, res: Response) => {
    const { title } = req.params;
    const { user_email } = req.body; // Assume user_email is passed to verify permissions

    const trip = await tripRepository.findOneBy({ title });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is associated with the trip and has the correct permission
    const tripUserRepository = AppDataSource.getRepository(TripUsers);
    const tripUser = await tripUserRepository.findOne({
      where: { trip_id: trip.id, user_email },
    });

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

// DELETE a specific trip by ID
router.delete('/:title', asyncHandler(async (req: Request, res: Response) => {
  const { title } = req.params;
  const { user_email } = req.body;

  const trip = await tripRepository.findOneBy({ title });

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
    await queryRunner.manager.delete(TripUsers, { trip_id: trip.id });
    await queryRunner.manager.delete(Trip, { title });

    await queryRunner.commitTransaction();
    res.status(200).json({ message: 'Trip deleted successfully' });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error deleting trip:', error);
    res.status(500).json({ message: 'Error deleting trip' });
  } finally {
    await queryRunner.release();
  }
}));

router.post('/search', asyncHandler(async (req: Request, res: Response) => {
  console.log("Search route hit"); // Check if this logs
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

  // Log the generated query for debugging
  console.log(queryBuilder.getQuery());
  
  const trips = await queryBuilder.getMany();

  if (trips.length === 0) {
    return res.status(404).json({ message: 'No trips found matching the criteria' });
  }

  res.status(200).json(trips);
}));
