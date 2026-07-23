import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Activity, Category, Priority, Status, Profile } from '../types/activity';
import * as DB from '../services/database';
import { useProfile } from './ProfileContext';

interface Filters {
  search: string;
  category: Category | null;
  status: Status | null;
  priority: Priority | null;
}

interface ActivityContextType {
  activities: Activity[];
  filtered: Activity[];
  loading: boolean;
  filters: Filters;
  setFilters: (f: Partial<Filters>) => void;
  refresh: () => Promise<void>;
  addActivity: (a: Activity) => Promise<void>;
  updateActivity: (a: Activity) => Promise<void>;
  removeActivity: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  archiveActivity: (id: string) => Promise<void>;
  duplicateActivity: (id: string) => Promise<void>;
  reorderActivities: (ids: string[]) => Promise<void>;
  getLocalActivity: (id: string) => Promise<Activity | null>;
}

const ActivityContext = createContext<ActivityContextType>({
  activities: [],
  filtered: [],
  loading: true,
  filters: { search: '', category: null, status: null, priority: null },
  setFilters: () => {},
  refresh: async () => {},
  addActivity: async () => {},
  updateActivity: async () => {},
  removeActivity: async () => {},
  toggleFavorite: async () => {},
  archiveActivity: async () => {},
  duplicateActivity: async () => {},
  reorderActivities: async () => {},
  getLocalActivity: async () => null,
});

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const { currentProfile } = useProfile();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFiltersState] = useState<Filters>({
    search: '', category: null, status: null, priority: null,
  });

  const refresh = useCallback(async () => {
    if (!currentProfile) {
      setActivities([]);
      setLoading(false);
      return;
    }
    const all = await DB.getAllActivities(currentProfile);
    setActivities(all);
    setLoading(false);
  }, [currentProfile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setActivities([]);
    setLoading(true);
  }, [currentProfile]);

  const filtered = activities.filter(a => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!a.title.toLowerCase().includes(q) && !a.description.toLowerCase().includes(q) &&
          !a.city.toLowerCase().includes(q) && !a.placeName.toLowerCase().includes(q)) return false;
    }
    if (filters.category && a.category !== filters.category) return false;
    if (filters.status && a.status !== filters.status) return false;
    if (filters.priority && a.priority !== filters.priority) return false;
    return true;
  });

  const setFilters = useCallback((f: Partial<Filters>) => {
    setFiltersState(prev => ({ ...prev, ...f }));
  }, []);

  const getLocalActivity = useCallback(async (id: string) => {
    return DB.getActivity(id);
  }, []);

  const addActivity = useCallback(async (a: Activity) => {
    if (!currentProfile) return;
    a.profile = currentProfile;
    await DB.insertActivity(a);
    await refresh();
  }, [refresh, currentProfile]);

  const updateActivity = useCallback(async (a: Activity) => {
    await DB.updateActivity(a);
    await refresh();
  }, [refresh]);

  const removeActivity = useCallback(async (id: string) => {
    await DB.deleteActivity(id);
    await refresh();
  }, [refresh]);

  const toggleFavorite = useCallback(async (id: string) => {
    const a = activities.find(act => act.id === id);
    if (!a) return;
    const updated = { ...a, isFavorite: !a.isFavorite, updatedAt: new Date().toISOString() };
    await DB.updateActivity(updated);
    await refresh();
  }, [activities, refresh]);

  const archiveActivity = useCallback(async (id: string) => {
    const a = activities.find(act => act.id === id);
    if (!a) return;
    const updated = { ...a, isArchived: true, updatedAt: new Date().toISOString() };
    await DB.updateActivity(updated);
    await refresh();
  }, [activities, refresh]);

  const duplicateActivity = useCallback(async (id: string) => {
    const a = activities.find(act => act.id === id);
    if (!a) return;
    if (!currentProfile) return;
    const now = new Date().toISOString();
    const dup: Activity = {
      ...a,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      profile: currentProfile,
      title: `${a.title} (copie)`,
      isFavorite: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      order: activities.length,
    };
    await DB.insertActivity(dup);
    await refresh();
  }, [activities, refresh, currentProfile]);

  const reorderActivities = useCallback(async (ids: string[]) => {
    const updates = ids.map((id, i) => {
      const a = activities.find(act => act.id === id);
      if (!a) return null;
      return { ...a, order: i };
    }).filter(Boolean) as Activity[];
    for (const u of updates) {
      await DB.updateActivity(u);
    }
    await refresh();
  }, [activities, refresh]);

  return (
    <ActivityContext.Provider value={{
      activities, filtered, loading, filters, setFilters, refresh,
      addActivity, updateActivity, removeActivity, toggleFavorite,
      archiveActivity, duplicateActivity, reorderActivities, getLocalActivity,
    }}>
      {children}
    </ActivityContext.Provider>
  );
}

export const useActivities = () => useContext(ActivityContext);
