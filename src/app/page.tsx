
"use client";

import React from 'react';
import { ClientDashboard } from '@/components/dashboard/client-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';

export default function Page() {
  const { loading } = useAuth();

  if (loading) {
    return (
        <main className="flex-1 p-4 sm:px-6 md:gap-8 pb-16 md:pb-8">
            <div className="container mx-auto py-8">
                 <div className="space-y-12">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </main>
    );
  }

  return (
    <main className="flex-1 p-2 sm:px-6 sm:py-0 md:gap-8 pb-16 md:pb-0">
      <div className="container mx-auto py-4 md:py-8">
        <ClientDashboard />
      </div>
    </main>
  );
}
