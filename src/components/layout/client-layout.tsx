
'use client';

import React, { useEffect, useState } from 'react';
import { 
  User, LogIn, LogOut, Bell, Settings, Info, ShieldCheck, 
  UserPlus, LifeBuoy, Mail, FileText, Menu, Crown, Bot 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CustomDropdown, type CustomDropdownMenuItem } from '@/components/ui/custom-dropdown';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { BottomNavigation } from './bottom-navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { mainNav, navItems } from './sidebar-nav';
import { cn } from '@/lib/utils';


const Header = () => {
  const { user, loading, userData, hasRole, logout } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

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
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
       {/* Left Zone */}
       <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-semibold whitespace-nowrap">
              <Bot className="h-6 w-6 text-accent" />
              <span className="font-bold">FinSight AI</span>
            </Link>
        </div>

        {/* Center Zone */}
        <nav className="hidden md:flex items-center gap-1">
             {mainNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                            isActive
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                        >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                    </Link>
                );
             })}
        </nav>
      
      {/* Right Zone */}
      <div className="flex items-center gap-2 md:gap-4">
        {isClient && (
          <>
            {!isMobile && !hasSubscription && user && (
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

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
      <div className="flex flex-col w-full md:ml-64">
          <Header />
          <main className="flex-1">
              {children}
          </main>
          {isClient && isMobile && <BottomNavigation items={navItems} />}
      </div>
  );
}
