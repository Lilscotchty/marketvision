
'use client'
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";
import { LiveMarketDataDisplay } from "@/components/live-analysis/live-market-data-display";
import { Separator } from "@/components/ui/separator";
import { BarChart } from "lucide-react";

// Dynamically import the TradingView chart to prevent SSR issues and improve initial load.
const TradingViewAdvancedChartWidget = dynamic(
  () => import("@/components/live-analysis/TradingViewAdvancedChart"),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[600px] md:h-[750px] w-full rounded-lg" />
  }
);

export default function LiveAnalysisPage() {
  return (
    <main className="flex-1 items-start gap-4 p-2 sm:px-6 sm:py-0 md:gap-8 pb-16 md:pb-0">
      <div className="container mx-auto py-4 md:py-8 space-y-8">

        <header className="text-center">
          <h1 className="text-3xl font-headline font-bold tracking-tight sm:text-4xl flex items-center justify-center">
            <BarChart className="mr-3 h-8 w-8 text-accent"/>
            In-depth <span className="text-accent">Analysis</span>
          </h1>
        </header>
        
        <section id="live-trading-chart">
          <h2 className="text-2xl font-semibold font-headline mb-4 text-center">Live Trading Chart</h2>
          <div className="h-[600px] md:h-[750px] w-full rounded-lg overflow-hidden">
            <TradingViewAdvancedChartWidget />
          </div>
        </section>
        
        <Separator className="my-8" />

        <section id="conceptual-analysis-input">
           <h2 className="text-2xl font-semibold font-headline mb-6 text-center">Conceptual Market Analysis Input</h2>
          <LiveMarketDataDisplay />
        </section>
      </div>
    </main>
  );
}
