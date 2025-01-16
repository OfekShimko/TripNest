import Hero from '../components/Hero.tsx';
import TripListings from '../components/TripListings.tsx';
import ActivityListings from '../components/ActivityListings.tsx';
import Button from "../components/button.tsx";

const HomePage = () => {
  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
      <Hero />
      <TripListings isHome={true} />
      <Button massege="View All Trips" where="/trips" />
      <ActivityListings isHome={true} />
      <Button massege="View All Activities" where="/activities" />
    </div>
  );
};

export default HomePage;
