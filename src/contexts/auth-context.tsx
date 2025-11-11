"use client";

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient, User } from '@supabase/supabase-js';
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
        .single();

      if (error) {
        console.error('Error fetching user profile:', error.message);
        // Maybe this is a new user, and the profile hasn't been created yet.
        // We can create one here.
        if (error.code === 'PGRST116') { // "pgrst116" = row not found
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: supabaseUser.id,
              email: supabaseUser.email,
              roles: ['User'],
              has_active_subscription: false,
              chart_analysis_trial_points: 5 // Default trial points
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating profile:', insertError.message);
            return null;
          }
          return newProfile;
        }
        return null;
      }
      return data;
    } catch (e) {
      console.error('Exception fetching profile:', e);
      return null;
    }
  }, [supabase]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true);
        if (event === 'SIGNED_IN' && session) {
          const supabaseUser = session.user;
          setUser(supabaseUser);
          const profile = await fetchUserProfile(supabaseUser);
          if (profile) {
            setUserData({
              userId: profile.id,
              email: profile.email,
              roles: profile.roles,
              hasActiveSubscription: profile.has_active_subscription,
              chartAnalysisTrialPoints: profile.chart_analysis_trial_points,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserData(null);
        }
        setLoading(false);
      }
    );

    // Check for initial session on load
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const supabaseUser = session.user;
        setUser(supabaseUser);
        const profile = await fetchUserProfile(supabaseUser);
        if (profile) {
          setUserData({
            userId: profile.id,
            email: profile.email,
            roles: profile.roles,
            hasActiveSubscription: profile.has_active_subscription,
            chartAnalysisTrialPoints: profile.chart_analysis_trial_points,
          });
        }
      }
      setLoading(false);
    };

    checkInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
    router.push('/login');
  };

  const hasRole = (role: Role): boolean => {
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
