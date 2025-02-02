import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { FaArrowLeft, FaMapMarker } from 'react-icons/fa';
import { toast } from 'react-toastify';
import UserSearchModal from "../components/UserSearchModal";
import TripActivityListing from '../components/TripActivityListing';
import CollaboratorsList from '../components/CollaboratorsList';

type Trip = {
  id: string;
  title: string;
  description: string;
  location: string;
  from_date: Date;
  to_date: Date;
};

type TripActivity = {
  xid: string;
  name: string;
  description: string;
  image_url?: string;
};

type TripPageProps = {
  deleteTrip: (tripId: string) => void;
};

const TripPage = ({ deleteTrip }: TripPageProps) => {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<TripActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userRole, setUserRole] = useState<string>("Viewer"); 
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchTripAndActivities = async () => {
      try {
        const tripRes = await fetch(`/api/v1/trips/${id}?userId=${userId}`);
        const tripData = await tripRes.json();

        if (tripData.trip) {
          setTrip(tripData.trip);
        }
        if (tripData.permission) {
          setUserRole(tripData.permission);
        }

        const activitiesRes = await fetch(`/api/v1/trips/${id}/activities?userId=${userId}`);
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData.activities);
      } catch (error) {
        console.log('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTripAndActivities();
  }, [id]);

  if (loading) {
    return <Spinner loading={loading} />;
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white p-6">
        No trip data found!
      </div>
    );
  }

  const onDeleteClick = (tripId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this listing?');
    if (!confirmDelete) return;
    deleteTrip(tripId);
    toast.success('Trip deleted successfully');
    navigate('/trips');
  };

  const onEditClick = (tripId: string) => {
    navigate(`/trips/edit/${tripId}`);
  };

  const onManageUsersClick = () => {
    setShowModal(true);
  };

  const handleRemoveActivity = async (xid: string) => {
    try {
      const res = await fetch(`/api/v1/trips/${id}/activities?userId=${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xid }),
      });

      if (!res.ok) {
        throw new Error('Failed to remove activity');
      }
      setActivities((prev) => prev.filter((act) => act.xid !== xid));
    } catch (error) {
      console.error('Failed to remove activity', error);
      alert('Failed to remove activity from the trip.');
    }
  };

  return (

    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <section>
        <div className="container m-auto py-6 px-6">
          <Link
            to="/trips"
            className="text-cyan-700 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back to Trips
          </Link>
        </div>
      </section>

      <section>
        <div className="container m-auto py-10 px-6">
          <div
            className={`grid w-full gap-6 items-stretch ${
              userRole === "Viewer" ? "md:grid-cols-[2fr_1fr]" : "md:grid-cols-[2fr_1fr_1fr]"
            }`}
          >
            <div className="bg-cyan-100 dark:bg-cyan-900 text-black dark:text-white p-6 rounded-lg shadow-md text-center md:text-left flex flex-col h-full">
              <p className="mb-4">
                {`${new Date(trip.from_date).toLocaleDateString()} - 
                ${new Date(trip.to_date).toLocaleDateString()}`}
              </p>
              <h1 className="text-3xl font-bold mb-4">{trip.title}</h1>
              <div className="text-gray-500 dark:text-gray-300 mb-4 flex align-middle justify-center md:justify-start">
                <FaMapMarker className="text-cyan-600 dark:text-cyan-400 mr-1" />
                <p className="text-cyan-600 dark:text-cyan-300">{trip.location}</p>
              </div>
            </div>

            <CollaboratorsList tripId={trip.id} />
            {userRole !== "Viewer" && (
              <aside className="bg-cyan-100 dark:bg-cyan-900 text-black dark:text-white p-6 mb-0 rounded-lg shadow-md flex flex-col h-full">
                <h3 className="text-xl font-bold mb-4">Manage Trip</h3>

                {(userRole === "Manager" || userRole === "Editor") && (
                  <>
                    <button
                      onClick={() => onEditClick(trip.id)}
                      className="bg-teal-700 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-full w-full mt-4"
                    >
                      Edit Trip
                    </button>
                    {userRole === "Manager" && (
                      <>
                        <button
                          onClick={onManageUsersClick}
                          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full w-full mt-4"
                        >
                          Manage Collaborators
                        </button>
                        <button
                          onClick={() => onDeleteClick(trip.id)}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-4 rounded-full w-full mt-4"
                        >
                          Delete Trip
                        </button>
                      </>
                    )}
                  </>
                )}
              </aside>
            )}
          </div>

          <div className="bg-cyan-100 dark:bg-cyan-900 text-black dark:text-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-cyan-700 dark:text-cyan-300 text-lg font-bold mb-6">Trip Description</h3>
            <p className="mb-4 text-gray-700 dark:text-gray-200">{trip.description}</p>
          </div>
          <div className="bg-cyan-100 dark:bg-cyan-900 text-black dark:text-white p-6 rounded-lg shadow-md mt-6 max-h-[1000px] overflow-y-scroll">
            <h3 className="text-cyan-700 dark:text-cyan-300 text-xl font-bold mt-2 mb-2">Activities</h3>
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.xid} className="mb-4">
                  <TripActivityListing
                    activity={activity}
                    onRemove={
                      userRole === "Manager" || userRole === "Editor"
                        ? handleRemoveActivity
                        : undefined
                    }
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-700 dark:text-gray-200">No activities found for this trip.</p>
            )}
          </div>
        </div>
      </section>
      {showModal && <UserSearchModal tripId={id} onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default TripPage;
