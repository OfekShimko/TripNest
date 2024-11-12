export interface ActivityDetails {
    xid: string;  
    name: string;
    description: string;
    image_url: string;
    wikipedia: string;
    kinds: string;
}

export interface WikipediaSummaryResponse {
    extract: string;
    thumbnail?: {
      source: string;
    };
    content_urls?: {
      desktop?: {
        page: string;
      };
    };
  }
  
export interface OpenTripMapResponse {
    features: {
      properties: ActivityDetails;
    }[];
}
  