import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios'; // Assuming axios is already installed
import dotenv from 'dotenv';
import { getActivitiesByCity, getActivityByXid  } from '../opentripmap';  // Correct import path


dotenv.config(); // Load .env variables

const router = express.Router();

// Helper function to wrap async route handlers
const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};



// Define the route to get activities by city
router.get('/', async (req: Request, res: Response) => {
  const location = req.query.location as string || 'Tel Aviv';  // Default to 'Tel Aviv' if no location is provided

  try {
    const activities = await getActivitiesByCity(location);  // Fetch activities using predefined coordinates for the location
    res.json(activities);  // Return the activities to the client
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).send('Error fetching activities');
  }
});



// Define the route to get an activity by its xid
router.get('/:xid', asyncHandler(async (req: Request, res: Response) => {
  const { xid } = req.params;  // Extract the xid from the URL parameter

  try {
    const activity = await getActivityByXid(xid);  // Fetch the activity by its xid
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.status(200).json(activity);  // Return the activity to the client
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).send('Error fetching activity');
  }
}));


export { router };