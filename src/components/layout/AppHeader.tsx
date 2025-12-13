"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  ChevronDown,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  Crown,
  Zap,
  Menu,
  Scan,
  Loader2,
  XCircle,
  Camera
} from 'lucide-react';

import { useTheme } from '@/contexts/theme-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { mainNav, accountNav } from './sidebar-nav';

// --- IMPORTS FOR SCANNER ---
import { handleImageAnalysisAction, uploadChartImages, consumeAnalysisCredit, type AnalysisResult } from "@/lib/actions";
import { PredictionResults } from "@/components/dashboard/prediction-results";
import Loader from "@/components/dashboard/loader";

// Custom NEVODEX Logo - Provided SVG
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

export function AppHeader() {
  const { theme, setTheme } = useTheme();
  const { user, logout, userData } = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  // Sheet states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScanResultOpen, setIsScanResultOpen] = useState(false);

  // Scanner Logic State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<AnalysisResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'Could not log you out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // --- SCANNER HANDLERS ---
  const handleScanClick = () => {
    if (!user) {
        toast({
            title: "Authentication Required",
            description: "Please login to use the live scanner.",
            variant: "destructive"
        });
        return;
    }
    // Trigger the hidden file input
    fileInputRef.current?.click();
  };

  const handleScanCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Open the result sheet immediately to show loader
    setIsScanResultOpen(true);
    setIsScanning(true);
    setScanResult(null);
    setScanError(null);

    try {
        // 1. Check Credits
        const creditResult = await consumeAnalysisCredit();
        if (!creditResult.success) {
             throw new Error(creditResult.message || "Insufficient credits. Please upgrade.");
        }

        // 2. Upload Image
        const uploadRes = await uploadChartImages(Array.from(files));
        const urls = uploadRes.map(r => r.publicUrl).filter(Boolean) as string[];
        
        if (urls.length === 0) {
            throw new Error("Failed to upload image.");
        }

        // 3. Run AI Analysis
        const result = await handleImageAnalysisAction(urls);
        if (result.error) {
             throw new Error(result.error);
        }

        setScanResult(result);

    } catch (err: any) {
        console.error("Scan error:", err);
        setScanError(err.message || "An error occurred during analysis.");
    } finally {
        setIsScanning(false);
        // Reset input to allow rescanning same file if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };


  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  const isPro = userData?.hasActiveSubscription;

  // Reusable User Menu Content
  const UserMenuContent = () => (
    <>
       {user ? (
        <>
          <div className="flex items-center justify-start gap-2 p-2 mb-1 bg-secondary/30 rounded-lg">
              <div className="flex flex-col space-y-0.5 leading-none">
                  {isPro && <p className="font-bold text-xs text-amber-500 flex items-center gap-1"><Crown className="h-3 w-3 fill-amber-500"/> Pro Member</p>}
                  <p className="font-medium text-sm text-foreground truncate max-w-[180px]">{user.email}</p>
              </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
             <Link href="/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </DropdownMenuItem>
        </>
      ) : (
         <>
          <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
             <Link href="/login"><LogOut className="mr-2 h-4 w-4" /> Log In</Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
             <Link href="/signup"><User className="mr-2 h-4 w-4" /> Sign Up</Link>
          </DropdownMenuItem>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      
      {/* --- HIDDEN INPUT FOR CAMERA SCAN --- */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        capture="environment"  // Forces rear camera on mobile
        onChange={handleScanCapture}
      />

      {/* --- SCAN RESULTS BOTTOM SHEET --- */}
      <Sheet open={isScanResultOpen} onOpenChange={setIsScanResultOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-t border-white/10">
           
           {/* FIX: Add a hidden Title to satisfy Dialog accessibility requirements */}
           <SheetHeader className="sr-only">
              <SheetTitle>Scan Analysis Interface</SheetTitle>
           </SheetHeader>

           {isScanning ? (
               <div className="h-full flex flex-col items-center justify-center p-6 space-y-6 text-center">
                   <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                      <Loader />
                   </div>
                   <div>
                       <h3 className="text-xl font-bold font-headline mb-2">Analyzing Live Feed...</h3>
                       <p className="text-muted-foreground text-sm max-w-xs mx-auto">AI is processing market structure from your camera capture.</p>
                   </div>
               </div>
           ) : scanError ? (
               <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                   <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-2">
                       <XCircle className="w-12 h-12" />
                   </div>
                   <h3 className="text-xl font-bold">Scan Failed</h3>
                   <p className="text-muted-foreground">{scanError}</p>
                   <Button onClick={() => setIsScanResultOpen(false)} variant="outline">Close Scanner</Button>
               </div>
           ) : scanResult && scanResult.prediction && scanResult.analysis ? (
               <div className="h-full flex flex-col">
                   <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                       <div>
                           <h3 className="font-bold text-lg flex items-center gap-2">
                               <Scan className="h-4 w-4 text-primary" /> Scan Results
                           </h3>
                           <p className="text-xs text-muted-foreground">Confidence: {Math.round(scanResult.prediction.confidenceLevel * 100)}%</p>
                       </div>
                       <Button variant="ghost" size="sm" onClick={() => setIsScanResultOpen(false)}>Close</Button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-4 pb-20">
                       <PredictionResults 
                          prediction={scanResult.prediction} 
                          analysis={scanResult.analysis}
                          imagePreviewUrls={scanResult.imagePreviewUrls}
                       />
                   </div>
               </div>
           ) : null}
        </SheetContent>
      </Sheet>

      {/* --- MOBILE VIEW (< md) --- */}
      <div className="flex md:hidden h-14 items-center justify-between px-4">
        {/* Left: Hamburger Menu (Trigger Sheet) */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] pr-0">
            <SheetHeader className="px-1 mb-6 text-left">
               <div className="flex items-center gap-2">
                 <NevodexLogo className="h-8 w-8 text-primary" />
                 <SheetTitle className="font-headline text-lg font-bold tracking-tight">
                    NEVODEX <span className="text-primary">AI</span>
                 </SheetTitle>
               </div>
            </SheetHeader>
            
            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-1 pr-6">
               <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-2 px-2">Menu</div>
               {mainNav.map((item) => (
                 <Link
                   key={item.href}
                   href={item.href}
                   onClick={() => setIsMenuOpen(false)}
                   className={cn(
                     "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                     pathname === item.href
                       ? "bg-primary/10 text-primary"
                       : "text-foreground/60 hover:bg-accent hover:text-foreground"
                   )}
                 >
                   <item.icon className="h-4 w-4" />
                   {item.label}
                 </Link>
               ))}

               <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-2">Account</div>
               {accountNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/60 hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
               ))}
            </div>
            
             {/* Mobile Logout Button at bottom */}
             <div className="absolute bottom-8 left-0 px-6 w-full">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Log Out
                </Button>
             </div>
          </SheetContent>
        </Sheet>

        {/* Right: Scan & User Profile */}
        <div className="flex items-center gap-2">
          
          {/* UPDATED SCAN BUTTON FOR CAMERA */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-foreground active:scale-90 transition-transform" 
            onClick={handleScanClick}
          >
            <Camera className="h-6 w-6" strokeWidth={2} />
          </Button>
          
          {/* User Profile Dropdown (Mobile) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                  variant="ghost" 
                  size="icon"
                  className={cn(
                      "relative h-8 w-8 rounded-full ml-1",
                      isPro ? "ring-2 ring-amber-500/50 ring-offset-2 ring-offset-background" : ""
                  )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-zinc-700 to-zinc-900 text-white text-xs font-bold">
                    {getInitials(user?.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
               <UserMenuContent />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>


      {/* --- DESKTOP VIEW (>= md) --- */}
      <div className="hidden md:flex h-16 items-center justify-end px-6">
        
        {/* Left: Logo REMOVED to avoid duplication with Sidebar */}

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          
          {/* Search */}
          <div className="relative hidden md:block group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors">
              <Search className="h-4 w-4" />
            </div>
            <Input 
              placeholder="Search docs..." 
              className="h-9 w-64 rounded-full border-border/50 bg-secondary/30 pl-9 text-sm transition-all focus-visible:ring-primary/20 focus-visible:border-primary/50 focus-visible:bg-background hover:bg-secondary/50"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex text-muted-foreground">
                /
              </kbd>
            </div>
          </div>

          {/* Version Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden md:flex h-9 gap-2 rounded-full border-border/50 bg-secondary/30 px-4 text-muted-foreground hover:bg-secondary/50 hover:text-foreground">
                <span className="text-xs font-medium">v2.4</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem>v2.4 (Stable)</DropdownMenuItem>
              <DropdownMenuItem>v2.5 (Beta)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {isClient && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent><p>Toggle Theme</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

           {/* Notifications */}
           <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:bg-secondary/80 hover:text-foreground">
              <Link href="/notifications">
                <Bell className="h-4 w-4" />
              </Link>
           </Button>

          {/* Pro Button */}
          {!isPro && (
             <Button 
                asChild
                className="hidden sm:flex h-9 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-5 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 hover:shadow-indigo-500/40 border-0"
             >
              <Link href="/pricing" className="flex items-center gap-2">
                 <Zap className="h-3.5 w-3.5 fill-white" />
                 <span className="text-xs font-bold">Unlock Pro</span>
              </Link>
             </Button>
          )}

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                    "relative h-9 w-9 rounded-full ml-1",
                    isPro ? "ring-2 ring-amber-500/50 ring-offset-2 ring-offset-background" : ""
                )}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-zinc-700 to-zinc-900 text-white text-xs font-bold">
                    {getInitials(user?.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
             <UserMenuContent />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}