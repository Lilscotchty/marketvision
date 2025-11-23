'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BottomNavigation } from './bottom-navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { mainNav, accountNav } from './sidebar-nav'; // Combine navs for mobile
import { AppHeader } from './AppHeader';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth(); // Get the user status
  const navItems = [...mainNav, ...accountNav];

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
      <div className="flex flex-col w-full md:ml-64">
          <AppHeader />
          <main className="flex-1 overflow-y-auto">
              {children}
          </main>
          {/* Only show BottomNavigation if:
              1. We are on the client (hydration fix)
              2. It is a mobile device
              3. The user is LOGGED IN (This removes it from the landing page)
          */}
          {isClient && isMobile && user && <BottomNavigation items={navItems} />}
      </div>
  );
}
