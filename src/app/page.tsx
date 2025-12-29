// src/app/page.tsx
"use client";

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ClientDashboard } from '@/components/dashboard/client-dashboard';
import { ReforgeLandingPage } from '@/components/dashboard/landing-page-content'; // <--- NEW IMPORT
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <main className="flex-1 p-4 sm:px-6 md:gap-8 pb-16 md:pb-8 bg-black min-h-screen flex items-center justify-center">
             <div className="space-y-6 w-full max-w-md">
                <Skeleton className="h-12 w-3/4 mx-auto bg-white/5" />
                <Skeleton className="h-64 w-full bg-white/5 rounded-xl" />
            </div>
        </main>
    );
  }

  // If logged in, show the functional dashboard. 
  // If not, show the high-end marketing landing page.
  return (
    <main className="flex-1 p-0 m-0 w-full">
      {user ? (
         <div className="container mx-auto py-4 md:py-8 p-2 sm:px-6">
            <ClientDashboard />
         </div>
      ) : (
         <ReforgeLandingPage />
      )}
    </main>
  );
}