import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';



const AddTripPage = ({ addTripSubmit }) => {
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const navigate = useNavigate();

    const submitForm = (e) => {
        e.preventDefault();

        const formatDate = (date: string | Date) => {
            const d = new Date(date);
            return d.toISOString().split('T')[0]; // Extract YYYY-MM-DD part only
        };
        const userEmail = localStorage.getItem('user_email');
        if (!userEmail) {
            toast.error('User not logged in.');
            return; // Stop form submission if user email isn't found
        }

        const newTrip = {
            title,
            location,
            description,
            from_date: formatDate(fromDate), // Formatted correctly
            to_date: formatDate(toDate),
            user_email: userEmail
        };


        addTripSubmit(newTrip);

        toast.success('Trip Added Successfully');

        return navigate('/trips');
    };

    return (
        <section className='bg-cyan-50'>
            <div className='container m-auto max-w-2xl py-24'>
                <div className='bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0'>
                    <form onSubmit={submitForm}>
                        <h2 className='text-3xl text-cyan-700 text-center font-semibold mb-6'>Create a New Trip</h2>

                        <div className='mb-4'>
                            <label className='block text-gray-700 font-bold mb-2'>
                                Trip Name
                            </label>
                            <input
                                type='text'
                                id='title'
                                name='title'
                                className='border rounded w-full py-2 px-3 mb-2'
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className='mb-4'>
                            <label
                                htmlFor='description'
                                className='block text-gray-700 font-bold mb-2'
                            >
                                Description
                            </label>
                            <textarea
                                id='description'
                                name='description'
                                className='border rounded w-full py-2 px-3'
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>

                        <div className='mb-4'>
                            <label className='block text-gray-700 font-bold mb-2'>
                                Location
                            </label>
                            <input
                                type='text'
                                id='location'
                                name='location'
                                className='border rounded w-full py-2 px-3 mb-2'
                                placeholder='Trip Location'
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                        <div className='mb-4'>
                            <label className='block text-gray-700 font-bold mb-2'>
                                Start Date
                            </label>
                            <input
                                type='Date'
                                id='fromDate'
                                name='fromDate'
                                className='border rounded w-full py-2 px-3 mb-2'
                                required
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-gray-700 font-bold mb-2'>
                                End Date
                            </label>
                            <input
                                type='Date'
                                id='toyDate'
                                name='toDate'
                                className='border rounded w-full py-2 px-3 mb-2'
                                required
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>

                        <div>
                            <button
                                className='bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline'
                                type='submit'
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
