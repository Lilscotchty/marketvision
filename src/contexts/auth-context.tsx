
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import type { UserAppData } from '@/types';

// List of developer emails with full access
const DEVELOPER_EMAILS = ['pb7552212@gmail.com'];
const INITIAL_TRIAL_POINTS = 5;

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  userData: UserAppData | null;
  decrementTrialPoint: () => void;
  activateSubscription: () => void;
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

    // Handle developer accounts with special privileges
    if (DEVELOPER_EMAILS.includes(firebaseUser.email || '')) {
      setUserData({
        userId: firebaseUser.uid,
        email: firebaseUser.email || '',
        chartAnalysisTrialPoints: 9999, // Unlimited trials
        hasActiveSubscription: true,    // Always active subscription
      });
      return;
    }

    // Handle regular users, simulating data fetch from localStorage
    try {
      const storedUserDataString = localStorage.getItem(`userData-${firebaseUser.uid}`);
      if (storedUserDataString) {
        const storedUserData = JSON.parse(storedUserDataString) as UserAppData;
        // Ensure data integrity from older versions
        if (typeof storedUserData.chartAnalysisTrialPoints === 'undefined') {
          storedUserData.chartAnalysisTrialPoints = INITIAL_TRIAL_POINTS;
        }
        if (storedUserData.chartAnalysisTrialPoints < 0) {
          storedUserData.chartAnalysisTrialPoints = 0;
        }
        if (typeof storedUserData.hasActiveSubscription === 'undefined') {
          storedUserData.hasActiveSubscription = false;
        }
        setUserData(storedUserData);
      } else {
        // Default for new non-developer users
        const newUser: UserAppData = {
          userId: firebaseUser.uid,
          email: firebaseUser.email || '',
          chartAnalysisTrialPoints: INITIAL_TRIAL_POINTS,
          hasActiveSubscription: false,
        };
        setUserData(newUser);
        localStorage.setItem(`userData-${firebaseUser.uid}`, JSON.stringify(newUser));
      }
    } catch (e) {
      console.error("Failed to parse or set user data from localStorage", e);
      // Fallback to default if there's an error
      setUserData({
        userId: firebaseUser.uid,
        email: firebaseUser.email || '',
        chartAnalysisTrialPoints: INITIAL_TRIAL_POINTS,
        hasActiveSubscription: false,
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      initializeOrUpdateUserData(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [initializeOrUpdateUserData]);

  // Persist non-developer userData to localStorage when it changes
  useEffect(() => {
    if (userData && user && !DEVELOPER_EMAILS.includes(user.email || '')) {
      localStorage.setItem(`userData-${user.uid}`, JSON.stringify(userData));
    }
  }, [userData, user]);

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

  const decrementTrialPoint = useCallback(() => {
    if (userData && !userData.hasActiveSubscription && userData.chartAnalysisTrialPoints > 0) {
      setUserData(prev => {
        if (!prev) return null;
        const newPoints = Math.max(0, prev.chartAnalysisTrialPoints - 1);
        return { ...prev, chartAnalysisTrialPoints: newPoints };
      });
    }
  }, [userData]);

  const activateSubscription = useCallback(() => {
    if (userData) {
      setUserData(prev => {
        if (!prev) return null;
        return { ...prev, hasActiveSubscription: true };
      });
    }
  }, [userData]);

  return (
    <AuthContext.Provider value={{ user, loading, logout, userData, decrementTrialPoint, activateSubscription }}>
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
