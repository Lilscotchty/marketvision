'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BottomNavigation } from './bottom-navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { mainNav, accountNav } from './sidebar-nav';
import { AppHeader } from './AppHeader';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);
  const { user, loading } = useAuth();
  const navItems = [...mainNav, ...accountNav];

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only show the main app header and apply sidebar margin if logged in
  // If loading, we default to hidden to prevent flash of unstyled content on landing page
  const showAppShell = !loading && !!user;

  return (
      <div className={cn("flex flex-col w-full", showAppShell && "md:ml-64")}>
          {showAppShell && <AppHeader />}
          
          <main className="flex-1 overflow-y-auto">
              {children}
          </main>
          
          {/* Bottom Nav: Only if client, mobile, and user is logged in */}
          {isClient && isMobile && showAppShell && <BottomNavigation items={navItems} />}
      </div>
  );
}