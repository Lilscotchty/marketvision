
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BottomNavigation } from './bottom-navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { mainNav, accountNav } from './sidebar-nav'; // Combine navs for mobile
import { AppHeader } from './AppHeader';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);
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
          {isClient && isMobile && <BottomNavigation items={navItems} />}
      </div>
  );
}
