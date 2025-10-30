'use client'
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { LiveMarketDataDisplay } from "@/components/live-analysis/live-market-data-display";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bot, PlusCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

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
  
  const FormContainer = isMobile ? Sheet : Dialog;
  const FormContainerTrigger = isMobile ? SheetTrigger : DialogTrigger;
  const FormContainerContent = isMobile ? SheetContent : DialogContent;
  const FormContainerHeader = isMobile ? SheetHeader : DialogHeader;
  const FormContainerTitle = isMobile ? SheetTitle : DialogTitle;
  const FormContainerDescription = isMobile ? SheetDescription : DialogDescription;
  
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
           <h2 className="text-2xl font-semibold font-headline mb-6 text-center">Conceptual Market Analysis</h2>
           <FormContainer open={isFormOpen} onOpenChange={setIsFormOpen}>
            <Card className="shadow-md text-center">
              <CardHeader>
                  <CardTitle className="font-headline text-xl flex items-center justify-center gap-2">
                    <Bot className="text-primary"/>
                    AI-Powered ICT Analysis
                  </CardTitle>
                  <CardDescription>
                    Provide market context to get a conceptual analysis based on ICT principles.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                <FormContainerTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4"/>
                      Start New Analysis
                    </Button>
                </FormContainerTrigger>
              </CardContent>
            </Card>

            <FormContainerContent side={isMobile ? 'bottom' : undefined} className={isMobile ? 'h-[95vh] flex flex-col' : 'sm:max-w-4xl'}>
              <FormContainerHeader>
                <FormContainerTitle>Conceptual Market Analysis Input</FormContainerTitle>
                <FormContainerDescription>
                  Fetch a live quote or manually enter data, then get the AI's conceptual take. This is not financial advice.
                </FormContainerDescription>
              </FormContainerHeader>
              <div className="flex-grow overflow-y-auto pr-2">
                <LiveMarketDataDisplay onAnalysisComplete={() => {}} />
              </div>
            </FormContainerContent>
           </FormContainer>
        </section>
      </div>
    </main>
  );
}
