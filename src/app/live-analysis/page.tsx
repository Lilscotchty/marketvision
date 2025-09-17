
import { LiveMarketDataDisplay } from "@/components/live-analysis/live-market-data-display";
import TradingViewAdvancedChartWidget from "@/components/live-analysis/TradingViewAdvancedChart";
import TradingViewTickerTape from "@/components/dashboard/tradingview-ticker-tape";
import { TradingViewMarketOverview } from "@/components/dashboard/tradingview-market-overview";
import { Separator } from "@/components/ui/separator";
import { BarChart, TrendingUp } from "lucide-react";

export default function LiveAnalysisPage() {
  return (
    <div className="container mx-auto py-4 md:py-8 space-y-8">
      <section id="ticker-tape">
        <TradingViewTickerTape />
      </section>

      <header className="text-center">
        <h1 className="text-3xl font-headline font-bold tracking-tight sm:text-4xl flex items-center justify-center">
          <BarChart className="mr-3 h-8 w-8 text-accent"/>
          In-depth <span className="text-accent">Analysis</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Input market data for a conceptual AI-powered analysis.
        </p>
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
      
      <Separator className="my-8" />

      <section id="global-market-data">
           <header className="mb-6 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold flex items-center justify-center">
                <TrendingUp className="mr-3 h-8 w-8 text-primary"/>
                Global <span className="text-accent">Markets</span>
            </h2>
             <p className="mt-2 text-md md:text-lg text-muted-foreground max-w-lg mx-auto">
              Get a visual overview of market performance.
            </p>
          </header>
          <TradingViewMarketOverview />
        </section>
    </div>
  );
}
