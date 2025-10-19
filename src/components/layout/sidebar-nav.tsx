
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import type { LucideIcon } from "lucide-react";
import { BarChart3, BellRing, History, Activity, LogIn, UserPlus, Bell, Settings, DollarSign, Newspaper, Home } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useNotificationCenter } from "@/contexts/notification-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";


export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  fullLabel?: string; 
  authRequired?: boolean;
  guestOnly?: boolean;
  showBadge?: boolean;
}

export const navItems: NavItem[] = [
  { href: "/", label: "Overview", icon: Home, fullLabel: "Market Overview" },
  { href: "/live-analysis", label: "Live", icon: Activity, fullLabel: "Live Analysis", authRequired: true },
  { href: "/alerts", label: "Alerts", icon: BellRing, fullLabel: "Alerts System", authRequired: true },
  { href: "/performance", label: "History", icon: History, fullLabel: "History", authRequired: true },
  { href: "/news", label: "News", icon: Newspaper, fullLabel: "Market News", authRequired: true },
  { href: "/pricing", label: "Pricing", icon: DollarSign, fullLabel: "Pricing Plans" },
  { href: "/login", label: "Login", icon: LogIn, fullLabel: "Login", guestOnly: true },
  { href: "/signup", label: "Sign Up", icon: UserPlus, fullLabel: "Sign Up", guestOnly: true },
];

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { unreadCount } = useNotificationCenter();

  const filteredItems = items.filter(item => {
    if (loading) return false;
    if (item.authRequired && !user) return false;
    if (item.guestOnly && user) return false;
    return true;
  });

  if (loading) {
    return (
      <SidebarMenu>
        {[...Array(4)].map((_, index) => (
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
      {filteredItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className="relative"
                >
                <Link href={item.href}>
                    <item.icon />
                    <span>{item.fullLabel || item.label}</span>
                     {item.showBadge && unreadCount > 0 && (
                      <Badge 
                          variant="destructive" 
                          className="absolute top-1.5 right-2 h-4 w-4 p-0 min-w-0 flex items-center justify-center text-[9px]"
                      >
                      {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                  )}
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        ))}
    </SidebarMenu>
  );
}
