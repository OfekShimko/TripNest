import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute';
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
import TripEditPage from './pages/TripEditpage.tsx';
import { ActivityCacheProvider } from './components/ActivityCacheContext';


const App = () => {
  const addTrip = async (newTrip: {
    title: string;
    location: string;
    description: string;
    from_date: string;
    to_date: string;
    user_id: string;
  }): Promise<void> => {
    await fetch('/api/v1/trips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTrip),
    });
  };
  
    // Delete Trip
    const deleteTrip = async (id:string) => {
      const userId = localStorage.getItem('userId');
      await fetch(`/api/v1/trips/${id}?userId=${userId}`, {
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
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LogInPage />} />
        <Route path="/register" element={<RegisterPage />} />
  
        {/* Routes under MainLayout */}
        <Route path="/" element={<MainLayout />}>
          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/add-trip" element={<AddTripPage addTripSubmit={addTrip} />} />
            <Route path="/trips/edit/:id" element={<TripEditPage />} />
            <Route path="/trips/:id" element={<TripPage deleteTrip={deleteTrip} />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/activities/:id" element={<ActivityPage addActivityToTrip={addActivityToTrip} />} />
          </Route>
          {/* Fallback Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </>
    )
  );
  


  return (
    <ActivityCacheProvider>
      <RouterProvider router={router} />
    </ActivityCacheProvider>
  );
};
export default App;
