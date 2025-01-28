import { useState, useEffect } from 'react';
import activityImage from '../assets/images/activityimage.png';
import SelectTripModal from './DescriptionModal';  

type Trip = {
  id: string;
  title: string;
};

type TripActivity = {
  xid: string;
  name: string;
  description: string;
  image_url?: string;
};

interface TripActivityListingProps {
  activity: TripActivity;
  onRemove?: (xid: string) => void; 
}

const MAX_LENGTH = 300; 

const TripActivityListing: React.FC<TripActivityListingProps> = ({ activity, onRemove }) => {
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const userId = localStorage.getItem('userId');


  const imageUrl =
    activity.image_url &&
    activity.image_url.trim() !== '' &&
    activity.image_url !== 'default_thumbnail_url'
      ? activity.image_url
      : activityImage;

  const truncatedDescription =
    activity.description.length > MAX_LENGTH
      ? activity.description.substring(0, MAX_LENGTH) + '...'
      : activity.description;


  const handleRemove = () => {
    if (onRemove) {
      onRemove(activity.xid);
    }
  };


  const [showTripsModal, setShowTripsModal] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');


  useEffect(() => {
    if (showTripsModal) {
      if (!userId) {
        alert('User is not logged in');
        return;
      }

      const fetchTrips = async () => {
        try {
          const res = await fetch(`/api/v1/trips?userId=${userId}`);
          if (!res.ok) {
            throw new Error('Failed to fetch trips');
          }
          const data = await res.json();
          setTrips(data.map((item: any) => item.trip));
        } catch (error) {
          console.error(error);
          alert('Error fetching trips');
        }
      };

      fetchTrips();
    }
  }, [showTripsModal, userId]);

  const handleConfirmAdd = async () => {
    if (!selectedTripId) {
      alert('Please select a trip!');
      return;
    }

    try {
      const res = await fetch(`/api/v1/trips/${selectedTripId}/add-activity?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Trip_id: selectedTripId,
          xid: activity.xid,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add activity');
      }

      alert('Activity added to another trip successfully!');
      setShowTripsModal(false);
    } catch (error) {
      console.error(error);
      alert('Failed to add activity');
    }
  };

  return (
    <>
      <div
        className="
          bg-white dark:bg-gray-800 
          text-black dark:text-white 
          border border-gray-300 dark:border-gray-700 
          rounded-xl shadow-md w-full h-52 flex
        "
      >
        <div className="w-1/4 h-full">
          <img
            src={imageUrl}
            alt={activity.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-3/4 flex flex-col p-4">
          <h2 className="text-xl font-semibold mb-2">{activity.name}</h2>
          <p className="text-gray-700 dark:text-gray-200 text-sm mb-2">
            {truncatedDescription}
          </p>


          {activity.description.length > MAX_LENGTH && (
            <button
              onClick={() => setShowDescriptionModal(true)}
              className="text-cyan-700 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 text-sm w-fit mb-2"
            >
              More
            </button>
          )}

          <div className="mt-auto flex justify-end">
            {onRemove && (
              <button
                onClick={handleRemove}
                className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded text-sm"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>


      {showDescriptionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div
            className="
              bg-white dark:bg-gray-800 
              text-black dark:text-white 
              w-full max-w-md p-6 rounded-md shadow-lg relative
            "
          >
            <h2 className="text-xl font-bold mb-4">{activity.name}</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
              {activity.description}
            </p>
            <button
              onClick={() => setShowDescriptionModal(false)}
              className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-lg font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}


      <SelectTripModal
        isOpen={showTripsModal}
        trips={trips}
        selectedTripId={selectedTripId}
        onTripChange={(id: string) => setSelectedTripId(id)}
        onConfirm={handleConfirmAdd}
        onCancel={() => setShowTripsModal(false)}
      />
    </>
  );
};

export default TripActivityListing;
