"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  ChevronDown,
  Headset,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  Crown, // Import Crown for Pro users
  Sparkles // Import Sparkles for visual flair
} from 'lucide-react';

import { useTheme } from '@/contexts/theme-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Added AvatarImage
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const { theme, setTheme } = useTheme();
  const { user, logout, userData } = useAuth(); // Destructure userData to check subscription
  const { toast } = useToast();
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

  // Check for active subscription
  const isPro = userData?.hasActiveSubscription;

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-2">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <Link href="/" className="font-bold text-lg tracking-tight flex items-center gap-2">
          <div className="bg-primary/10 p-1 rounded-md">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          MarketVision
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-sm font-semibold hidden sm:flex"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Project 1</DropdownMenuItem>
            <DropdownMenuItem>Project 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator orientation="vertical" className="h-6 hidden md:block" />
        <span className="text-sm font-medium text-muted-foreground hidden md:block">
          Main Dashboard
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="hidden md:inline-flex text-muted-foreground text-[12px] h-7 border ">Feedback</Button>
        
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-8 w-64 rounded-md bg-muted pl-9 text-sm"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 select-none rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        <TooltipProvider>
          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              {isClient ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:inline-flex h-8 w-8 rounded-full border text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <div className="hidden md:block h-8 w-8 rounded-full border" /> 
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Theme</p>
            </TooltipContent>
          </Tooltip>

          {/* Support Icon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                asChild 
                variant="ghost" 
                size="icon" 
                className="hidden md:inline-flex h-8 w-8 rounded-full border text-muted-foreground hover:text-foreground transition-colors"
              >
                 <Link href="/support"><Headset className="h-4 w-4" /></Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Support</p>
            </TooltipContent>
          </Tooltip>

          {/* Notifications */}
          <Tooltip>
            <TooltipTrigger asChild>
               <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full border text-muted-foreground hover:text-foreground transition-colors relative">
                <Link href="/notifications">
                  <Bell className="h-4 w-4" />
                  {/* Optional: Add a red dot here if notifications exist */}
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* User Profile Dropdown - The NEW Design */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                    "h-9 w-9 rounded-full transition-all duration-300 ml-1",
                    // Pro User Styling: Golden Ring
                    isPro 
                        ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-background hover:ring-amber-400" 
                        : "hover:bg-secondary"
                )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt="User" />
                <AvatarFallback className={cn(
                    "text-xs font-bold text-white",
                    // Pro User: Golden Gradient Background
                    // Free User: Deep Indigo Gradient Background
                    isPro 
                        ? "bg-gradient-to-br from-amber-500 to-orange-600" 
                        : "bg-gradient-to-br from-blue-600 to-indigo-700"
                )}>
                  {isPro ? <Crown className="h-4 w-4" /> : getInitials(user?.email)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
             {user ? (
              <>
                {/* User Info Header in Menu */}
                <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                        {isPro && <p className="font-medium text-xs text-amber-500 flex items-center gap-1"><Crown className="h-3 w-3"/> Pro Member</p>}
                        <p className="font-medium">{user.email}</p>
                    </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                   <Link href="/settings" className="cursor-pointer"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </>
            ) : (
               <>
                <DropdownMenuItem asChild>
                   <Link href="/login"><LogOut className="mr-2 h-4 w-4" /> Log In</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                   <Link href="/signup"><User className="mr-2 h-4 w-4" /> Sign Up</Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}