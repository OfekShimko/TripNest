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
import TripEditPage from './pages/TripEditpage.tsx';
import { ActivityCacheProvider } from './components/ActivityCacheContext';

const App = () => {
  const userId = localStorage.getItem('userId');
  const addTrip = async (newTrip: {
    title: string;
    location: string;
    description: string;
    from_date: string;
    to_date: string;
  }): Promise<void> => {
    await fetch(`/api/v1/trips?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTrip),
    });
  };
  
    // Delete Trip
    const deleteTrip = async (id:string) => {
      await fetch(`/api/v1/trips/${id}?userId=${userId}`, {
        method: 'DELETE',
      });
      return;
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
