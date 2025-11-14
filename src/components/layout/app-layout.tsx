
"use client";

import React from 'react';
import { ClientLayout } from './client-layout';

export function AppLayout({ children }: { children: React.ReactNode }) {
  // --- FIX: REMOVED THE UNNECESSARY MAIN ELEMENT ---
  return (
    <ClientLayout>
        {children}
    </ClientLayout>
  );
}
