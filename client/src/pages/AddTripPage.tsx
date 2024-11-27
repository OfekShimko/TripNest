import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AddTripPage = ({ addTripSubmit }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Fun');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [dates, setDates] = useState('');
    const [activities,setActivities]=useState(null);



    const navigate = useNavigate();

    const submitForm = (e) => {
        e.preventDefault();

        const newTrip = {
            title,
            type,
            location,
            description,
            dates,
            activities: activities || []
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
                            <label
                                htmlFor='type'
                                className='block text-gray-700 font-bold mb-2'
                            >
                                Trip Type
                            </label>
                            <input
                                type='text'
                                id='type'
                                name='type'
                                className='border rounded w-full py-2 px-3 mb-2'
                                placeholder='eg. Sport'
                                required
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-gray-700 font-bold mb-2'>
                                Trip Name
                            </label>
                            <input
                                type='text'
                                id='title'
                                name='title'
                                className='border rounded w-full py-2 px-3 mb-2'
                                placeholder='eg. Chilling With Friends'
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
                                placeholder='What will you do, who are you going with, what is the agenda'
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
                                Dates
                            </label>
                            <input
                                type='text'
                                id='dates'
                                name='dates'
                                className='border rounded w-full py-2 px-3 mb-2'
                                placeholder='Travelling Dates'
                                required
                                value={dates}
                                onChange={(e) => setDates(e.target.value)}
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
