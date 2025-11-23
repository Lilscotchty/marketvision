"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { mainNav, accountNav } from './sidebar-nav';

// Fix: Update the inline interface for props as well
const NavLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType<{ className?: string }>; label: string; }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-bold"
          : "text-gray-300 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
};

export function AppSidebar() {
  const { hasRole } = useAuth();

  return (
    <aside className="hidden h-screen w-64 flex-col fixed inset-y-0 left-0 z-50 border-r bg-gray-900 text-white md:flex">
      <div className="flex h-14 items-center border-b border-gray-800 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <Bot className="h-6 w-6 text-primary" />
          <span>MarketVision</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="flex flex-col gap-4 p-4">
          <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold uppercase text-gray-500">
              Main Tools
            </h3>
            {mainNav.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
          <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold uppercase text-gray-500">
              Account
            </h3>
            {accountNav.map((item) => {
              // --- MODIFIED: Show link if it's for developers AND user has Developer OR Owner role ---
              if (item.developerOnly && !hasRole('Developer') && !hasRole('Owner')) {
                return null;
              }
              return <NavLink key={item.href} {...item} />;
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}