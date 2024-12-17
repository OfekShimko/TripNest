import { useState, useEffect } from 'react';
import TripListing from './TripListing.js';
import Spinner from './Spinner';



type Trip = {
  id: string;
  title: string;
  description: string;
  location: string;
  from_date: Date;
  to_date: Date;
  activities: TripActivities[];
  users:TripUsers[];
};


const TripListings = ({ isHome = false }:{isHome:boolean}) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchtrips = async () => {
      const apiUrl:string= isHome ? '/api/v1/trips?_limit=3' : '/api/v1/trips';
      try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        setTrips(data);
      } catch (error) {
        console.log('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchtrips();
  }, []);

  return (
    <section className='px-4 py-10'>
      <div className='container-xl lg:container m-auto'>
        <h2 className='text-3xl font-bold text-cyan-700 mb-6 text-center'>
          {isHome ? 'Upcoming Trips' : 'Trips'}
        </h2>

        {loading ? (
          <Spinner loading={loading} />
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {trips.map((trip:Trip) => (
              <TripListing key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
export default TripListings;
