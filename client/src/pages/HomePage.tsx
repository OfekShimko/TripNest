
import Hero from '../components/Hero.tsx';
import TripListings from '../components/TripListings.tsx';
import ActivityListings from '../components/ActivityListings.tsx';
import Button from "../components/button.tsx";

const HomePage = () => {
    return (
        <>
            <Hero/>
            <TripListings isHome={true} />
            <Button massege={'View All Trips'} where={'/trips'}/>
            <ActivityListings isHome={true}/>
            <Button massege={'View All Activities'} where={'/activities'}/>
        </>
    )
}

export default HomePage;
