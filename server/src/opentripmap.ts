import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { ActivityDetails , OpenTripMapResponse , WikipediaSummaryResponse  } from './interfaces'; // Adjust the path based on where the interfaces file is located
import { config } from '../config';
import { isrCoordinates, usaCoordinates } from './coordinates'


const cityCoordinates = {...isrCoordinates, ...usaCoordinates}

// Fetch detailed activity info by xid
export const getActivityByXid = async (xid: string): Promise<ActivityDetails | null> => {
  const API_KEY = config.opentripApiKey;

  try {
    const response = await axios.get(`https://api.opentripmap.com/0.1/en/places/xid/${xid}`, {
      params: { apikey: API_KEY },
    });

    const activity = response.data as ActivityDetails;
    const title = activity.wikipedia?.split('/').pop(); // Extract title from Wikipedia URL

    let wikipediaInfo = {
      summary: '',
      thumbnail: 'default_thumbnail_url',
      pageUrl: activity.wikipedia || '',
    };

    if (title) {
      wikipediaInfo = await fetchWikipediaSummary(title);
    }

    return {
      xid: activity.xid,
      name: activity.name || 'No name provided',
      description: activity.description || wikipediaInfo.summary || 'No description available',
      image_url: activity.image_url || wikipediaInfo.thumbnail,
      kinds: activity.kinds || 'Unknown',
      wikipedia: wikipediaInfo.pageUrl || 'No Wikipedia link',
    };
  } catch (error) {
    console.error(`Error fetching details for activity ID ${xid}:`, error);
    return null;  // Return null if the activity cannot be fetched
  }
};


  
  
export const getActivitiesByCity = async (city: string, type?: string, popularity?: string) => {
    const cityData = cityCoordinates[city];
    const API_KEY = config.opentripApiKey;
    if (!cityData) {
      throw new Error(`City '${city}' not found in coordinates.`);
    }
  
    const { lat, lon } = cityData;
  
    try {
      const response = await axios.get<OpenTripMapResponse>('https://api.opentripmap.com/0.1/en/places/radius', {
        params: {
          lat,
          lon,
          radius: 5000,
          types: type || 'interesting_places',
          apikey: API_KEY,
          limit: 20,
          offset:0
        }
      });
  
      // Fetch detailed info for each activity
      const activities = await Promise.all(
        response.data.features.map(async (item) => {
          const activityDetails = await fetchActivityDetails(item.properties.xid);
          return activityDetails;
        })
      );
  
  
      return activities; // Return the activities array with detailed info
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
};




const fetchActivityDetails = async (activityId: string): Promise<ActivityDetails> => {
  const API_KEY = config.opentripApiKey;

  try {
    const response = await axios.get(`https://api.opentripmap.com/0.1/en/places/xid/${activityId}`, {
      params: { apikey: API_KEY },
    });

    const activity = response.data as ActivityDetails;
    const title = activity.wikipedia?.split('/').pop(); // Extract title from Wikipedia URL

    let wikipediaInfo = {
      summary: '',
      thumbnail: 'default_thumbnail_url',
      pageUrl: activity.wikipedia || '',
    };

    if (title) {
      wikipediaInfo = await fetchWikipediaSummary(title);
    }

    return {
      xid: activity.xid,
      name: activity.name || 'No name provided',
      description: activity.description || wikipediaInfo.summary || 'No description available',
      image_url: activity.image_url || wikipediaInfo.thumbnail,
      kinds: activity.kinds || 'Unknown',
      wikipedia: wikipediaInfo.pageUrl || 'No Wikipedia link',
    };
  } catch (error) {
    console.error(`Error fetching details for activity ID ${activityId}:`, error);
    return {} as ActivityDetails;
  }
};




const fetchWikipediaSummary = async (title: string) => {
    try {
      const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
      const data = response.data as WikipediaSummaryResponse;
  
      return {
        summary: data.extract,
        thumbnail: data.thumbnail?.source || 'default_thumbnail_url',
        pageUrl: data.content_urls?.desktop?.page || '',
      };
    } catch (error) {
      console.error(`Error fetching Wikipedia summary for title ${title}:`, error);
      return {
        summary: 'No summary available',
        thumbnail: 'default_thumbnail_url',
        pageUrl: '',
      };
    }
  };





