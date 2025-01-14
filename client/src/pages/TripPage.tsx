import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { FaArrowLeft, FaMapMarker } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
//import ActivityListing from "../components/ActivityListing";
import TripActivityListing from '../components/TripActivityListing';
import { useNavigate } from 'react-router-dom';



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

// Typing for the deleteTrip prop function
type TripPageProps = {
    deleteTrip: (tripId: string) => void;
};

const TripPage = ({ deleteTrip }: TripPageProps) => {
    const { id } = useParams();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const onDeleteClick = (tripId: string) => {
        const confirm = window.confirm(
            'Are you sure you want to delete this listing?'
        );
        

        if (!confirm) return;

        deleteTrip(tripId);

        toast.success('Trip deleted successfully');

        navigate('/trips');
    };

    const onEditClick = (tripId: string) => {
        // Navigating to the edit page for the selected trip
        navigate(`/trips/edit/${tripId}`);
      };

    useEffect(() => {
        const fetchTripAndActivities = async () => {
            const userId = localStorage.getItem('userId');
            try {
                const tripRes = await fetch(`/api/v1/trips/${id}?userId=${userId}`);
                const tripData = await tripRes.json();
                setTrip(tripData);

                // Fetch activities
                const activitiesRes = await fetch(`/api/v1/trips/${id}/activities`);
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

    if (loading) return <Spinner loading={loading} />;

    if (!trip) return <div>No trip data found!</div>;

    // Filter activities related to the trip
    // const tripActivities = activities.filter((activity) =>
    //     trip.activities?.some((tripActivity) => tripActivity.id === activity.id.toString())
    //   );

    const handleRemoveActivity = async (xid: string) => {
        try {
          const res = await fetch(`/api/v1/trips/${id}/activities`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              Trip_id: id,  // The trip ID
              xid: xid,     // The activity ID
            }),
          });
    
          if (!res.ok) {
            throw new Error('Failed to remove activity');
          }
    
          // Filter it out from local state so UI updates immediately
          setActivities((prev) => prev.filter((act) => act.xid !== xid));
        } catch (error) {
          console.error('Failed to remove activity', error);
          alert('Failed to remove activity from the trip.');
        }
      };



      return (
        <>
          {/* Back to Trips Link */}
          <section>
            <div className="container m-auto py-6 px-6">
              <Link
                to="/trips"
                className="text-cyan-700 hover:text-cyan-600 flex items-center"
              >
                <FaArrowLeft className="mr-2" /> Back to Trips
              </Link>
            </div>
          </section>
    
          <section>
            <div className="container m-auto py-10 px-6">
              {/* ROW 1: Trip Info (left) + Manage Trip (right) in one row */}
              <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] w-full gap-6 items-stretch">
                {/* LEFT COLUMN */}
                <div className="bg-cyan-100 p-6 rounded-lg shadow-md text-center md:text-left flex flex-col h-full">
                  <p className="mb-4">
                    {`${new Date(trip.from_date).toLocaleDateString()} - 
                      ${new Date(trip.to_date).toLocaleDateString()}`}
                  </p>
                  <h1 className="text-3xl font-bold mb-4">{trip.title}</h1>
                  <div className="text-gray-500 mb-4 flex align-middle justify-center md:justify-start">
                    <FaMapMarker className="text-cyan-600 mr-1" />
                    <p className="text-cyan-600">{trip.location}</p>
                  </div>
                </div>
    
                {/* RIGHT COLUMN: Manage Trip */}
                <aside className="bg-cyan-100 p-6 rounded-lg shadow-md flex flex-col h-full">
                  <h3 className="text-xl font-bold mb-6">Manage Trip</h3>
                  <button
                    onClick={() => onEditClick(trip.id)}
                    className="bg-teal-700 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none 
                               focus:shadow-outline mt-4 block"
                  >
                    Edit Trip
                  </button>
                  <button
                    onClick={() => onDeleteClick(trip.id)}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none 
                               focus:shadow-outline mt-4 block"
                  >
                    Delete Trip
                  </button>
                </aside>
              </div>
    
              {/* ROW 2: FULL-WIDTH Trip Description */}
              <div className="bg-cyan-100 p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-cyan-700 text-lg font-bold mb-6">
                  Trip Description
                </h3>
                <p className="mb-4">{trip.description}</p>
              </div>
    
              {/* ROW 3: FULL-WIDTH Activities (scrollable if many) */}
              <div className="bg-cyan-100 p-6 rounded-lg shadow-md mt-6 max-h-[1000px] overflow-y-scroll">
                <h3 className="text-cyan-700 text-xl font-bold mt-2 mb-2">
                  Activities
                </h3>
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.xid} className="mb-4">
                      <TripActivityListing
                        activity={activity}
                        // The function that does DELETE /api/v1/trips/{id}/activities
                        onRemove={handleRemoveActivity}
                      />
                    </div>
                  ))
                ) : (
                  <p>No activities found for this trip.</p>
                )}
              </div>
            </div>
          </section>
        </>
      );
    };
    
    export default TripPage;