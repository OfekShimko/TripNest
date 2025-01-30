import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios'; 
import { getActivitiesByCity, getActivityByXid } from '../opentripmap';  
import { ActivityDetails  } from '../interfaces'; 

const router = express.Router();

// Helper function to wrap async route handlers
const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


// Define the route to get activities by city
router.get('/', async (req: Request, res: Response) => {
  const location = req.query.location as string || 'New York';  // Default to 'New York' if no location is provided

  try {
    const activities = await getActivitiesByCity(location);  // Fetch activities using predefined coordinates for the location
    const filteredActivities = activities.filter((activity: any) => activity && Object.keys(activity).length > 0);

    res.json(filteredActivities);
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