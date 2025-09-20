
'use client';

import React, { useEffect, useState } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarFooter, SidebarInset } from '@/components/ui/sidebar';
import { BotIcon, User, LogIn, LogOut, Bell, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/theme-context';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { navItems } from './sidebar-nav';
import { SidebarNav } from './sidebar-nav';
import dynamic from 'next/dynamic';
import { useIsMobile } from '@/hooks/use-mobile';
import { BottomNavigation } from './bottom-navigation';

// Dynamically import the TradingViewTickerTape to prevent SSR issues
const TradingViewTickerTape = dynamic(() => import('@/components/dashboard/tradingview-ticker-tape'), {
  ssr: false,
});

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'Could not log you out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  const Header = () => (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {!isMobile && (
        <div className="flex items-center">
          <SidebarTrigger className="md:hidden" />
        </div>
      )}

      {isMobile && (
        <div className="flex items-center gap-2">
          <BotIcon className="h-7 w-7 text-accent" />
          <h1 className="text-lg font-headline font-semibold">
            FinSight <span className="text-primary">AI</span>
          </h1>
        </div>
      )}

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          <div className="hidden md:block w-full max-w-sm lg:max-w-md xl:max-w-lg">
            <TradingViewTickerTape />
          </div>
        </div>
        {isClient && (
            <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
            >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
            </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                {user?.photoURL ? (
                  <AvatarImage src={user.photoURL} alt={user.email || 'User'} />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(user?.email)}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user ? (
              <>
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/settings" passHref>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/notifications" passHref>
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <Link href="/login" passHref>
                  <DropdownMenuItem>
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Login</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/signup" passHref>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Sign Up</span>
                  </DropdownMenuItem>
                </Link>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar collapsible="icon" className="hidden border-r bg-background sm:flex">
          <SidebarHeader className="h-16 flex items-center justify-center">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <BotIcon className="h-7 w-7 text-accent" />
              <h1 className="text-xl font-headline font-semibold group-data-[collapsible=icon]:hidden">
                FinSight <span className="text-primary">AI</span>
              </h1>
            </Link>
          </SidebarHeader>
          <SidebarContent className="flex-1 pt-2">
            <SidebarNav items={navItems} />
          </SidebarContent>
          <SidebarFooter>
            <SidebarNav items={[{ href: '/settings', label: 'Settings', icon: Settings, authRequired: true }]} />
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <SidebarInset>
            <Header />
            <main className="flex-1 items-start gap-4 p-2 sm:px-6 sm:py-0 md:gap-8 pb-16 md:pb-0">
                {children}
            </main>
          </SidebarInset>
        </div>
        
        {isMobile && <BottomNavigation items={navItems} />}
      </div>
    </SidebarProvider>
  );
}
