import { createContext, useContext, useRef } from 'react';

type Activity = {
  id: string;
  title: string;
  location: string;
  description: string;
  image_url: string;
  kinds?: string;
};

type ActivityCache = {
  getActivities: (key: string) => Activity[] | undefined;
  setActivities: (key: string, activities: Activity[]) => void;
};

const ActivityCacheContext = createContext<ActivityCache | null>(null);

export function ActivityCacheProvider({ children }: { children: React.ReactNode }) {
  const cache = useRef<Map<string, Activity[]>>(new Map());

  const value = {
    getActivities: (key: string) => cache.current.get(key),
    setActivities: (key: string, activities: Activity[]) => cache.current.set(key, activities),
  };

  return (
    <ActivityCacheContext.Provider value={value}>
      {children}
    </ActivityCacheContext.Provider>
  );
}

export function useActivityCache() {
  const context = useContext(ActivityCacheContext);
  if (!context) {
    throw new Error('useActivityCache must be used within an ActivityCacheProvider');
  }
  return context;
}