
"use client";

import React from "react";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar, 
} from "@/components/ui/sidebar";
import { SidebarNav, navItems } from "./sidebar-nav"; 
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Import Badge
import { BotIcon, LogOut } from "lucide-react";
import { BottomNavigation } from "./bottom-navigation"; 
import { useIsMobile } from "@/hooks/use-mobile"; 
import { useAuth } from "@/contexts/auth-context";
import { useNotificationCenter } from "@/contexts/notification-context"; // Import notification context
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();
  const { unreadCount } = useNotificationCenter(); // Get unread count for header icons
  
  const DesktopHeaderIcons = () => {
    const { state: sidebarState } = useSidebar(); 
    const { user:authUser, loading:authLoading } = useAuth(); 

    // These items will still appear as icons in the header for quick access
    const desktopHeaderNavItems = navItems.filter(item => {
      if (item.href === "/notifications" || item.href === "/settings") {
        if (authLoading) return false;
        if (item.authRequired && !authUser) return false;
        return true;
      }
      return false;
    });

    if (authLoading && desktopHeaderNavItems.length === 0) return null;

    return (
      <div className="hidden md:flex items-center gap-1">
        {desktopHeaderNavItems.map((item) => (
          <TooltipProvider key={item.href} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={item.href} passHref>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={item.fullLabel || item.label}
                    className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground relative" // Added relative for badge positioning
                  >
                    <item.icon className="h-5 w-5" />
                    {item.showBadge && unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute top-1 right-1 h-4 w-4 p-0 min-w-0 flex items-center justify-center text-xs"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent 
                side={sidebarState === 'expanded' ? 'bottom' : 'right'} 
                align="center" 
                className="bg-popover text-popover-foreground"
              >
                <p>{item.fullLabel || item.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  };


  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Could not log you out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const mobileHeaderNavItems = navItems.filter(item => {
    if (!item.mobileLocation || item.mobileLocation !== 'header') return false;
    if (loading) return false;
    if (item.authRequired && !user) return false;
    if (item.guestOnly && user) return false;
    return true;
  });


  return (
    <SidebarProvider defaultOpen>
      <div className="hidden md:flex md:flex-col"> 
        <Sidebar collapsible="icon" variant="sidebar" side="left" className="h-full">
          <SidebarHeader className="h-16 flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <BotIcon className="h-8 w-8 text-accent" />
              <h1 className="text-xl font-headline font-semibold group-data-[collapsible=icon]:hidden">
                FinSight <span className="text-primary">AI</span>
              </h1>
            </div>
            <div className="flex items-center gap-1">
              <DesktopHeaderIcons /> 
              <SidebarTrigger className="group-data-[collapsible=icon]:hidden ml-1" />
            </div>
          </SidebarHeader>
          <SidebarContent className="flex-1 pt-8"> {/* Increased top padding */}
            <SidebarNav />
          </SidebarContent>
          <SidebarFooter className="p-2 space-y-1">
              {user && !loading && (
                 <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center"
                    onClick={handleLogout}
                  >
                  <LogOut />
                  <span className="group-data-[collapsible=icon]:hidden">Logout</span>
              </Button>
              )}
          </SidebarFooter>
        </Sidebar>
      </div>
      
      <SidebarInset className="pb-16 md:pb-0"> 
        {isMobile && (
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
            <div className="flex items-center gap-2">
              <BotIcon className="h-7 w-7 text-accent" />
              <h1 className="text-lg font-headline font-semibold">
                FinSight <span className="text-primary">AI</span>
              </h1>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              {mobileHeaderNavItems.map(item => (
                 <Link href={item.href} key={item.href} passHref>
                   <Button asChild variant="ghost" size="icon" aria-label={item.label} className="relative">
                    <>
                     <item.icon className="h-5 w-5" />
                      {item.showBadge && unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute top-1 right-1 h-4 w-4 p-0 min-w-0 flex items-center justify-center text-xs"
                        >
                           {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </>
                   </Button>
                 </Link>
              ))}
            </div>
          </header>
        )}
        <div className="p-3 md:p-4 lg:p-6"> 
          {children}
        </div>
      </SidebarInset>

      <BottomNavigation />
    </SidebarProvider>
  );
}
