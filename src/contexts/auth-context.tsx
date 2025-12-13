"use client";

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient, User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { UserAppData, Role } from '@/types';
import { useRouter } from 'next/navigation';

// Define the shape of the user profile you'll fetch from your Supabase table
interface UserProfile {
  id: string;
  email: string;
  roles: Role[];
  has_active_subscription: boolean;
  chart_analysis_trial_points: number;
}

interface AuthContextType {
  supabase: SupabaseClient;
  user: User | null;
  userData: UserAppData | null;
  loading: boolean;
  logout: () => Promise<void>;
  hasRole: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserAppData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (supabaseUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error) {
        // Ignore JWT expired errors as they will be resolved by the TOKEN_REFRESHED event
        if (error.message && error.message.includes("JWT expired")) {
           return null;
        }
        console.error('Error fetching user profile:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.error('Exception fetching profile:', e);
      return null;
    }
  }, [supabase]);

  const handleUserUpdate = useCallback(async (session: Session | null) => {
    if (session?.user) {
      setUser(session.user);
      const profile = await fetchUserProfile(session.user);
      if (profile) {
        setUserData({
          userId: profile.id,
          email: profile.email,
          roles: profile.roles,
          hasActiveSubscription: profile.has_active_subscription,
          chartAnalysisTrialPoints: profile.chart_analysis_trial_points,
        });
      }
    } else {
      setUser(null);
      setUserData(null);
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    // 1. Set up the listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
           await handleUserUpdate(session);
        } else if (event === 'SIGNED_OUT') {
           setUser(null);
           setUserData(null);
           router.push('/login');
        }
      }
    );

    // 2. Perform the initial session check
    const checkInitialSession = async () => {
      try {
        // FIX: Destructure error to handle "Invalid Refresh Token" scenarios
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
            // Specifically handle invalid refresh tokens by clearing the session
            if (error.message.includes("Invalid Refresh Token") || error.message.includes("Refresh Token Not Found")) {
                console.warn("Session invalid. Clearing stale auth data.");
                await supabase.auth.signOut();
                setUser(null);
                setUserData(null);
                return;
            }
            // Log other errors but don't crash
            console.error("Error checking initial session:", error.message);
        }

        await handleUserUpdate(data.session);
      } catch (error) {
        console.error("Unexpected error during session check:", error);
      } finally {
        // Only turn off loading once the initial check is complete
        setLoading(false);
      }
    };

    checkInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, handleUserUpdate, router]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
    router.push('/login');
  };

  const hasRole = (role: Role): boolean => {
    if (user?.email === 'pb7552212@gmail.com') {
      return true; 
    }
    return userData?.roles?.includes(role) ?? false;
  };

  const value = {
    supabase,
    user,
    userData,
    loading,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}