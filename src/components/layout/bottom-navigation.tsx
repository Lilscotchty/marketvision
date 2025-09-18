
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type NavItem } from "./sidebar-nav"; 
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useNotificationCenter } from "@/contexts/notification-context"; // Import notification context
import { Skeleton } from "../ui/skeleton";
import { Badge } from "@/components/ui/badge"; // Import Badge

interface BottomNavigationProps {
  items: NavItem[];
}

export function BottomNavigation({ items }: BottomNavigationProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { unreadCount } = useNotificationCenter(); // Get unread count

  const displayedNavItems = items.filter(item => {
    if (loading) return false; 
    if (item.authRequired && !user) return false;
    if (item.guestOnly && user) return false;
    // Basic filtering for bottom nav, might need more specific logic
    if (['Settings', 'Login', 'Sign Up'].includes(item.label)) return false; 
    return true;
  }).slice(0, 4); // Show max 4 items

  if (loading) {
     return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-border bg-card shadow-sm md:hidden">
        <div className="mx-auto grid h-full max-w-lg grid-cols-4 font-medium">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="group inline-flex flex-col items-center justify-center px-3 pt-2 pb-1 text-center">
              <Skeleton className="mb-1 h-5 w-5 rounded-sm" />
              <Skeleton className="h-3 w-10 rounded-sm" />
            </div>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-border bg-card shadow-sm md:hidden">
      <div className="mx-auto grid h-full max-w-lg grid-cols-4 font-medium">
        {displayedNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative inline-flex flex-col items-center justify-center px-3 pt-2 pb-1 text-center hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", // Added relative
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "mb-1 h-5 w-5 group-hover:text-sidebar-accent-foreground",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span className="text-xs">{item.label}</span>
              {item.showBadge && unreadCount > 0 && (
                 <Badge 
                    variant="destructive" 
                    className="absolute top-1 right-2 h-4 w-4 p-0 min-w-0 flex items-center justify-center text-xs" // Adjusted position
                  >
                   {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
