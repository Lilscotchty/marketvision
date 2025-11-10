
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import type { UserAppData, Role } from '@/types';

// The owner of the application
const OWNER_EMAIL = 'pb7552212@gmail.com';
const INITIAL_TRIAL_POINTS = 5;

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  userData: UserAppData | null; // This will now be a snapshot, not for direct mutation
  hasRole: (role: Role) => boolean; // Helper function to check roles
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
    
    // Check if the user is the owner
    const isOwner = firebaseUser.email === OWNER_EMAIL;

    if (isOwner) {
      setUserData({
        userId: firebaseUser.uid,
        email: firebaseUser.email || '',
        chartAnalysisTrialPoints: 9999,
        hasActiveSubscription: true,
        roles: ['Owner', 'Developer'],
      });
      return;
    }

    try {
      const storedUserDataString = localStorage.getItem(`userData-${firebaseUser.uid}`);
      let finalUserData: UserAppData;

      if (storedUserDataString) {
        const storedUserData = JSON.parse(storedUserDataString) as Partial<UserAppData>;
        finalUserData = {
          userId: firebaseUser.uid,
          email: firebaseUser.email || '',
          chartAnalysisTrialPoints: storedUserData.chartAnalysisTrialPoints ?? INITIAL_TRIAL_POINTS,
          hasActiveSubscription: storedUserData.hasActiveSubscription ?? false,
          roles: storedUserData.roles && Array.isArray(storedUserData.roles) && storedUserData.roles.length > 0 ? storedUserData.roles : ['User'],
        };
      } else {
        // Initialize for a new user
        finalUserData = {
          userId: firebaseUser.uid,
          email: firebaseUser.email || '',
          chartAnalysisTrialPoints: INITIAL_TRIAL_POINTS,
          hasActiveSubscription: false,
          roles: ['User'],
        };
      }
      
       // Sanitize data
      if (finalUserData.chartAnalysisTrialPoints < 0) finalUserData.chartAnalysisTrialPoints = 0;
      
      setUserData(finalUserData);
      localStorage.setItem(`userData-${firebaseUser.uid}`, JSON.stringify(finalUserData));

    } catch (e) {
      console.error("Failed to parse user data from localStorage", e);
      // Fallback in case of parsing error
      setUserData({
        userId: firebaseUser.uid,
        email: firebaseUser.email || '',
        chartAnalysisTrialPoints: INITIAL_TRIAL_POINTS,
        hasActiveSubscription: false,
        roles: ['User'],
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

  const hasRole = (role: Role): boolean => {
    return userData?.roles?.includes(role) ?? false;  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, userData, hasRole }}>
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
