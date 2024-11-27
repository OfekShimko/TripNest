import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { FaArrowLeft, FaMapMarker } from 'react-icons/fa';
import { Link } from 'react-router-dom';
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

const ActivityPage = ({ addActivityToTrip }) => {
    const { id } = useParams();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTrip, setSelectedTrip] = useState("");
    const navigate = useNavigate();

    const handleAddToTrip = async () => {
        if (!selectedTrip) {
            alert("Please select a trip!");
            return;
        }
        console.log("Selected Trip ID:", selectedTrip);
        console.log("Activity ID:", id);
        try {
            await addActivityToTrip(selectedTrip, id);
        } catch (error) {
            console.error("Failed to add activity:", error);
            alert("Error adding activity to trip");
        }
        navigate(`/trips/${selectedTrip}`);
    };

    useEffect(() => {
        const fetchTripsAndActivity = async () => {
            try {
                const tripsRes = await fetch(`/api/trips`);
                const tripsData = await tripsRes.json();
                setTrips(tripsData);
                const activityRes = await fetch(`/api/activities/${id}`)
                const activityData = await activityRes.json();
                setActivity(activityData);
            } catch (error) {
                console.log('Error fetching data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTripsAndActivity();
    }, [id]);

    if (loading) return <Spinner loading={loading} />;


    return (
        <>
            <section>
                <div className='container m-auto py-6 px-6'>
                    <Link
                        to='/activities'
                        className='text-cyan-700 hover:text-cyan-600 flex items-center'
                    >
                        <FaArrowLeft className='mr-2' /> Back to Activities
                    </Link>
                </div>
            </section>

            <section>
                <div className='container m-auto py-10 px-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 w-full gap-6'>
                        <main>
                            <div className='bg-cyan-100 p-6 rounded-lg shadow-md text-center md:text-left'>
                                <h1 className='text-3xl font-bold mb-4'>{activity.title}</h1>
                                <div className='text-gray-500 mb-4 flex align-middle justify-center md:justify-start'>
                                    <FaMapMarker className='text-cyan-600 mr-1' />
                                    <p className='text-cyan-600'>{activity.location}</p>
                                </div>
                            </div>

                            <div className='bg-cyan-100 p-6 rounded-lg shadow-md mt-6'>
                                <h3 className='text-cyan-700 text-lg font-bold mb-6' >
                                    Activity Description
                                </h3>

                                <p className='mb-4'>{activity.description}</p>

                            </div>
                        </main>
                        <div>
                            <select
                                value={selectedTrip}
                                onChange={(e) => setSelectedTrip(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="" disabled>
                                    Select a Trip
                                </option>
                                {trips.map((trip) => (
                                    <option key={trip.id} value={trip.id}>
                                        {trip.title}
                                    </option>
                                ))}
                            </select>
                            {/* Button to add activity */}
                            <button
                                onClick={handleAddToTrip}
                                className='bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block'
                            >
                                Add to Trip
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
export default ActivityPage;
