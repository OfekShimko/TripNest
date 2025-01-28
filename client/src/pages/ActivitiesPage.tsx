import { useState } from 'react';
import { toast } from 'react-toastify';
import ActivityListings from '../components/ActivityListings';
import cityCoordinates from '../assets/json/usaCoordinates.json';

const ActivitiesPage = () => {

  const cityNames = Object.keys(cityCoordinates);

  const [searchLocation, setSearchLocation] = useState('');
  const [finalQuery, setFinalQuery] = useState('');
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
    setFinalQuery(city);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch([]);

    const typed = searchLocation.trim().toLowerCase();

    const matchedCity = cityNames.find(
      (city) => city.toLowerCase() === typed
    );

    if (matchedCity) {
      setFinalQuery(matchedCity);
    } else {

      toast.error('City not found. Please choose from suggestions!', {
        position: 'top-center',
        autoClose: 3000,
      });
    }
  };


  const hasSearched = finalQuery.trim().length > 0;

  return (
    <section
      className="
        min-h-screen bg-white dark:bg-gray-900 
        text-black dark:text-white 
        px-4 py-6 flex flex-col items-center
      "
    >
      <form onSubmit={handleSubmit} className="w-[500px] relative mb-6">
        <div className="relative">
          <input
            type="search"
            placeholder="Type here"
            className="
              w-full p-4 rounded-full
              bg-white text-black
              dark:bg-slate-800 dark:text-white
              focus:outline-none
            "
            value={searchLocation}
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="
              absolute right-0 top-1/2 -translate-y-1/2 p-4 
              bg-slate-600 hover:bg-slate-500 
              dark:bg-slate-700 dark:hover:bg-slate-600
              text-white rounded-full transition
            "
          >
            Search
          </button>
        </div>

        {activeSearch.length > 0 && (
          <div
            className="
              absolute top-20 p-4 bg-slate-800 
              dark:bg-slate-700 text-white w-full 
              rounded-xl left-1/2 -translate-x-1/2
              flex flex-col gap-2 z-50
            "
          >
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
        <div className="mb-10 w-full max-w-6xl">
          <ActivityListings
            isHome={false}
            locationQuery={finalQuery}
            cityName={finalQuery}
          />
        </div>
      ) : (
        <>
          <div className="mb-10 w-full max-w-8xl">
            <ActivityListings
              isHome={false}
              locationQuery="New York"
              cityName="New York"
            />
          </div>
          <div className="mb-10 w-full max-w-8xl">
            <ActivityListings
              isHome={false}
              locationQuery="Washington DC"
              cityName="Washington DC"
            />
          </div>
          <div className="w-full max-w-8xl">
            <ActivityListings
              isHome={false}
              locationQuery="Los Angeles"
              cityName="Los Angeles"
            />
          </div>
        </>
      )}
    </section>
  );
};

export default ActivitiesPage;
