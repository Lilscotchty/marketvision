
"use client";

import React from 'react';
import { ClientLayout } from './client-layout';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/auth-context';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Only show the main app sidebar if the user is logged in and not loading
  const showSidebar = !loading && !!user;

  return (
    <div className="flex min-h-screen w-full bg-background">
      {showSidebar && <AppSidebar />}
      <ClientLayout>
          {children}
      </ClientLayout>
    </div>
  );
}
