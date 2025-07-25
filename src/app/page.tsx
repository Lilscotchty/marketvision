
import { ImageUploadForm } from "@/components/dashboard/image-upload-form";
import { CandlestickChart, TrendingUp } from "lucide-react";
import { TradingViewMarketOverview } from "@/components/dashboard/tradingview-market-overview";
import TradingViewTickerTape from "@/components/dashboard/tradingview-ticker-tape";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-2 md:py-8">
      
      <main className="space-y-10 md:space-y-12">

        <section id="ticker-tape">
           <TradingViewTickerTape />
        </section>

        <Separator />

        <section id="chart-analysis-tool">
          <header className="mb-6 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold flex items-center justify-center">
              <CandlestickChart className="mr-3 h-8 w-8 text-primary"/>
              Chart Analysis <span className="text-accent">Tool</span>
            </h2>
            <p className="mt-2 text-md md:text-lg text-muted-foreground max-w-lg mx-auto">
              Upload your candlestick chart images to receive AI-powered insights.
            </p>
          </header>
          <ImageUploadForm />
        </section>

        <section id="global-market-data">
           <header className="mb-6 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold flex items-center justify-center">
                <TrendingUp className="mr-3 h-8 w-8 text-primary"/>
                Global <span className="text-accent">Markets</span>
            </h2>
            <p className="mt-2 text-md md:text-lg text-muted-foreground max-w-lg mx-auto">
                Live market data from TradingView.
            </p>
          </header>
          <TradingViewMarketOverview />
        </section>
      </main>
    </div>
  );
}
