import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { FaArrowLeft, FaMapMarker } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ActivityListing from "../components/ActivityListing";
import { useNavigate } from 'react-router-dom';

type Activity = {
    id: number;
    title: string;
    location: string;
    description: string;
};

type Trip = {
    id: string;
    title: string;
    type: string;
    description: string;
    location: string;
    dates: string;
    activities: { id: string }[];
};

const TripPage = ({ deleteTrip }) => {
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

    useEffect(() => {
        const fetchTripAndActivities = async () => {
            try {
                const tripRes = await fetch(`/api/trips/${id}`);
                const tripData = await tripRes.json();
                setTrip(tripData);

                // Fetch activities
                const activitiesRes = await fetch(`/api/activities`);
                const activitiesData = await activitiesRes.json();
                setActivities(activitiesData);
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
    const tripActivities = activities.filter((activity) =>
        trip.activities.some((tripActivity) => tripActivity.id === activity.id.toString())
    );

    return (
        <>
            <section>
                <div className='container m-auto py-6 px-6'>
                    <Link
                        to='/trips'
                        className='text-cyan-700 hover:text-cyan-600 flex items-center'
                    >
                        <FaArrowLeft className='mr-2' /> Back to Trips
                    </Link>
                </div>
            </section>

            <section>
                <div className='container m-auto py-10 px-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 w-full gap-6'>
                        <main>
                            <div className='bg-cyan-100 p-6 rounded-lg shadow-md text-center md:text-left'>
                                <p className='mb-4'>{trip.dates}</p>
                                <h1 className='text-3xl font-bold mb-4'>{trip.title}</h1>
                                <div className='text-gray-500 mb-4 flex align-middle justify-center md:justify-start'>
                                    <FaMapMarker className='text-cyan-600 mr-1' />
                                    <p className='text-cyan-600'>{trip.location}</p>
                                </div>
                            </div>

                            <div className='bg-cyan-100 p-6 rounded-lg shadow-md mt-6'>
                                <h3 className='text-cyan-700 text-lg font-bold mb-6' >
                                    Trip Description
                                </h3>

                                <p className='mb-4'>{trip.description}</p>

                            </div>

                            <div className='bg-cyan-100 p-6 rounded-lg shadow-md mt-6' >
                                <h3 className='text-cyan-700 text-xl font-bold mt-2 mb-2'>Activities</h3>
                                {tripActivities.map((activity) => (
                                    <div key={activity.id} className="mb-2">
                                        <ActivityListing key={activity.id} activity={activity} />
                                    </div>
                                ))}
                            </div>
                        </main>
                        <aside>
                            <div className='bg-cyan-100 p-6 rounded-lg shadow-md '>
                                <h3 className='text-xl font-bold mb-6'>Manage Trip</h3>
                                <button
                                    onClick={() => onDeleteClick(trip.id)}
                                    className='bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block'
                                >
                                    Delete Trip
                                </button>
                            </div></aside>


                    </div>
                </div>
            </section>
        </>
    );
};

export default TripPage;