
"use client";

import {
  LayoutDashboard,
  AreaChart,
  BellRing,
  Newspaper,
  BarChart3,
  Settings,
  Inbox,
  LifeBuoy,
  Users,
  Bot,
} from "lucide-react";

export type NavItem = {
    href: string;
    icon: React.ElementType;
    label: string;
    authRequired?: boolean;
    guestOnly?: boolean;
    developerOnly?: boolean;
    showBadge?: boolean;
};

export const mainNav: NavItem[] = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard", authRequired: true },
  { href: "/live-analysis", icon: AreaChart, label: "Chart", authRequired: true },
  { href: "/alerts", icon: BellRing, label: "Alerts", authRequired: true },
  { href: "/news", icon: Newspaper, label: "News", authRequired: true },
  { href: "/performance", icon: BarChart3, label: "History", authRequired: true },
];

export const accountNav: NavItem[] = [
  { href: "/settings", icon: Settings, label: "Settings", authRequired: true },
  { href: "/notifications", icon: Inbox, label: "Notifications", authRequired: true, showBadge: true },
  { href: "/support", icon: LifeBuoy, label: "Support" },
  { href: "/admin", icon: Users, label: "Admin", developerOnly: true },
];

export const navItems = [...mainNav, ...accountNav];
