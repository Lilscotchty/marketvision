
import React from 'react';
import { ClientLayout } from './client-layout';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientLayout>
      <main className="flex-1 items-start gap-4 p-2 sm:px-6 sm:py-0 md:gap-8 pb-16 md:pb-0">
        {children}
      </main>
    </ClientLayout>
  );
}
