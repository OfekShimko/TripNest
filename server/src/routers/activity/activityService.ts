import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { ActivityDetails, OpenTripMapResponse, WikipediaSummaryResponse } from '../../interfaces'; // Adjust the path as needed


export class ActivityService {
  private apiKey: string;
  private cityCoordinates: Record<string, { lat: number; lon: number }>;
  private axiosInstance: Axios.AxiosInstance;
  private readonly DEFAULT_THUMBNAIL_URL = 'default_thumbnail_url';

  /**
   * @throws Will throw an error if the API key is not provided or city coordinates file is missing.
   */
  constructor() {
    // Load API key from environment variables
    const apiKey = process.env.OPENTRIPMAP_API_KEY;
    if (!apiKey) {
      throw new Error('OPENTRIPMAP_API_KEY is not defined in the environment variables.');
    }
    this.apiKey = apiKey;

    // Load city coordinates from JSON file
    const coordinatesPath = path.join(__dirname, './cityCoordinates.json');
    try {
      const data = fs.readFileSync(coordinatesPath, 'utf-8');
      this.cityCoordinates = JSON.parse(data);
    } catch (error) {
      console.error(`Failed to load city coordinates from ${coordinatesPath}:`, error);
      throw new Error('Could not initialize city coordinates.');
    }

    // Initialize Axios instance with default configurations
    this.axiosInstance = axios.create({
      baseURL: 'https://api.opentripmap.com/0.1/en/places',
      params: { apikey: this.apiKey },
      timeout: 5000, // 5 seconds timeout
    });
  }

  /**
   * Fetches detailed activity information by its xid.
   * @param xid - The unique identifier for the activity.
   * @returns A promise that resolves to ActivityDetails or null if not found.
   */
  public async getActivityByXid(xid: string): Promise<ActivityDetails | null> {
    try {
      const response = await this.axiosInstance.get(`/xid/${xid}`);
      const activity = response.data as ActivityDetails;
      const title = this.extractWikipediaTitle(activity.wikipedia);

      let wikipediaInfo = {
        summary: '',
        thumbnail: this.DEFAULT_THUMBNAIL_URL,
        pageUrl: activity.wikipedia || '',
      };

      if (title) {
        wikipediaInfo = await this.fetchWikipediaSummary(title);
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
      return null; // Return null if the activity cannot be fetched
    }
  }

  /**
   * Fetches activities based on city name with optional type and popularity filters.
   * @param city - The name of the city.
   * @param type - (Optional) The type of activities to fetch.
   * @param popularity - (Optional) The popularity filter for activities.
   * @returns A promise that resolves to an array of ActivityDetails.
   */
  public async getActivitiesByCity(
    city: string,
    type?: string,
    popularity?: string
  ): Promise<ActivityDetails[]> {
    const cityData = this.cityCoordinates[city];

    if (!cityData) {
      throw new Error(`City '${city}' not found in coordinates.`);
    }

    const { lat, lon } = cityData;

    try {
      const response = await this.axiosInstance.get<OpenTripMapResponse>('/radius', {
        params: {
          lat,
          lon,
          radius: 5000,
          kinds: type || 'interesting_places',
          rate: popularity || undefined, // Assuming 'rate' is the parameter for popularity
        },
      });

      // Fetch detailed info for each activity concurrently
      const activities = await Promise.all(
        response.data.features.map(async (item) => {
          const activityDetails = await this.fetchActivityDetails(item.properties.xid);
          return activityDetails;
        })
      );

      // Filter out any null results
      return activities.filter((activity): activity is ActivityDetails => activity !== null);
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  /**
   * Fetches detailed information for a single activity.
   * @param activityId - The unique identifier for the activity.
   * @returns A promise that resolves to ActivityDetails or null if not found.
   */
  private async fetchActivityDetails(activityId: string): Promise<ActivityDetails | null> {
    try {
      const response = await this.axiosInstance.get(`/xid/${activityId}`);
      const activity = response.data as ActivityDetails;
      const title = this.extractWikipediaTitle(activity.wikipedia);

      let wikipediaInfo = {
        summary: '',
        thumbnail: this.DEFAULT_THUMBNAIL_URL,
        pageUrl: activity.wikipedia || '',
      };

      if (title) {
        wikipediaInfo = await this.fetchWikipediaSummary(title);
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
      return null; // Return null if the activity cannot be fetched
    }
  }

  /**
   * Fetches the summary of a Wikipedia page based on its title.
   * @param title - The title of the Wikipedia page.
   * @returns A promise that resolves to an object containing summary, thumbnail, and pageUrl.
   */
  private async fetchWikipediaSummary(title: string): Promise<{
    summary: string;
    thumbnail: string;
    pageUrl: string;
  }> {
    try {
      const response = await axios.get<WikipediaSummaryResponse>(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
        { timeout: 5000 } // 5 seconds timeout
      );
      const data = response.data;

      return {
        summary: data.extract || 'No summary available',
        thumbnail: data.thumbnail?.source || this.DEFAULT_THUMBNAIL_URL,
        pageUrl: data.content_urls?.desktop?.page || '',
      };
    } catch (error) {
      console.error(`Error fetching Wikipedia summary for title "${title}":`, error);
      return {
        summary: 'No summary available',
        thumbnail: this.DEFAULT_THUMBNAIL_URL,
        pageUrl: '',
      };
    }
  }

  /**
   * Extracts the title from a Wikipedia URL.
   * @param wikipediaUrl - The full URL to the Wikipedia page.
   * @returns The title of the Wikipedia page or null if not extractable.
   */
  private extractWikipediaTitle(wikipediaUrl?: string): string | null {
    if (!wikipediaUrl) return null;
    try {
      const url = new URL(wikipediaUrl);
      const pathname = url.pathname; // e.g., /wiki/Some_Title
      const title = pathname.split('/wiki/')[1];
      return title ? decodeURIComponent(title) : null;
    } catch (error) {
      console.error(`Invalid Wikipedia URL: "${wikipediaUrl}"`, error);
      return null;
    }
  }
}
