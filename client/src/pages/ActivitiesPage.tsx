import { useState } from 'react';
import ActivityListings from '../components/ActivityListings';

const ActivitiesPage = () => {
  const [searchLocation, setSearchLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The searchLocation state will be used in ActivityListings
  };

  return (
    <section className='bg-cyan-50 px-4 py-6'>
      <form onSubmit={handleSearch} className='mb-6 flex'>
        <input
          type='text'
          placeholder='Search location...'
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          className='border border-gray-300 rounded-l px-4 py-2 w-full'
        />
        <button
          type='submit'
          className='bg-cyan-700 text-white px-4 py-2 rounded-r hover:bg-cyan-600'
        >
          Search
        </button>
      </form>

      {/* If user searches, show that location first */}
      {searchLocation.trim() && (
        <div className='mb-10'>
          <ActivityListings isHome={false} locationQuery={searchLocation} cityName={searchLocation}/>
        </div>
      )}

      {/* Default Cities */}
      <div className='mb-10'>
        <ActivityListings isHome={false} locationQuery="Tel Aviv" cityName="Tel Aviv"/>
      </div>

      <div className='mb-10'>
        <ActivityListings isHome={false} locationQuery="Jerusalem" cityName="Jerusalem"/>
      </div>

      <div>
        <ActivityListings isHome={false} locationQuery="Haifa" cityName="Haifa"/>
      </div>
    </section>
  );
};

export default ActivitiesPage;
