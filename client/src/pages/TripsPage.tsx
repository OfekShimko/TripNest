import TripListings from '../components/TripListings.tsx';
import { Link } from 'react-router-dom';

const TripsPage = () => {
  return (
    <>
      <section className='bg-cyan-50 px-4 py-6'>
        <TripListings isHome={false} />
      </section>
      <div className="flex justify-center items-center h-full">
              <Link 
            to={`/add-trip`}
            className='h-[48px] bg-teal-700 hover:bg-teal-600 text-white px-6 py-3 rounded-lg text-center text-lg'
          >
            Create New Trip
          </Link>
      </div>

    </>
      );


};
export default TripsPage;
