import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface AddTripPageProps {
  addTripSubmit: (trip: {
    title: string;
    location: string;
    description: string;
    from_date: string;
    to_date: string;
    user_id: string;
  }) => Promise<void>;
}

const AddTripPage: React.FC<AddTripPageProps> = ({ addTripSubmit }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const navigate = useNavigate();

  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formatDate = (date: string | Date) => {
      const d = new Date(date);
      return d.toISOString().split('T')[0]; // Extract YYYY-MM-DD
    };

    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast.error('User not logged in.');
      return; // Stop form submission if user isn't found
    }

    const newTrip = {
      title,
      location,
      description,
      from_date: formatDate(fromDate),
      to_date: formatDate(toDate),
      user_id: userId,
    };

    addTripSubmit(newTrip);
    toast.success('Trip Added Successfully');
    return navigate('/trips');
  };

  return (
    <section className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="container m-auto max-w-2xl py-24">
        {/* Form container with some dark-mode-ready classes */}
        <div className="bg-white dark:bg-gray-800 dark:text-gray-100 px-6 py-8 mb-4 shadow-md rounded-md border border-gray-200 dark:border-gray-700 m-4 md:m-0">
          <form onSubmit={submitForm}>
            <h2 className="text-3xl text-cyan-700 dark:text-cyan-400 text-center font-semibold mb-6">
              Create a New Trip
            </h2>

            <div className="mb-4">
              <label className="block font-bold mb-2 text-gray-700 dark:text-gray-200">
                Trip Name
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="border border-gray-300 dark:border-gray-600 
                           rounded w-full py-2 px-3 mb-2 bg-white 
                           dark:bg-gray-700 text-black dark:text-white"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="block font-bold mb-2 text-gray-700 dark:text-gray-200"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className="border border-gray-300 dark:border-gray-600 
                           rounded w-full py-2 px-3 bg-white 
                           dark:bg-gray-700 text-black dark:text-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block font-bold mb-2 text-gray-700 dark:text-gray-200">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className="border border-gray-300 dark:border-gray-600 
                           rounded w-full py-2 px-3 mb-2 bg-white 
                           dark:bg-gray-700 text-black dark:text-white"
                placeholder="Trip Location"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block font-bold mb-2 text-gray-700 dark:text-gray-200">
                Start Date
              </label>
              <input
                type="date"
                id="fromDate"
                name="fromDate"
                className="border border-gray-300 dark:border-gray-600 
                           rounded w-full py-2 px-3 mb-2 bg-white 
                           dark:bg-gray-700 text-black dark:text-white"
                required
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block font-bold mb-2 text-gray-700 dark:text-gray-200">
                End Date
              </label>
              <input
                type="date"
                id="toyDate"
                name="toDate"
                className="border border-gray-300 dark:border-gray-600 
                           rounded w-full py-2 px-3 mb-2 bg-white 
                           dark:bg-gray-700 text-black dark:text-white"
                required
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div>
              <button
                className="bg-cyan-700 hover:bg-cyan-600 text-white 
                           font-bold py-2 px-4 rounded-full w-full 
                           focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Add Trip
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AddTripPage;
