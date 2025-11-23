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
  CreditCard,
  Info,
  Mail
} from "lucide-react";

export type NavItem = {
    href: string;
    // Fix: Explicitly type the icon to accept className to resolve build error
    icon: React.ElementType<{ className?: string }>;
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
  { href: "/pricing", icon: CreditCard, label: "Pricing" }, 
];

export const accountNav: NavItem[] = [
  { href: "/settings", icon: Settings, label: "Settings", authRequired: true },
  { href: "/notifications", icon: Inbox, label: "Notifications", authRequired: true, showBadge: true },
  { href: "/support", icon: LifeBuoy, label: "Support" },
  { href: "/about", icon: Info, label: "About Us" }, 
  { href: "/contact", icon: Mail, label: "Contact" },
  { href: "/admin", icon: Users, label: "Admin", developerOnly: true },
];

export const navItems = [...mainNav, ...accountNav];