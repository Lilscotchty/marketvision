"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { mainNav, accountNav } from './sidebar-nav';

const NevodexLogo = ({ className }: { className?: string }) => (
  <svg
    version="1.0"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 300 294"
    preserveAspectRatio="xMidYMid meet"
    className={className}
    fill="currentColor"
    > 
    
      <g transform="translate(0.000000,294.000000) scale(0.100000,-0.100000)" stroke="none">
         <path d="M1525 2031 c-30 -18 -179 -156 -347 -321 -68 -66 -88 -92 -88 -113 0 -28 27 -63 144 -184 91 -94 89 -95 282 87 157 148 192 172 223 153 9 -5 138 -142 286 -303 149 -161 280 -297 292 -303 37 -16 65 -1 166 95 84 81 97 97 97 126 0 33 -44 85 -430 502 -63 69 -137 150 -165 180 -92 102 -86 100 -269 100 -139 0 -165 -3 -191 -19z"/>
         <path d="M578 1760 c-59 -56 -108 -111 -112 -125 -9 -36 10 -66 121 -186 54 -58 191 -207 306 -332 139 -151 218 -229 239 -236 39 -14 298 -14 333 -1 14 5 99 79 188 162 292 276 277 260 277 301 0 32 -11 49 -86 132 -85 95 -113 112 -157 101 -13 -3 -93 -71 -178 -151 -131 -123 -159 -145 -186 -145 -28 0 -50 20 -205 187 -95 103 -204 221 -242 263 -153 169 -151 169 -298 30z"/>
         <path d="M1976 1073 c-9 -37 -67 -93 -99 -94 -20 -1 -20 -1 4 -8 49 -15 71 -33 88 -71 l17 -39 13 34 c14 39 54 75 85 76 15 0 10 5 -19 19 -41 18 -62 44 -75 90 -7 25 -7 25 -14 -7z"/> 
        </g> 
     </svg> 
);


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
      <div className="flex h-16 items-center border-b border-gray-800 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <NevodexLogo className="h-6 w-6 text-primary" />
          <span>NEVODEX AI </span>
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