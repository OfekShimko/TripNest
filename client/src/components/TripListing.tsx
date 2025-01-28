import { useState } from 'react';
import { FaMapMarker } from 'react-icons/fa';
import { Link } from 'react-router-dom';

type TripUsers = {
};

type TripActivities = {
};

type Trip = {
  id: string;
  title: string;
  description: string;
  location: string;
  from_date: Date;
  to_date: Date;
  activities: TripActivities[];
  users: TripUsers[];
};

const TripListing = ({ trip }: { trip: Trip }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  let description = trip.description;
  if (!showFullDescription && description.length > 90) {
    description = description.substring(0, 90) + '...';
  }

  return (
    <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl shadow-md border border-gray-100 dark:border-gray-700 relative">
      <div className="p-4">
        <div className="mb-6">
          <h3 className="text-xl font-bold">{trip.title}</h3>
        </div>

        <div className="mb-5">{description}</div>

        <button
          onClick={() => setShowFullDescription((prevState) => !prevState)}
          className="text-cyan-700 dark:text-cyan-400 mb-5 hover:text-cyan-600 dark:hover:text-cyan-300"
        >
          {showFullDescription ? 'Less' : 'More'}
        </button>

        <h3 className="mb-4">
          {`${new Date(trip.from_date).toLocaleDateString()} - ${new Date(trip.to_date).toLocaleDateString()}`}
        </h3>

        <div className="border border-gray-100 dark:border-gray-700 mb-5"></div>

        <div className="flex flex-col lg:flex-row justify-between mb-4">
          <div className="text-cyan-700 dark:text-cyan-400 mb-3 lg:mb-0 flex items-center">
            <FaMapMarker className="inline text-lg mb-1 mr-1" />
            {trip.location}
          </div>
          <Link
            to={`/trips/${trip.id}`}
            className="h-[36px] bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-center text-sm"
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TripListing;
