import express, { Request, Response, NextFunction } from 'express';
import { Trip } from '../entities/Trip'; // Import Trip entity
import { AppDataSource } from '../database'; // Import DataSource

export const router = express.Router();
const tripRepository = AppDataSource.getRepository(Trip);

// Helper function to wrap async route handlers
const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};


// GET all trips
router.get('/', async (req: Request, res: Response) => {
  try {
    // Use TypeORM to fetch all trips from the trips table
    const trips = await AppDataSource.getRepository(Trip).find(); // Finds all trips
    res.status(200).json(trips);
  } catch (err) {
    console.error('Error fetching trips:', err);
    res.status(500).send('Failed to fetch trips');
  }
});


// GET route to retrieve a specific trip by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const trip = await tripRepository.findOneBy({ id: parseInt(id) });

  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }

  res.status(200).json(trip);
}));


// POST route to insert a new trip
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { destination, date, description } = req.body;

    // Ensure request body validation is correct
    if (!destination || !date || !description) {
      return res.status(400).json({ message: 'Destination, date, and description are required.' });
    }

    // Create and save the trip
    const newTrip = tripRepository.create({
      destination,
      date,
      description,
    });
    const savedTrip = await tripRepository.save(newTrip);

    // Respond with the full trip object
    res.status(201).json(savedTrip);
  })
);


// PUT route to make changes on a specific trip by an id.
router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates: Partial<Omit<Trip, 'id' | 'users' | 'activities'>> = req.body;

    // Convert id to a number
    const tripId = parseInt(id, 10);
    if (isNaN(tripId)) {
      return res.status(400).json({ message: 'Invalid trip ID' });
    }

    // Find the trip by ID
    const trip = await tripRepository.findOne({ where: { id: tripId } });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Merge updates into the existing trip entity
    Object.assign(trip, updates);
    const updatedTrip = await tripRepository.save(trip);


    res.status(200).json(updatedTrip);
  })
);


// DELETE route to remove a specific trip by ID
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const trip = await tripRepository.findOneBy({ id: parseInt(id) });

  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }

  await tripRepository.remove(trip);
  res.status(200).json({ message: 'Trip deleted successfully' });
}));


// GET route for searching trips based on criteria
router.get('/search', asyncHandler(async (req: Request, res: Response) => {
  const { destination, date, description } = req.query;

  const whereConditions: any = {};

  if (destination) whereConditions.destination = `%${destination}%`;
  if (date) whereConditions.date = date;
  if (description) whereConditions.description = `%${description}%`;


  const trips = await tripRepository.find({
    where: whereConditions,
  });

  if (trips.length === 0) {
    return res.status(404).json({ message: 'No trips found matching the criteria' });
  }

  res.status(200).json(trips);
}));
