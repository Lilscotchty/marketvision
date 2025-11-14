
"use client";

import React from 'react';
import { ClientLayout } from './client-layout';
import { SidebarProvider } from '@/components/ui/sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ClientLayout>
          {children}
      </ClientLayout>
    </SidebarProvider>
  );
}
