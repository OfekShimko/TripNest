import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';
import MainLayout from './layouts/MainLayout.tsx';
import HomePage from './pages/HomePage.tsx';
import TripsPage from './pages/TripsPage.tsx';
import ActivitiesPage from './pages/ActivitiesPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import LandingPage from './pages/LandingPage.tsx';
import LogInPage from './pages/LogInPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import TripPage from './pages/TripPage.tsx';
import AddTripPage from "./pages/AddTripPage.tsx"
import ActivityPage from './pages/ActivityPage.tsx';

type Activity = {
  id: number;
  title: string;
  location: string;
  description: string;
};

type Trip = {
  id: string;
  title: string;
  type: string;
  description: string;
  location: string;
  dates: string;
  activities: { id: string }[];
};
const App = () => {
  const addTrip = async (newTrip:Trip) => {
    await fetch('/api/v1/trips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTrip),
    });
    return;
  };
    // Delete Trip
    const deleteTrip = async (id:string) => {
      await fetch(`/api/v1/trips/${id}`, {
        method: 'DELETE',
      });
      return;
    };

    const addActivityToTrip = async (tripId: string, activityId: string) => {
      const response = await fetch(`/api/v1/trips/${tripId}`);
      if (!response.ok) {
          throw new Error(`Failed to fetch trip with ID ${tripId}`);
      }
  
      const trip = await response.json();
  
      // Prevent duplicate activity addition
      if (trip.activities.some((activity: { id: string }) => activity.id === activityId)) {
          alert("Activity already exists in this trip!");
          return;
      }
  
      const updatedTrip = {
          ...trip,
          activities: [...trip.activities, { id: activityId }],
      };
  
      const updateResponse = await fetch(`/api/v1/trips/${tripId}`, {
          method: "PUT",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTrip),
      });
  
      if (!updateResponse.ok) {
          throw new Error(`Failed to update trip with ID ${tripId}`);
      }
  
      return await updateResponse.json();
  };
  
    

  
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LogInPage />} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path='/' element={<MainLayout />}>
          <Route path='/home' element={<HomePage />} />
          <Route path='/trips' element={<TripsPage />} />
          <Route path='/add-trip' element={<AddTripPage addTripSubmit={addTrip}/>} />
          <Route path='/trips/:id' element={<TripPage deleteTrip={deleteTrip} />} />
          <Route path='/activities' element={<ActivitiesPage />} />
          <Route path='/activities/:id' element={<ActivityPage addActivityToTrip={addActivityToTrip}/>} />
          <Route path='*' element={<NotFoundPage />} />
        </Route>
      </>

    )
  );

  return <RouterProvider router={router} />;
};
export default App;
