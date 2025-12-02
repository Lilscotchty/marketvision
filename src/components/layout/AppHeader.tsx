"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  ChevronDown,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  Crown,
  Zap,
  Menu,
  Scan,
  MessageCircle // Kept in imports just in case, but removed from usage
} from 'lucide-react';

import { useTheme } from '@/contexts/theme-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { mainNav, accountNav } from './sidebar-nav';

// Custom MV Logo SVG component based on the drawing
const MVLogo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 140 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <circle cx="10" cy="55" r="6" fill="currentColor" />
    <path
        d="M 16 55 C 16 5, 65 5, 70 50 C 75 15, 100 15, 105 30 L 120 95 L 135 15"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
    />
  </svg>
);

export function AppHeader() {
  const { theme, setTheme } = useTheme();
  const { user, logout, userData } = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  const isPro = userData?.hasActiveSubscription;

  // Reusable User Menu Content
  const UserMenuContent = () => (
    <>
       {user ? (
        <>
          <div className="flex items-center justify-start gap-2 p-2 mb-1 bg-secondary/30 rounded-lg">
              <div className="flex flex-col space-y-0.5 leading-none">
                  {isPro && <p className="font-bold text-xs text-amber-500 flex items-center gap-1"><Crown className="h-3 w-3 fill-amber-500"/> Pro Member</p>}
                  <p className="font-medium text-sm text-foreground truncate max-w-[180px]">{user.email}</p>
              </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
             <Link href="/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </DropdownMenuItem>
        </>
      ) : (
         <>
          <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
             <Link href="/login"><LogOut className="mr-2 h-4 w-4" /> Log In</Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
             <Link href="/signup"><User className="mr-2 h-4 w-4" /> Sign Up</Link>
          </DropdownMenuItem>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      
      {/* --- MOBILE VIEW (< md) --- */}
      <div className="flex md:hidden h-14 items-center justify-between px-4">
        {/* Left: Hamburger Menu (Trigger Sheet) */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] pr-0">
            <SheetHeader className="px-1 mb-6 text-left">
               <div className="flex items-center gap-2">
                 <MVLogo className="h-8 w-auto text-primary" />
                 <SheetTitle className="font-headline text-lg font-bold tracking-tight">
                    Market<span className="text-primary">Vision</span>
                 </SheetTitle>
               </div>
            </SheetHeader>
            
            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-1 pr-6">
               <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-2 px-2">Menu</div>
               {mainNav.map((item) => (
                 <Link
                   key={item.href}
                   href={item.href}
                   onClick={() => setIsSheetOpen(false)}
                   className={cn(
                     "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                     pathname === item.href
                       ? "bg-primary/10 text-primary"
                       : "text-foreground/60 hover:bg-accent hover:text-foreground"
                   )}
                 >
                   <item.icon className="h-4 w-4" />
                   {item.label}
                 </Link>
               ))}

               <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-2">Account</div>
               {accountNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSheetOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/60 hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
               ))}
            </div>
            
             {/* Mobile Logout Button at bottom */}
             <div className="absolute bottom-8 left-0 px-6 w-full">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Log Out
                </Button>
             </div>
          </SheetContent>
        </Sheet>

        {/* Right: Scan & User Profile */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-foreground">
            <Scan className="h-6 w-6" strokeWidth={2} />
          </Button>
          
          {/* User Profile Dropdown (Mobile) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                  variant="ghost" 
                  size="icon"
                  className={cn(
                      "relative h-8 w-8 rounded-full ml-1",
                      isPro ? "ring-2 ring-amber-500/50 ring-offset-2 ring-offset-background" : ""
                  )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-zinc-700 to-zinc-900 text-white text-xs font-bold">
                    {getInitials(user?.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
               <UserMenuContent />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>


      {/* --- DESKTOP VIEW (>= md) --- */}
      <div className="hidden md:flex h-16 items-center justify-between px-6">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
            <MVLogo className="h-9 w-auto text-primary transition-transform duration-300 group-hover:-rotate-6" />
            <span className="font-headline text-lg font-bold tracking-tight hidden sm:inline-block">
              Market<span className="text-primary">Vision</span>
            </span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          
          {/* Search */}
          <div className="relative hidden md:block group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors">
              <Search className="h-4 w-4" />
            </div>
            <Input 
              placeholder="Search docs..." 
              className="h-9 w-64 rounded-full border-border/50 bg-secondary/30 pl-9 text-sm transition-all focus-visible:ring-primary/20 focus-visible:border-primary/50 focus-visible:bg-background hover:bg-secondary/50"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex text-muted-foreground">
                /
              </kbd>
            </div>
          </div>

          {/* Version Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden md:flex h-9 gap-2 rounded-full border-border/50 bg-secondary/30 px-4 text-muted-foreground hover:bg-secondary/50 hover:text-foreground">
                <span className="text-xs font-medium">v2.4</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem>v2.4 (Stable)</DropdownMenuItem>
              <DropdownMenuItem>v2.5 (Beta)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {isClient && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent><p>Toggle Theme</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

           {/* Notifications */}
           <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:bg-secondary/80 hover:text-foreground">
              <Link href="/notifications">
                <Bell className="h-4 w-4" />
              </Link>
           </Button>

          {/* Pro Button */}
          {!isPro && (
             <Button 
                asChild
                className="hidden sm:flex h-9 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-5 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 hover:shadow-indigo-500/40 border-0"
             >
              <Link href="/pricing" className="flex items-center gap-2">
                 <Zap className="h-3.5 w-3.5 fill-white" />
                 <span className="text-xs font-bold">Unlock Pro</span>
              </Link>
             </Button>
          )}

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                    "relative h-9 w-9 rounded-full ml-1",
                    isPro ? "ring-2 ring-amber-500/50 ring-offset-2 ring-offset-background" : ""
                )}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-zinc-700 to-zinc-900 text-white text-xs font-bold">
                    {getInitials(user?.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
             <UserMenuContent />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}