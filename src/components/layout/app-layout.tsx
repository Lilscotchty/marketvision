
"use client";

import React from 'react';
import { ClientLayout } from './client-layout';
import { AppSidebar } from './AppSidebar'; // Import the new sidebar

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <ClientLayout>
          {children}
      </ClientLayout>
    </div>
  );
}
