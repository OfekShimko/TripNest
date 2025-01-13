import { useState, useEffect } from 'react';
import { FaMapMarker } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SelectTripModal from './DescriptionModal';  // <-- import the new modal
import activityImage from '../assets/images/activityimage.png';

type Trip = {
  id: string;
  title: string;
};

type Activity = {
  id: string;       // "xid" if your server calls it that
  title: string;
  location: string;
  description: string;
  image_url?: string;
  kinds?: string;
};

const MAX_LENGTH = 90;

const ActivityListing = ({ activity }: { activity: Activity }) => {
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const userId = localStorage.getItem('userId');
  // For the "Add" functionality
  const [showTripsModal, setShowTripsModal] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
 

  const navigate = useNavigate();

  const truncatedDescription =
    activity.description.length > MAX_LENGTH
      ? activity.description.substring(0, MAX_LENGTH) + '...'
      : activity.description;

  const imageUrl =
    activity.image_url &&
      activity.image_url.trim() !== '' &&
      activity.image_url !== 'default_thumbnail_url'
      ? activity.image_url
      : activityImage;

  // Fetch user trips whenever the "Add" button is clicked
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

          // Depending on your backend shape:
          // If it returns [{ trip: {...} }, { trip: {...} }] => do data.map(...)
          // If it returns [{...}, {...}] => just use data
          // setTrips(data.map((item: any) => item.trip));

          // Filter trips where permission is "Editor" or "Manager"
          setTrips(
            data
              .filter((item: any) => item.permission === "Editor" || item.permission === "Manager")
              .map((item: any) => item.trip));
        } catch (error) {
          console.error(error);
          alert('Error fetching trips');
        }
      };

      fetchTrips();
    }
  }, [showTripsModal]);

  // Add the activity to the selected trip
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
          xid: activity.id,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add activity');
      }

      setShowTripsModal(false);
      navigate(`/trips/${selectedTripId}`);
    } catch (error) {
      console.error(error);
      alert('Failed to add activity');
    }
  };

  return (
    <>
      {/* The Activity card */}
      <div className='w-80 h-auto bg-white border border-gray-300 rounded-xl shadow-md relative p-4 flex flex-col justify-between'>
        <img
          src={imageUrl}
          alt={activity.title}
          className='w-full h-32 object-cover rounded-lg mb-3'
        />

        <div className='flex flex-col flex-grow overflow-hidden'>
          <div className='mb-6'>
            <div className='text-gray-800 text-lg font-semibold my-2'>
              {activity.title}
            </div>
          </div>

          <div className='mb-5 text-gray-700 flex-grow overflow-hidden'>
            {truncatedDescription}
          </div>

          {activity.description.length > MAX_LENGTH && (
            <button
              onClick={() => setShowDescriptionModal(true)}
              className='text-cyan-700 mb-5 hover:text-cyan-600 self-start'
            >
              More
            </button>
          )}
        </div>

        <div>
          <div className='border border-gray-200 mb-5'></div>
          <div className='flex flex-col lg:flex-row justify-between mb-4 items-center'>
            <div className='text-cyan-700 mb-3 lg:mb-0 flex items-center'>
              <FaMapMarker className='inline text-lg mr-1' />
              {activity.location}
            </div>
            <button
              onClick={() => setShowTripsModal(true)}
              className='h-[36px] bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-center text-sm'
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: FULL DESCRIPTION */}
      {showDescriptionModal && (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50'>
          <div className='bg-white w-full max-w-md p-6 rounded-md shadow-lg relative'>
            <h2 className='text-xl font-bold mb-4'>{activity.title}</h2>
            <p className='mb-6 text-gray-700 whitespace-pre-wrap'>
              {activity.description}
            </p>
            <button
              onClick={() => setShowDescriptionModal(false)}
              className='absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg font-bold'
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* MODAL: SELECT TRIP */}
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

export default ActivityListing;
