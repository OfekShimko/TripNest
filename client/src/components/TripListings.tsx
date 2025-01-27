import { useState, useEffect } from 'react';
import TripListing from './TripListing.js';
import Spinner from './Spinner';

type TripActivity = {
  id: string;
  activity_name: string;
};

type TripUser = {
  id: string;
  user_id: string;
};
type Trip = {
  id: string;
  title: string;
  description: string;
  location: string;
  from_date: Date;  
  to_date: Date;    
  activities: TripActivity[];
  users: TripUser[];
};

type TripResponse = {
  trip: Trip;
  permission: string;
};

const TripListings = ({ isHome }: { isHome: boolean }) => {
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('No userID provided for fetching trips');
        setLoading(false);
        return;
      }
      const apiUrl = isHome
        ? `/api/v1/trips?userId=${userId}&_limit=3`
        : `/api/v1/trips?userId=${userId}`;
      try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch trips: ${response.statusText}`);
        }

        const data = await response.json();
        if (JSON.stringify(data) !== JSON.stringify(trips)) {
          setTrips(data);
        }
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [trips]);

  return (
    <section className="px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <h2 className="text-3xl font-bold text-cyan-700 mb-6 text-center">
          {isHome ? 'Upcoming Trips' : 'Trips'}
        </h2>

        {loading ? (
          <Spinner loading={loading} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trips.map((tripResponse) => (
              <TripListing 
                key={tripResponse.trip.id} 
                trip={tripResponse.trip} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TripListings;
