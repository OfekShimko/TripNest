import { useState, useEffect } from 'react';
import ActivityListing from './ActivityListing';
import Spinner from './Spinner';

type Activity = {
  id: string;
  title: string;
  location: string;
  description: string;
  image_url: string;
  kinds?: string;
};


interface ActivityListingsProps {
  isHome?: boolean;
  locationQuery?: string;
  cityName?: string;
}

const ActivityListings = ({ isHome = false, locationQuery, cityName }: ActivityListingsProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchActivities = async () => {
      let apiUrl: string;

      if (isHome) {
        apiUrl = '/api/v1/activities';
      } else {
        apiUrl = locationQuery && locationQuery.trim() !== ''
          ? `/api/v1/activities?location=${encodeURIComponent(locationQuery)}`
          : `/api/v1/activities`;
      }

      try {
        const res = await fetch(apiUrl);
        if (!res.ok) {
          // If it's not a successful response, handle it gracefully
          const errorText = await res.text(); // read the error as text
          console.error(`Server responded with error: ${errorText}`);
          throw new Error(`Error fetching data: ${errorText}`);
        }

        const data = await res.json();


        console.log(data)

        const mappedActivities: Activity[] = data.map((activity: any) => ({
          id: activity.xid,
          title: activity.name,
          location: locationQuery && locationQuery.trim() !== '' ? locationQuery : cityName || 'Tel Aviv',
          description: activity.description || "",
          image_url: activity.image_url || "", // If empty string, we'll conditionally hide the <img>
          kinds: activity.kinds
        }));

        setActivities(mappedActivities);
      } catch (error) {
        console.log('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };

    setCurrentIndex(0);
    fetchActivities();
  }, [locationQuery, isHome, cityName]);

  const activitiesToShow = activities.slice(currentIndex, currentIndex + 4);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 4);
    }
  };

  const handleNext = () => {
    if (currentIndex + 4 < activities.length) {
      setCurrentIndex(currentIndex + 4);
    }
  };

  return (
    <section className='px-4 py-10 relative'>
      <div className='container-xl lg:container m-auto'>
        {cityName && (
          <h2 className='text-4xl font-bold text-cyan-800 mb-4 text-center relative'>
            {cityName}
            <div className='w-16 h-1 bg-cyan-800 mx-auto mt-2'></div>
          </h2>
        )}

        {loading ? (
          <Spinner loading={loading} />
        ) : (
          <div className='relative flex items-center justify-center px-10'>
            {currentIndex > 0 && (
              <button
                onClick={handlePrev}
                className='absolute left-0 top-1/2 transform -translate-y-1/2 bg-cyan-700 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-cyan-600 z-10'
              >
                {'<'}
              </button>
            )}

            <div className='flex gap-6 overflow-hidden'>
              {activitiesToShow.map((activity: Activity) => (
                <ActivityListing key={activity.id} activity={activity} />
              ))}
            </div>

            {currentIndex + 4 < activities.length && (
              <button
                onClick={handleNext}
                className='absolute right-0 top-1/2 transform -translate-y-1/2 bg-cyan-700 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-cyan-600 z-10'
              >
                {'>'}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ActivityListings;
