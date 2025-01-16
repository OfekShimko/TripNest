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

// old code
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
// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));




// fetch default activities

// const fetchWithRateLimit = async (xids: string[]) => {
//   const activities = [];
//   for (const xid of xids) {
//     try {
//       const activity = await getActivityByXid(xid);
//       activities.push(activity);
//       await delay(500); // Adjust delay time between calls
//     } catch (error) {
//       console.error(`Error fetching activity for XID ${xid}:`, error);
//       activities.push(null); // Push null to maintain array structure
//     }
//   }
//   return activities;
// };

// router.get('/', async (req: Request, res: Response) => {
//   const location = req.query.location as string || 'New York'; // Default location
//   console.log('Requested location:', location);

//   try {
//     const defaultXids = ['W219292804', 'N681553665', 'W43888180', 'Q5639048', 'Q12410485', 'N2645430237', 'W44285817', 'N1731465814', 'Q2918780', 'Q632602', 'Q12016578', 'N1669839900'];
//     console.log('Default XIDs:', defaultXids);

//     // Fetch default activities
//     const defaultActivities = await fetchWithRateLimit(defaultXids);

//     console.log('Fetched default activities:', defaultActivities);

//     // Remove null/undefined entries with proper type guard
//     const validDefaultActivities = defaultActivities.filter(
//       (activity): activity is ActivityDetails => activity !== null && activity !== undefined
//     );
//     console.log('Valid default activities:', validDefaultActivities);

//     // Fetch activities dynamically by city
//     const activities = await getActivitiesByCity(location);
//     console.log('Fetched activities by city:', activities);

//     const filteredActivities = activities.filter((activity: any) => activity && Object.keys(activity).length > 0);

//     // Remove duplicates by xid
//     const uniqueActivities = filteredActivities.filter(
//       (activity: any) => !validDefaultActivities.some((defaultActivity) => defaultActivity!.xid === activity.xid)
//     );

//     // Combine default and unique activities
//     const resultActivities = [...validDefaultActivities, ...uniqueActivities];
//     console.log('Final combined activities:', resultActivities);

//     res.json(resultActivities);
//   } catch (error) {
//     console.error('Error fetching activities:', error);
//     res.status(500).send('Error fetching activities');
//   }
// });





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