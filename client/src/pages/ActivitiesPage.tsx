import { useState } from 'react';
import ActivityListings from '../components/ActivityListings';
import cityCoordinates from '../assets/json/useCoordinates.json';

const ActivitiesPage = () => {
  const cityNames = Object.keys(cityCoordinates);
  const [searchLocation, setSearchLocation] = useState('');
  const [activeSearch, setActiveSearch] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchLocation(value);

    if (value.trim() === '') {
      setActiveSearch([]);
      return;
    }

    const filteredCities = cityNames
      .filter((city) => city.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 8);
    setActiveSearch(filteredCities);
  };

  const handleSuggestionClick = (city: string) => {
    setSearchLocation(city);
    setActiveSearch([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch([]); // Hide suggestions on submit
  };

  const hasSearched = searchLocation.trim().length > 0;

  return (
    <section className='bg-cyan-50 px-4 py-6 flex flex-col items-center'>
      <form onSubmit={handleSubmit} className='w-[500px] relative mb-6'>
        <div className="relative">
          <input
            type="search"
            placeholder="Type Here"
            className="w-full p-4 rounded-full bg-slate-800 text-white focus:outline-none"
            value={searchLocation}
            onChange={handleInputChange}
          />
          <button
            type='submit'
            className='absolute right-0 top-1/2 -translate-y-1/2 p-4 bg-slate-600 rounded-full text-white hover:bg-slate-500 transition'
          >
            Search
          </button>
        </div>

        {activeSearch.length > 0 && (
          <div className="absolute top-20 p-4 bg-slate-800 text-white w-full rounded-xl left-1/2 -translate-x-1/2 flex flex-col gap-2 z-50">
            {activeSearch.map((city) => (
              <button
                key={city}
                className="text-left hover:bg-slate-700 p-2 rounded-lg"
                onClick={() => handleSuggestionClick(city)}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </form>

      {hasSearched ? (
        <div className='mb-10 w-full max-w-6xl'>
          <ActivityListings
            isHome={false}
            locationQuery={searchLocation}
            cityName={searchLocation}
          />
        </div>
      ) : (
        <>
          <div className='mb-10 w-full max-w-6xl'>
            <ActivityListings isHome={false} locationQuery='New York' cityName='New York' />
          </div>
          <div className='mb-10 w-full max-w-6xl'>
            <ActivityListings isHome={false} locationQuery='Washington DC' cityName='Washington DC' />
          </div>
          <div className='w-full max-w-6xl'>
            <ActivityListings isHome={false} locationQuery='Los Angeles' cityName='Los Angeles' />
          </div>
        </>
      )}
    </section>
  );
};

export default ActivitiesPage;
