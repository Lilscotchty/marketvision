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
} from 'lucide-react';

import { useTheme } from '@/contexts/theme-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

export function AppHeader() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
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

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between gap-4 border-b bg-background px-4 py-2">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <Link href="/" className="font-bold text-lg tracking-tight">
          MarketVision
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-sm font-semibold"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Project 1</DropdownMenuItem>
            <DropdownMenuItem>Project 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator orientation="vertical" className="h-6" />
        <span className="text-sm font-medium text-muted-foreground hidden md:block">
          Main Dashboard
        </span>
      </div>

      {/* Middle Section (Placeholder) */}
      <div className="hidden md:flex">
        {/* Intentionally empty for now, can add "Connect" button here */}
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
          {/* Theme Toggle: Hidden on mobile, visible on md+ */}
          <Tooltip>
            <TooltipTrigger asChild>
              {isClient ? (
                <Button
                  variant="ghost"
                  size="icon"
                  // UPDATED: added 'hidden md:inline-flex'
                  className="hidden md:inline-flex h-8 w-8 rounded-full border text-muted-foreground"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4 rounded-full" />
                  ) : (
                    <Moon className=" h-4 w-4 rounded-full" />
                  )}
                </Button>
              ) : (
                // UPDATED: added 'hidden md:block' to the placeholder as well
                <div className="hidden md:block h-8 w-8 rounded-full border" /> 
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Theme</p>
            </TooltipContent>
          </Tooltip>

          {/* Support Icon: Hidden on mobile, visible on md+ */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                asChild 
                variant="ghost" 
                size="icon" 
                // UPDATED: added 'hidden md:inline-flex'
                className="hidden md:inline-flex h-8 w-8 rounded-full border text-muted-foreground"
              >
                 <Link href="/support"><Headset className="h-4 w-4" /></Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Support</p>
            </TooltipContent>
          </Tooltip>

          {/* Notifications: Visible on all screens */}
          <Tooltip>
            <TooltipTrigger asChild>
               <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full border text-muted-foreground">
                <Link href="/notifications"><Bell className="h-4 w-4" /></Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border text-muted-foreground">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
             {user ? (
              <>
                <DropdownMenuItem asChild>
                   <Link href="/settings"><Settings className="mr-2" /> Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2" />
                  Log Out
                </DropdownMenuItem>
              </>
            ) : (
               <>
                <DropdownMenuItem asChild>
                   <Link href="/login"><LogOut className="mr-2" /> Log In</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                   <Link href="/signup"><User className="mr-2" /> Sign Up</Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}