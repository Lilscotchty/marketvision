
import React from 'react';
import { ClientLayout } from './client-layout';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientLayout>
        {children}
    </ClientLayout>
  );
}
