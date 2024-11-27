import { useState } from 'react';
import { FaMapMarker } from 'react-icons/fa';
import { Link } from 'react-router-dom';

type Activity = {
  id: number;
  title: string;
  location: string;
  description: string;
};


const activityListing = ({ activity }: { activity: Activity }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  let description = activity.description;


  if (!showFullDescription) {
    description = description.substring(0, 90) + '...';
  }

  return (
    <div className='bg-white rounded-xl shadow-md relative'>
      <div className='p-4'>
        <div className='mb-6'>
          <div className='text-gray-600 my-2'>{activity.title}</div>
        </div>

        <div className='mb-5'>{description}</div>

        <button
          onClick={() => setShowFullDescription((prevState) => !prevState)}
          className='text-cyan-700 mb-5 hover:text-cyan-600'
        >
          {showFullDescription ? 'Less' : 'More'}
        </button>

        <div className='border border-gray-100 mb-5'></div>

        <div className='flex flex-col lg:flex-row justify-between mb-4'>
          <div className='text-cyan-700 mb-3'>
            <FaMapMarker className='inline text-lg mb-1 mr-1' />
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
  );
};
export default activityListing;
