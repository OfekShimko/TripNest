import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from "../components/Spinner";

type Trip = {
  id: string;
  title: string;
  description: string;
  location: string;
  from_date: string;
  to_date: string;
};

const TripEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the trip data to edit
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await fetch(`/api/v1/trips/${id}?userId=${userId}`);
        const data = await res.json();
        setTrip(data.trip);
      } catch (error) {
        console.error('Error fetching trip:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (trip) {
      setTrip((prev) => prev && { ...prev, [name]: value });
    }
  };

  // Handle the submit event
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!trip) return;

    try {
      const res = await fetch(`/api/v1/trips/${id}?userId=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trip),
      });

      if (res.ok) {
        toast.success('Trip updated successfully!');
        navigate(`/trips/${id}`);
      } else {
        toast.error('Error updating trip.');
      }
    } catch (error) {
      console.error('Error updating trip:', error);
    }
  };

  if (loading) {
    return <Spinner loading={loading} />;
  }
  if (!trip) {
    return <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white p-6">Trip not found.</div>;
  }

  return (
    <section className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="container m-auto max-w-2xl py-24">
        <div className="bg-white dark:bg-gray-800 px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0 dark:border-gray-700">
          <form onSubmit={handleSubmit}>
            <h2 className="text-3xl text-cyan-700 dark:text-cyan-400 text-center font-semibold mb-6">
              Edit Trip
            </h2>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-200 font-bold mb-2">
                Trip Name
              </label>
              <input
                type="text"
                name="title"
                className="border rounded w-full py-2 px-3 mb-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
                value={trip.title}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-200 font-bold mb-2">
                Description
              </label>
              <textarea
                name="description"
                className="border rounded w-full py-2 px-3 mb-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={trip.description}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-200 font-bold mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                className="border rounded w-full py-2 px-3 mb-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="Trip Location"
                required
                value={trip.location}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-200 font-bold mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="from_date"
                className="border rounded w-full py-2 px-3 mb-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
                value={trip.from_date}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-200 font-bold mb-2">
                End Date
              </label>
              <input
                type="date"
                name="to_date"
                className="border rounded w-full py-2 px-3 mb-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
                value={trip.to_date}
                onChange={handleChange}
              />
            </div>

            <div>
              <button
                className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-full w-full"
                type="submit"
              >
                Update Trip
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default TripEditPage;
