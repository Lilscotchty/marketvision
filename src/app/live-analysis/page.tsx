
import { LiveMarketDataDisplay } from "@/components/live-analysis/live-market-data-display";
import TradingViewAdvancedChartWidget from "@/components/live-analysis/TradingViewAdvancedChart";
import TradingViewTickerTape from "@/components/dashboard/tradingview-ticker-tape";
import { Separator } from "@/components/ui/separator";
import { BarChart } from "lucide-react";

export default function LiveAnalysisPage() {
  return (
    <div className="container mx-auto py-8 space-y-12">
      <section id="ticker-tape">
        <TradingViewTickerTape />
      </section>

      <header className="text-center">
        <h1 className="text-4xl font-headline font-bold tracking-tight sm:text-5xl flex items-center justify-center">
          <BarChart className="mr-3 h-10 w-10 text-accent"/>
          In-depth <span className="text-accent">Analysis</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Observe the live market with the TradingView chart, then use the form below to input key data points and your observations for a conceptual AI-powered ICT analysis.
        </p>
      </header>
      
      <section id="live-trading-chart">
        <h2 className="text-2xl font-semibold font-headline mb-4 text-center">Live Trading Chart</h2>
        <div className="rounded-lg overflow-hidden shadow-xl border border-border">
          <TradingViewAdvancedChartWidget />
        </div>
      </section>
      
      <Separator className="my-8" />

      <section id="conceptual-analysis-input">
         <h2 className="text-2xl font-semibold font-headline mb-6 text-center">Conceptual Market Analysis Input</h2>
        <LiveMarketDataDisplay />
      </section>
    </div>
  );
}
