
import { ImageUploadForm } from "@/components/dashboard/image-upload-form";
import { CandlestickChart, TrendingUp } from "lucide-react";
import { TradingViewMarketOverview } from "@/components/dashboard/tradingview-market-overview";
import { Separator } from "@/components/ui/separator";
import { PromotionalImageTray } from "@/components/dashboard/promotional-image-tray"; // Import the new component

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-2 md:py-8">
      
      <main className="space-y-10 md:space-y-12">

        <section id="chart-analysis-tool">
          <header className="mb-6 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold flex items-center justify-center">
              <CandlestickChart className="mr-3 h-8 w-8 text-primary"/>
              Chart Analysis <span className="text-accent">Tool</span>
            </h2>
            <p className="mt-2 text-md md:text-lg text-muted-foreground max-w-lg mx-auto">
              Upload a chart image for AI-powered analysis.
            </p>
          </header>
          
          <div className="my-6">
            <PromotionalImageTray />
          </div>

          <ImageUploadForm />
        </section>

        <Separator />

        <section id="global-market-data">
           <header className="mb-6 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold flex items-center justify-center">
                <TrendingUp className="mr-3 h-8 w-8 text-primary"/>
                Global <span className="text-accent">Markets</span>
            </h2>
          </header>
          <TradingViewMarketOverview />
        </section>
      </main>
    </div>
  );
}
