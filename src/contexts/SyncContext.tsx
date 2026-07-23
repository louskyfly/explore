import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useProfile } from './ProfileContext';
import { useActivities } from './ActivityContext';
import { Activity, Profile } from '../types/activity';
import * as Sync from '../services/syncService';
import * as Queue from '../services/syncQueue';
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
  const { activities, refresh } = useActivities();
  const [isOnline, setIsOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [enabled, setEnabledState] = useState(false);
  const syncInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Queue.getPendingQueue().then(q => setPendingCount(q.length));
  }, []);

  useEffect(() => {
    const check = () => {
      if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
        setIsOnline(navigator.onLine);
      } else {
        setIsOnline(true);
      }
    };
    check();
    const onFocus = () => check();
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus);
      return () => window.removeEventListener('focus', onFocus);
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (!enabled || isSyncing || !currentProfile) return;
    setIsSyncing(true);
    try {
      const queue = await Queue.getPendingQueue();
      if (queue.length > 0) {
        await Queue.processQueue(
          async (a) => await Sync.pushActivity(a),
          async (id) => await Sync.removeActivity(id),
          async (id) => await DB.getActivity(id),
        );
      }

      const remoteActivities = await Sync.pullActivities(currentProfile);
      const localActivities = await DB.getAllActivities(currentProfile);

      const remoteMap = new Map(remoteActivities.map(a => [a.id, a]));
      const localMap = new Map(localActivities.map(a => [a.id, a]));

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
      const q = await Queue.getPendingQueue();
      setPendingCount(q.length);
      setLastSync(new Date().toISOString());
    } catch (e) {
      console.log('Sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [enabled, isSyncing, currentProfile, refresh]);

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v);
    if (v) {
      syncNow();
    }
  }, [syncNow]);

  useEffect(() => {
    if (enabled && isOnline) {
      syncInterval.current = setInterval(syncNow, 30000);
    }
    return () => {
      if (syncInterval.current) clearInterval(syncInterval.current);
    };
  }, [enabled, isOnline, syncNow]);

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
