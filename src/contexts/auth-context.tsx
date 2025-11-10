"use client";

import type { User as SupabaseUser } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { UserAppData, Role } from '@/types';
import { Loader2 } from 'lucide-react';

const OWNER_EMAIL = 'pb7552212@gmail.com';
const INITIAL_TRIAL_POINTS = 5;

interface AuthContextType {
  user: SupabaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  userData: UserAppData | null;
  hasRole: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserAppData | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    // Check if the user is the owner
    const isOwner = supabaseUser.email === OWNER_EMAIL;
    if (isOwner) {
      const ownerData: UserAppData = {
        userId: supabaseUser.id,
        email: supabaseUser.email || '',
        chartAnalysisTrialPoints: 9999,
        hasActiveSubscription: true,
        roles: ['Owner', 'Developer'],
      };
      setUserData(ownerData);
      // In a real app, you'd upsert this to your database
      return;
    }
    
    // In a real app, this would be a single fetch from your 'profiles' table.
    // We are simulating it with localStorage for this prototype.
    try {
        const storedUserDataString = localStorage.getItem(`userData-${supabaseUser.id}`);
        let finalUserData: UserAppData;

        if (storedUserDataString) {
            const storedUserData = JSON.parse(storedUserDataString) as Partial<UserAppData>;
            finalUserData = {
                userId: supabaseUser.id,
                email: supabaseUser.email || '',
                chartAnalysisTrialPoints: storedUserData.chartAnalysisTrialPoints ?? INITIAL_TRIAL_POINTS,
                hasActiveSubscription: storedUserData.hasActiveSubscription ?? false,
                roles: storedUserData.roles && Array.isArray(storedUserData.roles) && storedUserData.roles.length > 0 ? storedUserData.roles : ['User'],
            };
        } else {
            // Initialize for a new user
            finalUserData = {
                userId: supabaseUser.id,
                email: supabaseUser.email || '',
                chartAnalysisTrialPoints: INITIAL_TRIAL_POINTS,
                hasActiveSubscription: false,
                roles: ['User'],
            };
        }

        if (finalUserData.chartAnalysisTrialPoints < 0) finalUserData.chartAnalysisTrialPoints = 0;
        
        setUserData(finalUserData);
        localStorage.setItem(`userData-${supabaseUser.id}`, JSON.stringify(finalUserData));
    } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        setUserData({
            userId: supabaseUser.id,
            email: supabaseUser.email || '',
            chartAnalysisTrialPoints: INITIAL_TRIAL_POINTS,
            hasActiveSubscription: false,
            roles: ['User'],
        });
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      const supabaseUser = session?.user ?? null;
      setUser(supabaseUser);
      if (supabaseUser) {
        await fetchUserProfile(supabaseUser);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    // Check initial session
    const getInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const supabaseUser = session?.user ?? null;
        setUser(supabaseUser);
        if (supabaseUser) {
            await fetchUserProfile(supabaseUser);
        }
        setLoading(false);
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, fetchUserProfile]);

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
    router.push('/login');
    router.refresh();
    setLoading(false);
  };

  const hasRole = (role: Role): boolean => {
    return userData?.roles?.includes(role) ?? false;
  };
  
   if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
