
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
  { href: "/", label: "Overview", icon: BarChart3, fullLabel: "Market Overview" },
  { href: "/alerts", label: "Alerts", icon: BellRing, fullLabel: "Alerts System" },
  { href: "/performance", label: "Trade History", icon: History, fullLabel: "Performance History" },
  { href: "/live-analysis", label: "Live", icon: Activity, fullLabel: "Live Analysis", authRequired: true },
  { href: "/login", label: "Login", icon: LogIn, fullLabel: "Login", guestOnly: true },
  { href: "/signup", label: "Sign Up", icon: UserPlus, fullLabel: "Sign Up", guestOnly: true },
];

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const filteredItems = items.filter(item => {
    if (loading) return false;
    // Keep authRequired check for items that should strictly only be accessible when logged in, like Live Analysis
    if (item.authRequired && !user) return false;
    if (item.guestOnly && user) return false;
    return true;
  });

  if (loading) {
    return (
      <SidebarMenu>
        {[...Array(4)].map((_, index) => ( // Increased skeleton count
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
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              isActive={pathname === item.href}
              tooltip={{ children: item.fullLabel || item.label, side: "right", align: "center" }}
              className="relative"
            >
              <item.icon />
              <span>{item.fullLabel || item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
