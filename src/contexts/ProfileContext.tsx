import React, { createContext, useContext, useState, useCallback } from 'react';
import { Profile, PROFILES } from '../types/activity';

interface ProfileContextType {
  currentProfile: Profile | null;
  isAuthenticated: boolean;
  login: (profile: Profile, pin: string) => boolean;
  logout: () => void;
  getProfileInfo: () => typeof PROFILES[0] | null;
}

const ProfileContext = createContext<ProfileContextType>({
  currentProfile: null,
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
  getProfileInfo: () => null,
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

  const login = useCallback((profile: Profile, pin: string): boolean => {
    const info = PROFILES.find(p => p.key === profile);
    if (info && info.pin === pin) {
      setCurrentProfile(profile);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentProfile(null);
  }, []);

  const getProfileInfoFn = useCallback(() => {
    if (!currentProfile) return null;
    return PROFILES.find(p => p.key === currentProfile) || null;
  }, [currentProfile]);

  return (
    <ProfileContext.Provider value={{
      currentProfile,
      isAuthenticated: currentProfile !== null,
      login,
      logout,
      getProfileInfo: getProfileInfoFn,
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
