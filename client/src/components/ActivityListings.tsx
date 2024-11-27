import { useState, useEffect } from 'react';
import ActivityListing from './ActivityListing.tsx';
import Spinner from './Spinner';

type Activity = {
  id: number;
  title: string;
  location: string;
  description: string;
};


const ActivityListings = ({ isHome = false }:{isHome:boolean}) => {
  const [activities, setactivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchactivities = async () => {
      const apiUrl:string= isHome ? '/api/activities?_limit=3' : '/api/activities';
      try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        setactivities(data);
      } catch (error) {
        console.log('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchactivities();
  }, []);

  return (
    <section className='px-4 py-10'>
      <div className='container-xl lg:container m-auto'>
        <h2 className='text-3xl font-bold text-cyan-700 mb-6 text-center'>
          {isHome ? ' Activities' : 'Activities'}
        </h2>

        {loading ? (
          <Spinner loading={loading} />
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {activities.map((activity:Activity) => (
              <ActivityListing key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
export default ActivityListings;
