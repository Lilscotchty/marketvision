
"use client";

import { ImageUploadForm } from "@/components/dashboard/image-upload-form";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { LandingPageContent } from "./landing-page-content";

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

export function ClientDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <main className="flex-1 p-4 sm:px-6 md:gap-8 pb-16 md:pb-8">
            <div className="container mx-auto py-8">
                 <div className="space-y-12">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </main>
    );
  }

  if (!user) {
    return <LandingPageContent />;
  }

  return (
    <main className="space-y-10 md:space-y-12">
      <section id="chart-analysis-tool">
        
        <div className="my-6">
          <PromotionalImageTray />
        </div>

        <ImageUploadForm />
      </section>

      <Separator className="my-8" />

      <section id="global-market-data">
         <header className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight font-headline">
              Global Markets
          </h2>
        </header>
        <TradingViewMarketOverview />
      </section>
    </main>
  );
}
