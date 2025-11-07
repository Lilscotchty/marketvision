
'use client';

import React, { useEffect, useState } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarFooter, SidebarInset } from '@/components/ui/sidebar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { BotIcon, User, LogIn, LogOut, Bell, Settings, Info, ShieldCheck, UserPlus, LifeBuoy, Mail, FileText, Menu, Crown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CustomDropdown, type CustomDropdownMenuItem } from '@/components/ui/custom-dropdown';
import { useTheme } from '@/contexts/theme-context';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { navItems, type NavItem } from './sidebar-nav';
import { SidebarNav } from './sidebar-nav';
import dynamic from 'next/dynamic';
import { useIsMobile } from '@/hooks/use-mobile';
import { BottomNavigation } from './bottom-navigation';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { cn } from '@/lib/utils';
import { NavBar } from './nav';


const TradingViewTickerTape = dynamic(() => import('@/components/dashboard/tradingview-ticker-tape'), {
  ssr: false,
});

// Define a separate set of nav items for the mobile sidebar drawer
const mobileSidebarNavItems: NavItem[] = [
  { href: "/notifications", label: "Notifications", icon: Bell, authRequired: true, showBadge: true },
  { href: "/settings", label: "Account Settings", icon: Settings, authRequired: true },
  { href: "/support", label: "Support", icon: LifeBuoy, authRequired: false },
  { href: "/contact", label: "Contact", icon: Mail, authRequired: false },
  { href: "/about", label: "About FinSight", icon: Info, authRequired: false },
  { href: "/privacy", label: "Privacy Policy", icon: ShieldCheck, authRequired: false },
  { href: "/terms", label: "Terms & Conditions", icon: FileText, authRequired: false },
];


export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, loading, userData, hasRole } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    try {
      // In a real app, you'd call your auth service's logout method.
      // For this example, we'll just simulate it.
      if (auth.signOut) {
        await auth.signOut();
      }
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      // The auth context will handle redirection.
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
  
  const hasSubscription = userData?.hasActiveSubscription;
  const isDeveloper = hasRole('Developer');

  const userDropdownItems: CustomDropdownMenuItem[][] = user
    ? [
        [
          { icon: <Settings />, label: "Settings", onClick: () => window.location.href = '/settings' },
          { icon: <Bell />, label: "Notifications", onClick: () => window.location.href = '/notifications' },
        ],
        isDeveloper ? [
          { icon: <ShieldCheck />, label: "Admin Panel", onClick: () => window.location.href = '/admin' }
        ] : [],
        [
          { icon: <LogOut />, label: "Logout", onClick: handleLogout, isDelete: true },
        ],
      ].filter(group => group.length > 0)
    : [
        [
          { icon: <LogIn />, label: "Login", onClick: () => window.location.href = '/login' },
          { icon: <UserPlus />, label: "Sign Up", onClick: () => window.location.href = '/signup', isSpecial: true },
        ],
      ];

  const Header = () => (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <SidebarTrigger variant="ghost" size="icon">
          <Menu />
      </SidebarTrigger>
      
      {isClient && !isMobile && (
        <div className="flex-1">
          <NavBar tabs={navItems} />
        </div>
      )}
     
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {isClient && (
          <>
            <div className="ml-auto flex-1 sm:flex-initial">
              <div className="hidden md:block w-full max-w-sm lg:max-w-md xl:max-w-lg">
                <TradingViewTickerTape />
              </div>
            </div>
            {isMobile && !hasSubscription && (
              <Button asChild size="sm" className="bg-primary h-8 hover:bg-primary/90">
                  <Link href="/pricing">Subscribe</Link>
              </Button>
            )}
            
            <CustomDropdown
              items={userDropdownItems}
              trigger={
                user ? (
                  hasSubscription ? (
                    <button className="flex items-center gap-2 bg-orange-200 text-orange-800 rounded-full p-1 pl-2 pr-4 text-sm font-semibold hover:bg-orange-300 transition-colors">
                      <Avatar className="h-6 w-6">
                        {user?.photoURL ? (
                          <AvatarImage src={user.photoURL} alt={user.email || 'User'} />
                        ) : (
                          <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
                            {getInitials(user?.email)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex items-center gap-1">
                        <span>PRO</span>
                        {hasRole('Owner') && <Crown className="h-4 w-4" />}
                      </div>
                    </button>
                  ) : (
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
                  )
                ) : (
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                )
              }
            />
          </>
        )}
      </div>
    </header>
  );

  return (
     <SidebarProvider onOpenChange={(open) => isMobile && setOpenMobile(open)}>
        <Sidebar>
          <SidebarHeader className="h-16 flex items-center justify-center">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <BotIcon className="h-7 w-7 text-accent" />
              <h1 className="text-xl font-headline font-semibold group-data-[collapsible=icon]:hidden">
                FinSight <span className="text-primary">AI</span>
              </h1>
            </Link>
          </SidebarHeader>
           <SidebarContent>
              <SidebarNav items={mobileSidebarNavItems} />
           </SidebarContent>
          <SidebarFooter>
            <SidebarNav items={[{ href: '/settings', label: 'Settings', icon: Settings, authRequired: true }]} />
          </SidebarFooter>
        </Sidebar>

        {isMobile && (
          <Sheet open={openMobile} onOpenChange={setOpenMobile}>
            <SheetContent side="left" className="p-0">
               <SidebarHeader className="h-16 flex items-center justify-center border-b">
                 <VisuallyHidden>
                    <SheetTitle>Main Menu</SheetTitle>
                 </VisuallyHidden>
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <BotIcon className="h-7 w-7 text-accent" />
                  <h1 className="text-xl font-headline font-semibold">
                    FinSight <span className="text-primary">AI</span>
                  </h1>
                </Link>
              </SidebarHeader>
              <div className="p-4">
                 <SidebarNav items={mobileSidebarNavItems} />
              </div>
            </SheetContent>
          </Sheet>
        )}

      <SidebarInset>
          <Header />
          {children}
      </SidebarInset>

      {isClient && isMobile && <BottomNavigation items={navItems} />}
    </SidebarProvider>
  );
}
