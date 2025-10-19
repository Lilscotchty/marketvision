
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
import { useIsMobile } from '@/hooks/use-mobile';


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
  const isMobile = useIsMobile();

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
  
  if (isMobile) {
      return null;
  }

  return (
    <SidebarMenu>
      {filteredItems.map((item) => {
         if (item.href === '/login' || item.href === '/signup' || item.href === '/pricing') return null;

        return(
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.fullLabel || item.label, side: "right", align: "center" }}
                className="relative"
                >
                <Link href={item.href}>
                    <item.icon />
                    <span>{item.fullLabel || item.label}</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  );
}
