import { useState } from 'react';
import { FaMapMarker } from 'react-icons/fa';
import { Link } from 'react-router-dom';

type Activity = {
  id: string;
  title: string;
  location: string;
  description: string;
};

const MAX_LENGTH = 90;

const ActivityListing = ({ activity }: { activity: Activity }) => {
  const [showModal, setShowModal] = useState(false);

  // Always show truncated text in the card
  const truncatedDescription =
    activity.description.length > MAX_LENGTH
      ? activity.description.substring(0, MAX_LENGTH) + '...'
      : activity.description;

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <>
      <div className='w-64 h-80 bg-white border border-gray-300 rounded-xl shadow-md relative p-4 flex flex-col justify-between'>
        <div className='flex flex-col flex-grow overflow-hidden'>
          <div className='mb-6'>
            <div className='text-gray-800 text-lg font-semibold my-2'>{activity.title}</div>
          </div>

          <div className='mb-5 text-gray-700 flex-grow overflow-hidden'>
            {truncatedDescription}
          </div>

          {activity.description.length > MAX_LENGTH && (
            <button
              onClick={openModal}
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
            <Link
              to={`/activities/${activity.id}`}
              className='h-[36px] bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-center text-sm'
            >
              Read More
            </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50'>
          <div className='bg-white w-full max-w-md p-6 rounded-md shadow-lg relative'>
            <h2 className='text-xl font-bold mb-4'>{activity.title}</h2>
            <p className='mb-6 text-gray-700 whitespace-pre-wrap'>
              {activity.description}
            </p>
            <button
              onClick={closeModal}
              className='absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg font-bold'
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ActivityListing;
