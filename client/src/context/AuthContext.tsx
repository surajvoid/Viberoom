import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, MusicPersonality, createUserAvatarSvg } from '../mockData.js';

export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { emailOrHandle: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    handle: string;
    email: string;
    password: string;
    sonicArchetype?: string;
    topGenre?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'viberoom_auth_user';
const REGISTERED_USERS_KEY = 'viberoom_registered_accounts';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from localStorage (only if user explicitly registered or logged in previously)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id && parsed.name) {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {
      console.warn('Error reading stored auth user:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async ({
    emailOrHandle,
    password,
  }: {
    emailOrHandle: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanId = emailOrHandle.trim().toLowerCase();
    const cleanPass = password.trim();

    // Realistic simulated authentication delay for loading state
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Please enter both your username/email and password.' };
    }

    if (cleanPass.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    // Check registered accounts in localStorage
    let registeredAccounts: any[] = [];
    try {
      const storedAccs = localStorage.getItem(REGISTERED_USERS_KEY);
      if (storedAccs) {
        registeredAccounts = JSON.parse(storedAccs);
      }
    } catch {}

    const found = registeredAccounts.find(
      (acc) =>
        acc.email?.toLowerCase() === cleanId ||
        acc.handle?.toLowerCase() === cleanId ||
        acc.handle?.toLowerCase() === `@${cleanId}`
    );

    if (found) {
      if (found.password && found.password !== cleanPass) {
        return { success: false, error: 'Invalid password. Please check your credentials.' };
      }

      const authenticatedUser: User = found.user;
      setCurrentUser(authenticatedUser);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
      } catch {}
      return { success: true };
    }

    // If no existing account matches but credentials meet validation,
    // inform the user that account was not found so they can register
    if (registeredAccounts.length > 0) {
      return {
        success: false,
        error: 'No account found with this username or email. Please register to create your account.',
      };
    }

    // Fallback: If local storage has no registered accounts yet (fresh session),
    // prompt user to register their own account
    return {
      success: false,
      error: 'Account not found. Please click "Create Account" below to register.',
    };
  };

  const register = async ({
    name,
    handle,
    email,
    password,
    sonicArchetype = 'The Sonic Explorer',
    topGenre = 'Electronic & Indie',
  }: {
    name: string;
    handle: string;
    email: string;
    password: string;
    sonicArchetype?: string;
    topGenre?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    // Realistic simulated registration delay
    await new Promise((resolve) => setTimeout(resolve, 750));

    const cleanName = name.trim();
    let cleanHandle = handle.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Please enter your full display name (at least 2 characters).' };
    }

    if (!cleanHandle) {
      return { success: false, error: 'Please choose a username handle.' };
    }

    if (!cleanHandle.startsWith('@')) {
      cleanHandle = `@${cleanHandle}`;
    }

    if (cleanHandle.length < 3) {
      return { success: false, error: 'Username handle must be at least 3 characters.' };
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!cleanPass || cleanPass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Retrieve existing accounts
    let registeredAccounts: any[] = [];
    try {
      const stored = localStorage.getItem(REGISTERED_USERS_KEY);
      if (stored) {
        registeredAccounts = JSON.parse(stored);
      }
    } catch {}

    // Check handle collision
    const handleTaken = registeredAccounts.some(
      (acc) => acc.handle.toLowerCase() === cleanHandle.toLowerCase()
    );
    if (handleTaken) {
      return { success: false, error: `The handle ${cleanHandle} is already taken. Please choose another.` };
    }

    const emailTaken = registeredAccounts.some(
      (acc) => acc.email.toLowerCase() === cleanEmail.toLowerCase()
    );
    if (emailTaken) {
      return { success: false, error: 'An account with this email address already exists. Please log in.' };
    }

    // Create the brand new user object
    const paletteOptions: [string, string][] = [
      ['#FF3D81', '#8B5CF6'],
      ['#8B5CF6', '#22D3EE'],
      ['#22D3EE', '#B6F23A'],
      ['#B6F23A', '#FF6B5A'],
      ['#FF6B5A', '#FF3D81'],
    ];
    const pickedPalette: [string, string] = paletteOptions[Math.floor(Math.random() * paletteOptions.length)];

    const personality: MusicPersonality = {
      topGenre,
      vibeTag: `${sonicArchetype} 🎧`,
      matchPercent: 100,
      sonicArchetype,
      weeklyListeningHours: 0,
    };

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      handle: cleanHandle,
      avatarSvg: createUserAvatarSvg(cleanName, pickedPalette),
      status: 'online',
      isFriend: false,
      musicPersonality: personality,
    };

    // Save to accounts list
    registeredAccounts.push({
      email: cleanEmail,
      handle: cleanHandle,
      password: cleanPass,
      user: newUser,
    });

    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredAccounts));
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
