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

tripRouter.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ message: "User email is required to get trips." });
  }

  try {
      const trips = await tripService.getTrips(userId);
      res.status(200).json(trips);
  } catch (err) {
    console.error('Error fetching trips:', err);
    res.status(500).send('Failed to fetch trips');
  }
})
);

tripRouter.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log('Fetching trip for id:', id);
  try {
      const trip = await tripService.getTripById(id);

      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }

      res.status(200).json(trip);
  } catch (err) {
    console.error('Error fetching trip:', err);
    res.status(500).send('Failed to fetch trip');
  }
})
);

// POST route to create a new trip with permission assignment
tripRouter.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { title, description, location, from_date, to_date, user_email } = req.body;

  // Validate input
  if (!title || !description || !location || !from_date || !to_date || !user_email) {
    return res.status(400).json({
      message: 'Title, description, location, from_date, to_date, and user_email are required.',
    });
  }
  
  const trip = { title, description, location, from_date, to_date };
  const savedTrip = await tripService.createTrip(trip, user_email);

  res.status(201).json(savedTrip);
})
);

// PUT route to update a trip by id
tripRouter.put('/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { user_email } = req.body; 

    const updates: Partial<Trip> = req.body;

    const result = await tripService.updateTrip(id, updates, user_email);

    if (result === null) {
      return res.status(404).json({ message: 'Trip not found' });
    } else if (result === 'Forbidden') {
      return res.status(403).json({ message: 'You do not have permission to edit this trip' });
    } else {
      res.status(200).json(result);
    }
  })
);

// DELETE a specific trip by trip_id
tripRouter.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user_email } = req.body;

  const result = await tripService.deleteTrip(id, user_email);

  if (result === 'NotFound') {
    return res.status(404).json({ message: 'Trip not found' });
  } else if (result === 'Forbidden') {
    return res.status(403).json({ message: 'You do not have permission to delete this trip' });
  } else if (result === 'Success') {
    res.status(200).json({ message: 'Trip and associated activities deleted successfully' });
  } else {
    res.status(500).json({ message: 'Error deleting trip and activities' });
  }
}));

// Search trip by title/location/from_date/to_date
tripRouter.post('/search', asyncHandler(async (req: Request, res: Response) => {
  const { title, location, from_date, to_date } = req.query;
  
  console.log({ title, location, from_date, to_date });

  const trips = await tripService.searchTrips({ title, location, from_date, to_date });

  if (trips.length === 0) {
    return res.status(404).json({ message: 'No trips found matching the criteria' });
  }

  res.status(200).json(trips);
}));

// Define a route to add activities to a trip
tripRouter.post('/:trip_id/add-activity', asyncHandler(async (req: Request, res: Response) => {
  const { trip_id } = req.params;  // Get trip_id from route params
  const { xid } = req.body;        // Expect a single xid string from the request body

  // Check if xid is provided and is a valid string
  if (!xid || typeof xid !== 'string') {
    return res.status(400).json({ message: 'Invalid request, xid must be a string' });
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

  const trip = await tripService.getTripById(trip_id);

  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }

  const activities = await tripService.getTripActivities(trip_id);

  res.status(200).json({ trip, activities });
}));

// Define a route to remove activities from a trip by xid
tripRouter.delete('/:trip_id/activities', asyncHandler(async (req: Request, res: Response) => {
  const { trip_id } = req.params;  // Get trip_id from route params
  const { xid } = req.body;        // Expect xid string to be deleted

  // Check if xid is provided and is a valid string
  if (!xid || typeof xid !== 'string') {
    return res.status(400).json({ message: 'Invalid request, xid must be a string' });
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
