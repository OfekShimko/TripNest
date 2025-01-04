import { useState, useEffect } from 'react';
import { FaMapMarker } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import activityImage from '../assets/images/activityimage.png';

type Trip = {
  id: string;
  title: string;
  // add other fields if needed
};

type Activity = {
  id: string;
  title: string;
  location: string;
  description: string;
  image_url?: string;
  kinds?: string;
};

const MAX_LENGTH = 90;

const ActivityListing = ({ activity }: { activity: Activity }) => {
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);

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

  // Fetch user trips whenever the "Add" button is clicked and the trips modal opens.
  useEffect(() => {
    if (showTripsModal) {
      const userId = localStorage.getItem('userId');
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
          // ^ Adjust according to your actual trip shape. 
          //   If your endpoint returns directly an array of Trip objects, 
          //   you may not need map(...). item.trip might not be needed.
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
      // Example: a POST request to an endpoint that handles adding an activity
      // to a trip. Adjust this according to your backend.
      const res = await fetch(`/api/v1/trips/${selectedTripId}/add-activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Trip_id: selectedTripId,     // <-- Must be a string field
          xid: activity.id,     // If the server expects `xid`
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add activity');
      }

      // On success, close the trips modal and navigate user to that trip's page
      setShowTripsModal(false);
      navigate(`/trips/${selectedTripId}`);
    } catch (error) {
      console.error(error);
      alert('Failed to add activity');
    }
  };

  return (
    <>
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
            {/* 
              Replace "Read More" with "Add" 
            */}
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
      {showTripsModal && (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50'>
          <div className='bg-white w-full max-w-md p-6 rounded-md shadow-lg relative'>
            <h2 className='text-xl font-bold mb-4'>Select a Trip</h2>

            {trips.length === 0 ? (
              <p>You have no trips yet.</p>
            ) : (
              <select
                className='w-full p-2 border border-gray-300 rounded-lg'
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
              >
                <option value=''>-- Choose a trip --</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            )}

            <div className='flex items-center justify-end mt-6 gap-4'>
              <button
                onClick={() => setShowTripsModal(false)}
                className='text-gray-600 hover:text-gray-800'
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAdd}
                className='bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg'
                disabled={!selectedTripId}
              >
                Confirm Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActivityListing;
