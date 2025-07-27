
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import type { LucideIcon } from "lucide-react";
import { BarChart3, BellRing, History, Activity, LogIn, UserPlus, Bell, Settings } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useNotificationCenter } from "@/contexts/notification-context"; // Import notification context
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge"; // Import Badge

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  fullLabel?: string; 
  authRequired?: boolean;
  guestOnly?: boolean;
  mobileLocation?: 'header'; // Used for mobile placement
  showBadge?: boolean; // New property to indicate if badge should be shown
}

export const navItems: NavItem[] = [
  { href: "/", label: "Overview", icon: BarChart3, fullLabel: "Market Overview" },
  { href: "/alerts", label: "Alerts", icon: BellRing, fullLabel: "Alerts System", authRequired: true },
  { href: "/performance", label: "History", icon: History, fullLabel: "Performance History", authRequired: true },
  { href: "/live-analysis", label: "Live", icon: Activity, fullLabel: "Live Analysis", authRequired: true },
  { href: "/notifications", label: "Notify", icon: Bell, fullLabel: "Notifications", authRequired: true, mobileLocation: 'header', showBadge: true }, 
  { href: "/settings", label: "Settings", icon: Settings, fullLabel: "Settings", authRequired: true, mobileLocation: 'header' }, 
  { href: "/login", label: "Login", icon: LogIn, fullLabel: "Login", guestOnly: true },
  { href: "/signup", label: "Sign Up", icon: UserPlus, fullLabel: "Sign Up", guestOnly: true },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { unreadCount } = useNotificationCenter(); // Get unread count

  const sidebarSpecificNavItems = navItems.filter(item => {
    if (loading) return false; 
    if (item.authRequired && !user) return false;
    if (item.guestOnly && user) return false;
    // Keep Notifications and Settings in the main sidebar list as well
    // if (item.href === "/notifications" || item.href === "/settings") return false; // Previous filter removed
    return true;
  });

  if (loading && sidebarSpecificNavItems.length === 0) {
    return (
      <SidebarMenu>
        {[...Array(navItems.filter(item => (!item.authRequired && !item.guestOnly) || (item.authRequired && user) || (item.guestOnly && !user)).length)].map((_, index) => ( 
          <SidebarMenuItem key={index}>
            <div className="flex items-center gap-2 p-2 h-8 w-full">
              <Skeleton className="h-4 w-4 rounded-sm" />
              <Skeleton className="h-4 w-20 rounded-sm group-data-[collapsible=icon]:hidden" />
            </div>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      {sidebarSpecificNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              isActive={pathname === item.href}
              tooltip={{ children: item.fullLabel || item.label, side: "right", align: "center" }}
              className="relative" // Ensure badge positioning context
            >
              <item.icon />
              <span>{item.fullLabel || item.label}</span>
              {item.showBadge && unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute top-1 right-1 h-4 w-4 p-0 min-w-0 justify-center text-xs group-data-[collapsible=icon]:hidden"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
               {item.showBadge && unreadCount > 0 && (
                 <Badge variant="destructive" className="absolute top-0 right-0 h-2 w-2 p-0 transform translate-x-1 -translate-y-1 group-data-[collapsible=icon]:inline-flex hidden items-center justify-center" />
               )}
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
