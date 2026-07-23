import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useProfile } from './ProfileContext';
import { useActivities } from './ActivityContext';
import { Activity, Profile } from '../types/activity';
import * as Sync from '../services/syncService';
import * as DB from '../services/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: string | null;
  syncNow: () => Promise<void>;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  token: string | null;
  setToken: (t: string) => Promise<void>;
}

const SyncContext = createContext<SyncContextType>({
  isOnline: false,
  isSyncing: false,
  lastSync: null,
  syncNow: async () => {},
  enabled: false,
  setEnabled: () => {},
  token: null,
  setToken: async () => {},
});

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { currentProfile } = useProfile();
  const { activities, refresh, getLocalActivity } = useActivities();
  const [isOnline, setIsOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [enabled, setEnabledState] = useState(false);
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    Sync.getToken().then(t => {
      if (t) {
        setTokenState(t);
        setEnabledState(true);
      }
    }).catch(() => {});
    Sync.getGistId().catch(() => {});
  }, []);

  useEffect(() => {
    try { setIsOnline(navigator.onLine); } catch { setIsOnline(true); }
  }, []);

  const setToken = useCallback(async (t: string) => {
    await Sync.setToken(t);
    setTokenState(t);
  }, []);

  const syncNow = useCallback(async () => {
    if (!enabled || isSyncing || !currentProfile || !token) return;
    setIsSyncing(true);
    try {
      await Sync.pushToGist(activities);

      const remoteActivities = await Sync.pullFromGist(currentProfile);
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
          await Sync.pushToGist([local]);
        }
      }

      await refresh();
      setLastSync(new Date().toISOString());
    } catch (e: any) {
      console.log('Sync error:', e?.message);
    } finally {
      setIsSyncing(false);
    }
  }, [enabled, isSyncing, currentProfile, refresh, activities, token]);

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v);
    if (v && token) syncNow();
  }, [syncNow, token]);

  return (
    <SyncContext.Provider value={{
      isOnline, isSyncing, lastSync,
      syncNow, enabled, setEnabled, token, setToken,
    }}>
      {children}
    </SyncContext.Provider>
  );
}

export const useSync = () => useContext(SyncContext);
