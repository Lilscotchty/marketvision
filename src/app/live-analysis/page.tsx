'use client'
import dynamic from 'next/dynamic';
import { useState, useRef } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { LiveMarketDataDisplay } from "@/components/live-analysis/live-market-data-display";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bot, PlusCircle, Maximize } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { Activity, Zap } from "lucide-react";


// Dynamically import the TradingView chart to prevent SSR issues and improve initial load.
const TradingViewAdvancedChartWidget = dynamic(
  () => import("@/components/live-analysis/TradingViewAdvancedChart"),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[600px] md:h-[750px] w-full rounded-lg" />
  }
);

export default function LiveAnalysisPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const isMobile = useIsMobile();
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    const elem = chartContainerRef.current;
    if (elem) {
      if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
          alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };
  
  const FormContainer = isMobile ? Sheet : Dialog;
  const FormContainerTrigger = isMobile ? SheetTrigger : DialogTrigger;
  const FormContainerContent = isMobile ? SheetContent : DialogContent;
  const FormContainerHeader = isMobile ? SheetHeader : DialogHeader;
  const FormContainerTitle = isMobile ? SheetTitle : DialogTitle;
  const FormContainerDescription = isMobile ? SheetDescription : DialogDescription;
  
  return (
    <main className="flex-1 items-start gap-4 p-2 sm:px-6 sm:py-0 md:gap-8 pb-16 md:pb-0">
      <div className="container mx-auto py-4 md:py-8 space-y-8">

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6  pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold tracking-wide text-green-700 dark:text-green-500 uppercase">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                System Online
              </div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-muted border border-border text-[10px] font-medium text-muted-foreground">
                 v2.4.0-stable
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Live Market <span className="text-muted-foreground font-light">Chart</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
            Empower your analysis with a continuous feed of real-time market data.
            </p>
          </div>
      <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
             {/* Stats - Hidden on mobile */}
             <div className="hidden lg:flex gap-8 items-center  pr-8">
                 <div className="text-right space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Inference Speed</p>
                    <p className="text-xl font-mono text-foreground flex items-center justify-end gap-2">
                       <Zap className="w-4 h-4 text-amber-500" /> 140ms
                    </p>
                 </div>
                 <div className="text-right space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Network Status</p>
                    <p className="text-xl font-mono text-foreground flex items-center justify-end gap-2">
                       <Activity className="w-4 h-4 text-green-600 dark:text-green-500" /> Stable
                    </p>
                 </div>
             </div>
          </div>
        </header>
        
        <section id="live-trading-chart">
          <div className="relative h-[600px] md:h-[750px] w-full rounded-lg overflow-hidden bg-card" ref={chartContainerRef}>
            {!isMobile && (
              <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-20 z-10 bg-background/50 hover:bg-background/80"
                  onClick={toggleFullScreen}
                  title="Toggle Fullscreen"
                >
                  <Maximize className="h-5 w-5" />
                </Button>
            )}
            <TradingViewAdvancedChartWidget />
          </div>
        </section>
        
        <Separator className="my-8" />
      </div>
    </main>
  );
}
