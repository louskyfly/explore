import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useProfile } from './ProfileContext';
import { useActivities } from './ActivityContext';
import { Activity, Profile } from '../types/activity';
import { addToQueue, getPendingQueue, processQueue } from '../services/syncQueue';
import * as Sync from '../services/syncService';
import * as DB from '../services/database';

interface SyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: string | null;
  pendingCount: number;
  syncNow: () => Promise<void>;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}

const SyncContext = createContext<SyncContextType>({
  isOnline: false,
  isSyncing: false,
  lastSync: null,
  pendingCount: 0,
  syncNow: async () => {},
  enabled: false,
  setEnabled: () => {},
});

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { currentProfile } = useProfile();
  const { activities, refresh, getLocalActivity } = useActivities();
  const [isOnline, setIsOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [enabled, setEnabledState] = useState(false);

  useEffect(() => {
    getPendingQueue().then(q => setPendingCount(q.length)).catch(() => {});
  }, []);

  useEffect(() => {
    try {
      setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    } catch {
      setIsOnline(true);
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (!enabled || isSyncing || !currentProfile) return;
    setIsSyncing(true);
    try {
      await processQueue(
        async (a) => await Sync.pushActivity(a),
        async (id) => await Sync.removeActivity(id),
        async (id) => getLocalActivity(id),
      );

      const remoteActivities = await Sync.pullActivities(currentProfile);
      const localMap = new Map(activities.map(a => [a.id, a]));
      const remoteMap = new Map(remoteActivities.map(a => [a.id, a]));

      for (const [id, remote] of remoteMap) {
        const local = localMap.get(id);
        if (!local) {
          await DB.insertActivity(remote);
        } else if (new Date(remote.updatedAt) > new Date(local.updatedAt)) {
          await DB.updateActivity(remote);
        }
      }

      for (const [id, local] of localMap) {
        if (!remoteMap.has(id)) {
          await Sync.pushActivity(local);
        }
      }

      await refresh();
      const queue = await getPendingQueue();
      setPendingCount(queue.length);
      setLastSync(new Date().toISOString());
    } catch (e) {
      console.log('Sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [enabled, isSyncing, currentProfile, refresh, activities, getLocalActivity]);

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v);
    if (v) syncNow();
  }, [syncNow]);

  return (
    <SyncContext.Provider value={{
      isOnline, isSyncing, lastSync, pendingCount,
      syncNow, enabled, setEnabled,
    }}>
      {children}
    </SyncContext.Provider>
  );
}

export const useSync = () => useContext(SyncContext);
