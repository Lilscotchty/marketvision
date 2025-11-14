
'use client';

import React, { useEffect, useState } from 'react';
import { 
  Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarInset, SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  BotIcon, User, LogIn, LogOut, Bell, Settings, Info, ShieldCheck, 
  UserPlus, LifeBuoy, Mail, FileText, Menu, ChevronsLeft, Crown 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CustomDropdown, type CustomDropdownMenuItem } from '@/components/ui/custom-dropdown';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { navItems, type NavItem } from './sidebar-nav';
import { SidebarNav } from './sidebar-nav';
import dynamic from 'next/dynamic';
import { useIsMobile } from '@/hooks/use-mobile';
import { BottomNavigation } from './bottom-navigation';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { NavBar } from './nav'; 
import { cn } from '@/lib/utils';

const TradingViewTickerTape = dynamic(() => import('@/components/dashboard/tradingview-ticker-tape'), {
  ssr: false,
});

const mobileSidebarNavItems: NavItem[] = [
  { href: "/notifications", label: "Notifications", icon: Bell, authRequired: true, showBadge: true },
  { href: "/settings", label: "Account Settings", icon: Settings, authRequired: true },
  { href: "/support", label: "Support", icon: LifeBuoy, authRequired: false },
  { href: "/contact", label: "Contact", icon: Mail, authRequired: false },
  { href: "/about", label: "About FinSight", icon: Info, authRequired: false },
  { href: "/privacy", label: "Privacy Policy", icon: ShieldCheck, authRequired: false },
  { href: "/terms", label: "Terms & Conditions", icon: FileText, authRequired: false },
];

const Header = () => {
  const { user, loading, userData, hasRole, logout } = useAuth();
  const { toast } = useToast();
  const { isExpanded } = useSidebar();
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

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 sm:px-6">
       <SidebarTrigger>
          <Menu />
          <span className="sr-only">Toggle Sidebar</span>
       </SidebarTrigger>
       
       <Link href="/" className="flex items-center gap-2 font-semibold whitespace-nowrap">
          <BotIcon className="h-7 w-7 text-accent" />
          <h1 className="text-xl font-headline font-semibold hidden md:block">FinSight <span className="text-primary">AI</span></h1>
      </Link>

       <div className="flex items-center gap-4">
        <div className="hidden md:block">
            <NavBar tabs={navItems} />
        </div>
       </div>
     
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {isClient && (
          <>
            <div className="ml-auto flex-1 sm:flex-initial">
               <div className="hidden lg:block w-full max-w-sm xl:max-w-lg">
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
                        {user?.user_metadata?.avatar_url ? (
                          <AvatarImage src={user.user_metadata.avatar_url} alt={user.email || 'User'} />
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
                        {user?.user_metadata?.avatar_url ? (
                          <AvatarImage src={user.user_metadata.avatar_url} alt={user.email || 'User'} />
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
};


const MobileSidebarSheet = () => {
    const { openMobile, setOpenMobile } = useSidebar();
    return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
            <SheetContent side="left" className="p-0">
                <SheetHeader className="h-16 flex items-center justify-center border-b">
                    <VisuallyHidden><SheetTitle>Main Menu</SheetTitle></VisuallyHidden>
                    <Link href="/" className="flex items-center gap-2 font-semibold whitespace-nowrap" onClick={() => setOpenMobile(false)}>
                        <BotIcon className="h-7 w-7 text-accent" />
                        <h1 className="text-xl font-headline font-semibold">FinSight <span className="text-primary">AI</span></h1>
                    </Link>
                </SheetHeader>
                <div className="p-4" onClick={() => setOpenMobile(false)}>
                    <SidebarNav items={navItems} />
                    <SidebarNav items={mobileSidebarNavItems} />
                </div>
            </SheetContent>
        </Sheet>
    );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
      <div className="flex min-h-screen w-full">
        <Sidebar>
            <SidebarHeader>
                 <Link href="/" className="flex items-center gap-2 font-semibold whitespace-nowrap">
                    <BotIcon className="h-7 w-7 text-accent" />
                  </Link>
            </SidebarHeader>
            <SidebarContent>
                 <SidebarNav items={navItems.filter(item => !['/login', '/signup', '/admin'].includes(item.href))} />
            </SidebarContent>
             <SidebarFooter>
                {/* Footer content can go here */}
            </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col w-full">
            <Header />
            <SidebarInset>
                {children}
            </SidebarInset>
        </div>
        
        {isClient && <MobileSidebarSheet />}
        {isClient && isMobile && <BottomNavigation items={navItems} />}
      </div>
  );
}
