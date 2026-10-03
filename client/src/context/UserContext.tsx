import React, { createContext, useContext, useState } from 'react';
import { User } from '../types/index.js';

interface UserContextType {
  currentUser: User;
  updateProfile: (name: string, handle?: string, avatarUrl?: string) => void;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  hasCustomProfile: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasCustomProfile, setHasCustomProfile] = useState<boolean>(() => {
    return !!localStorage.getItem('viberoom_custom_user');
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(() => {
    return !localStorage.getItem('viberoom_custom_user');
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('viberoom_custom_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    const randomId = Math.floor(1000 + Math.random() * 9000);
    return {
      id: `user-${Date.now()}-${randomId}`,
      name: 'Music Lover',
      handle: `listener_${randomId}`,
      avatarUrl: AVATAR_OPTIONS[0],
      status: 'online',
      streakDays: 1,
      totalListeningHours: 0.1,
      totalPlays: 1,
    };
  });

  const updateProfile = (name: string, handle?: string, avatarUrl?: string) => {
    const cleanName = name.trim() || 'Music Lover';
    const cleanHandle = (handle?.trim() || cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_')) || 'listener';
    const updatedUser: User = {
      ...currentUser,
      name: cleanName,
      handle: cleanHandle.startsWith('@') ? cleanHandle.slice(1) : cleanHandle,
      avatarUrl: avatarUrl || currentUser.avatarUrl || AVATAR_OPTIONS[0],
    };
    setCurrentUser(updatedUser);
    setHasCustomProfile(true);
    localStorage.setItem('viberoom_custom_user', JSON.stringify(updatedUser));
  };

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        updateProfile,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
        hasCustomProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
