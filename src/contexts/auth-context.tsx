"use client";

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient, User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { UserAppData, Role } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  supabase: SupabaseClient;
  user: User | null;
  userData: UserAppData | null;
  loading: boolean;
  logout: () => Promise<void>;
  hasRole: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Time constants
const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 Minutes
const AUTH_INIT_TIMEOUT = 2500; // 2.5 Seconds fail-safe

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserAppData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Ref to track inactivity timeout
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchUserProfile = useCallback(async (supabaseUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error) {
        if (error.message && error.message.includes("JWT expired")) return null;
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

  // --- NEW: INACTIVITY & RECOVERY LOGIC ---
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    
    inactivityTimer.current = setTimeout(async () => {
      console.warn("User inactive. Clearing session for security.");
      await logout();
    }, INACTIVITY_LIMIT);
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    router.push('/login');
    // Force a hard reload to clear any stale memory states if needed
    window.location.reload(); 
  };

  useEffect(() => {
    // 1. Auth Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
           await handleUserUpdate(session);
           setLoading(false);
        } else if (event === 'SIGNED_OUT') {
           setUser(null);
           setUserData(null);
           setLoading(false);
        }
      }
    );

    // 2. Initial Session Check with Safety Timeout
    const checkInitialSession = async () => {
      // Fail-safe: If Supabase takes too long, stop "loading" so the UI shows up
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.warn("Auth initialization timed out. Forcing UI display.");
          setLoading(false);
        }
      }, AUTH_INIT_TIMEOUT);

      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
            if (error.message.includes("Invalid Refresh Token")) {
                await supabase.auth.signOut();
            }
        }
        await handleUserUpdate(data.session);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    // 3. Activity Listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(name => document.addEventListener(name, resetInactivityTimer));
    
    // 4. Tab Visibility Check (Re-sync on return)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkInitialSession();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    checkInitialSession();
    resetInactivityTimer();

    return () => {
      subscription.unsubscribe();
      events.forEach(name => document.removeEventListener(name, resetInactivityTimer));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [supabase, handleUserUpdate, resetInactivityTimer]);

  const hasRole = (role: Role): boolean => {
    if (user?.email === 'pb7552212@gmail.com') return true; 
    return userData?.roles?.includes(role) ?? false;
  };

  return (
    <AuthContext.Provider value={{ supabase, user, userData, loading, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}