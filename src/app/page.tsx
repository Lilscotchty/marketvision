
import { ImageUploadForm } from "@/components/dashboard/image-upload-form";
import { CandlestickChart, TrendingUp } from "lucide-react";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import heavy components
const PromotionalImageTray = dynamic(() => 
  import('@/components/dashboard/promotional-image-tray').then(mod => mod.PromotionalImageTray),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-48 md:h-64 w-full rounded-lg" />
  }
);

const TradingViewMarketOverview = dynamic(() =>
  import('@/components/dashboard/tradingview-market-overview').then(mod => mod.TradingViewMarketOverview),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[660px] w-full" />,
  }
);
const Separator = dynamic(() => import('@/components/ui/separator').then(mod => mod.Separator));

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
          </header>
          
          <div className="my-6">
            <PromotionalImageTray />
          </div>

          <ImageUploadForm />
        </section>

        <Separator className="my-8" />

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
