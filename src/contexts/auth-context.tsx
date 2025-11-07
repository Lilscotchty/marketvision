
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import type { UserAppData } from '@/types';

// List of developer emails with full access
const DEVELOPER_EMAILS = ['pb7552212@gmail.com', 'dev@example.com'];
const INITIAL_TRIAL_POINTS = 5;

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  userData: UserAppData | null; // This will now be a snapshot, not for direct mutation
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserAppData | null>(null);
  const router = useRouter();

  const initializeOrUpdateUserData = useCallback((firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      setUserData(null);
      return;
    }
    
    const isDeveloper = DEVELOPER_EMAILS.includes(firebaseUser.email || '');

    if (isDeveloper) {
      setUserData({
        userId: firebaseUser.uid,
        email: firebaseUser.email || '',
        chartAnalysisTrialPoints: 9999,
        hasActiveSubscription: true,
        isDeveloper: true,
      });
      return;
    }

    try {
      const storedUserDataString = localStorage.getItem(`userData-${firebaseUser.uid}`);
      if (storedUserDataString) {
        const storedUserData = JSON.parse(storedUserDataString) as UserAppData;
        if (typeof storedUserData.chartAnalysisTrialPoints === 'undefined') {
          storedUserData.chartAnalysisTrialPoints = INITIAL_TRIAL_POINTS;
        }
         if (storedUserData.chartAnalysisTrialPoints < 0) {
          storedUserData.chartAnalysisTrialPoints = 0;
        }
        if (typeof storedUserData.hasActiveSubscription === 'undefined') {
          storedUserData.hasActiveSubscription = false;
        }
        storedUserData.isDeveloper = false; // Ensure non-devs are marked as such
        setUserData(storedUserData);
      } else {
        const newUser: UserAppData = {
          userId: firebaseUser.uid,
          email: firebaseUser.email || '',
          chartAnalysisTrialPoints: INITIAL_TRIAL_POINTS,
          hasActiveSubscription: false,
          isDeveloper: false,
        };
        setUserData(newUser);
        localStorage.setItem(`userData-${firebaseUser.uid}`, JSON.stringify(newUser));
      }
    } catch (e) {
      console.error("Failed to parse user data from localStorage", e);
      setUserData({
        userId: firebaseUser.uid,
        email: firebaseUser.email || '',
        chartAnalysisTrialPoints: INITIAL_TRIAL_POINTS,
        hasActiveSubscription: false,
        isDeveloper: false,
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      initializeOrUpdateUserData(firebaseUser);
      setLoading(false);
    });

    const handleStorageChange = (event: StorageEvent) => {
      if (user && event.key === `userData-${user.uid}`) {
        initializeOrUpdateUserData(user);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
        unsubscribe();
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [initializeOrUpdateUserData, user]);
  

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, userData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
