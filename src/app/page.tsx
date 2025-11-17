
"use client";

import React from 'react';
import { ClientDashboard } from '@/components/dashboard/client-dashboard';

export default function Page() {
  return (
    <main className="flex-1 p-2 sm:px-6 sm:py-0 md:gap-8 pb-16 md:pb-0">
      <div className="container mx-auto py-4 md:py-8">
        <ClientDashboard />
      </div>
    </main>
  );
}
