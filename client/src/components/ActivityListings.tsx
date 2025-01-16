import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ActivityListing from './ActivityListing';
import Spinner from './Spinner';
import { useActivityCache } from './ActivityCacheContext';

type Activity = {
  id: string;
  title: string;
  location: string;
  description: string;
  image_url: string;
  kinds?: string;
};

interface ActivityListingsProps {
  isHome?: boolean;
  locationQuery?: string;
  cityName?: string;
}

const ActivityListings = ({ isHome = false, locationQuery, cityName }: ActivityListingsProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestUrlRef = useRef<string>('');
  const timeoutRef = useRef<number>();
  const fetchCache = useRef<Map<string, Activity[]>>(new Map());
  const [shouldShowLoading, setShouldShowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activityCache = useActivityCache();

  const apiUrl = useMemo(() => {
    if (isHome) return '/api/v1/activities';
    return locationQuery && locationQuery.trim() !== ''
      ? `/api/v1/activities?location=${encodeURIComponent(locationQuery)}`
      : `/api/v1/activities`;
  }, [isHome, locationQuery]);

  const fetchActivities = async () => {
    // Check global cache first
    const cachedActivities = activityCache.getActivities(apiUrl);
    if (cachedActivities) {
      setActivities(cachedActivities);
      setLoading(false);
      return;
    }

    // If this URL was just requested, skip
    if (apiUrl === lastRequestUrlRef.current) {
      return;
    }

    lastRequestUrlRef.current = apiUrl;

    try {
      const res = await fetch(apiUrl, {
        signal: abortControllerRef.current?.signal,
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'public, max-age=300',
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Server responded with error: ${errorText}`);
        throw new Error(`Error fetching data: ${errorText}`);
      }

      const data = await res.json();

      const mappedActivities: Activity[] = data.map((activity: any) => ({
        id: activity.xid,
        title: activity.name,
        location:
          locationQuery && locationQuery.trim() !== ''
            ? locationQuery
            : cityName || 'New York',
        description: activity.description || '',
        image_url: activity.image_url || '',
        kinds: activity.kinds,
      }));

      // Store in global cache
      activityCache.setActivities(apiUrl, mappedActivities);

      setActivities(mappedActivities);
    } catch (error) {
      // Only log error if it's not an abort error
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Error fetching data:', error);
        setError('Unable to load activities. Please try again.');
        setActivities(fetchCache.current.get(apiUrl) || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear any pending timeouts
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Debounce the fetch call
    timeoutRef.current = window.setTimeout(() => {
      setLoading(true);
      setCurrentIndex(0);
      fetchActivities();
    }, 150); // 150ms debounce

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [locationQuery, isHome, cityName]);

  useEffect(() => {
    if (loading) {
      // Only show loading spinner if loading takes more than 200ms
      const timer = setTimeout(() => {
        setShouldShowLoading(true);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setShouldShowLoading(false);
    }
  }, [loading]);

  const activitiesToShow = useMemo(
    () => activities.slice(currentIndex, currentIndex + 4),
    [activities, currentIndex]
  );

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 4);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex + 4 < activities.length) {
      setCurrentIndex((prev) => prev + 4);
    }
  }, [currentIndex, activities.length]);

  return (
    <section className="px-4 py-10 relative bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="container-xl lg:container m-auto">
        {cityName && (
          <h2 className="text-4xl font-bold text-cyan-800 dark:text-cyan-400 mb-4 text-center relative">
            {cityName}
            <div className="w-16 h-1 bg-cyan-800 dark:bg-cyan-400 mx-auto mt-2"></div>
          </h2>
        )}

        {error && (
          <div className="text-red-600 dark:text-red-400 text-center py-4 mb-4">
            <p>{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchActivities();
              }}
              className="mt-2 px-4 py-2 bg-cyan-700 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded"
            >
              Try Again
            </button>
          </div>
        )}

        {shouldShowLoading ? (
          <Spinner loading={loading} />
        ) : (
          <div className="relative flex items-center justify-center px-10">
            {currentIndex > 0 && (
              <button
                onClick={handlePrev}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 
                           bg-cyan-700 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 
                           text-white rounded-full w-10 h-10 flex items-center justify-center z-10"
              >
                {'<'}
              </button>
            )}

            <div className="flex gap-6 overflow-hidden">
              {activitiesToShow.map((activity: Activity) => (
                <ActivityListing key={activity.id} activity={activity} />
              ))}
            </div>

            {currentIndex + 4 < activities.length && (
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 
                           bg-cyan-700 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 
                           text-white rounded-full w-10 h-10 flex items-center justify-center z-10"
              >
                {'>'}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ActivityListings;
