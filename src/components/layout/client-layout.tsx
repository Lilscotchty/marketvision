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
  const { user, loading } = useAuth();
  const navItems = [...mainNav, ...accountNav];

  // We only show the App Shell (Sidebar/Header) if we are sure the user is logged in.
  // Otherwise, we render the children (Landing Page) normally.
  const isUserAuthenticated = !loading && !!user;

  return (
      <div className={cn(
        "flex flex-col w-full min-h-screen", 
        isUserAuthenticated && "md:ml-64 transition-[margin] duration-300"
      )}>
          {/* Only show restricted App Header if authenticated */}
          {isUserAuthenticated && <AppHeader />}
          
          <main className="flex-1">
              {children}
          </main>
          
          {/* Bottom Nav: Only if mobile and authenticated */}
          {isMobile && isUserAuthenticated && <BottomNavigation items={navItems} />}
          
          {/* Optional: Add a subtle loading bar at the top if still loading */}
          {loading && (
            <div className="fixed top-0 left-0 w-full h-1 bg-blue-600/20 z-[9999]">
              <div className="h-full bg-blue-600 animate-[loading_2s_infinite]" style={{ width: '30%' }} />
            </div>
          )}
      </div>
  );
}