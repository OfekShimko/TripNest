import express, { Request, Response } from 'express';
import axios from 'axios'; // Assuming axios is already installed
import dotenv from 'dotenv';
import { getActivitiesByCity } from '../opentripmap';  // Correct import path


dotenv.config(); // Load .env variables

const router = express.Router();

// Define the route to get activities by city
router.get('/activities', async (req: Request, res: Response) => {
  const city = req.query.city as string || 'Tel Aviv';  // Default to 'Tel Aviv' if no city is provided

  try {
    const activities = await getActivitiesByCity(city);  // Fetch activities using predefined coordinates
    res.json(activities);  // Return the activities to the client
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).send('Error fetching activities');
  }
});

export { router };
