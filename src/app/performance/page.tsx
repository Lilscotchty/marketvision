"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { PerformanceStats } from "@/components/performance/performance-stats";
import type { HistoricalPrediction } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, HelpCircle } from "lucide-react";
import PredictionCard from "@/components/performance/prediction-card";
import { useIsMobile } from "@/hooks/use-mobile";
import SimplePredictionCard from "@/components/performance/simple-prediction-card";
import { Button } from "@/components/ui/button";
import { getUserAnalyses, updateAnalysisFlag, deleteAnalysisAction, saveAnalysisToHistory } from "@/lib/actions";

const MAIN_PERFORMANCE_KEY = 'marketVisionPerformance';

export default function PerformancePage() {
  const [predictions, setPredictions] = useState<HistoricalPrediction[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 1. Fetch Data from DB
  const loadData = async () => {
    setIsLoadingData(true);
    const { data, error } = await getUserAnalyses();
    if (error) {
      toast({ title: "Error", description: "Failed to load history.", variant: "destructive" });
    } else {
      setPredictions(data);
    }
    setIsLoadingData(false);
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // 2. Migration Logic: Sync LocalStorage to DB Once
  useEffect(() => {
    const migrateLocalStorage = async () => {
        if (typeof window === 'undefined' || !user) return;
        
        const localData = localStorage.getItem(MAIN_PERFORMANCE_KEY);
        if (!localData) return;

        try {
            const localPredictions: HistoricalPrediction[] = JSON.parse(localData);
            if (localPredictions.length > 0) {
                toast({ title: "Syncing Data", description: "Migrating your local history to the cloud..." });
                
                let successCount = 0;
                for (const pred of localPredictions) {
                    // We only save if we have the core data. 
                    // Using Promise.all would be faster but might hit rate limits, so we loop sequentially or batch.
                    const result = await saveAnalysisToHistory(pred.analysis!, pred.prediction, pred.imagePreviewUrls || [pred.imagePreviewUrl]);
                    if(result.success) successCount++;
                }

                if (successCount > 0) {
                    toast({ title: "Migration Complete", description: `Moved ${successCount} records to the database.` });
                    localStorage.removeItem(MAIN_PERFORMANCE_KEY); // Clear after sync
                    loadData(); // Refresh list
                }
            }
        } catch (e) {
            console.error("Migration failed", e);
        }
    };

    if (user && !isLoadingData) {
        migrateLocalStorage();
    }
  }, [user, isLoadingData]);


  const handleFlagTrade = async (predictionId: string, flag: 'successful' | 'unsuccessful') => {
    // Optimistic update
    setPredictions((prev) => prev.map((p) => p.id === predictionId ? { ...p, manualFlag: flag } : p));
    
    const result = await updateAnalysisFlag(predictionId, flag);
    if (result.success) {
        toast({ title: "Trade Flagged", description: `Prediction marked as ${flag}.` });
    } else {
        toast({ title: "Error", description: "Failed to update flag.", variant: "destructive" });
        loadData(); // Revert on error
    }
  };

  const handleDeletePrediction = async (predictionId: string) => {
    // Optimistic update
    const backup = [...predictions];
    setPredictions((prev) => prev.filter(p => p.id !== predictionId));

    const result = await deleteAnalysisAction(predictionId);
    if (result.success) {
      toast({ title: "Prediction Deleted", description: "The analysis has been removed." });
    } else {
      setPredictions(backup); // Revert
      toast({ title: "Error", description: "Could not delete analysis.", variant: "destructive" });
    }
  };

  if (authLoading || isLoadingData) {
     return (
      <main className="flex-1 items-start gap-4 p-2 sm:px-6 sm:py-0 md:gap-8 pb-16 md:pb-0">
        <div className="container mx-auto py-8 space-y-12">
           <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading History...</p>
            </div>
            <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
        </div>
      </main>
    );
  }
  
  if (!user) return null;

  const displayedPredictions = showAll ? predictions : predictions.slice(0, 4);

  return (
    <main className="flex-1 items-start gap-4 p-2 sm:px-6 sm:py-0 md:gap-8 pb-16 md:pb-0">
      <div className="container mx-auto py-8 space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-headline font-bold tracking-tight sm:text-5xl">
            Performance <span className="text-accent">Metrics</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
            Track and evaluate your prediction history from the cloud.
          </p>
        </header>

        <section>
          <PerformanceStats predictions={predictions} />
        </section>

        <section>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Prediction History</CardTitle>
            </CardHeader>
            <CardContent>
              {predictions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <HelpCircle className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-foreground">No Prediction History</h3>
                  <p className="text-muted-foreground">Your analyzed predictions will appear here.</p>
                </div>
              ) : isMobile ? (
                <div className="space-y-4">
                  {displayedPredictions.map((pred) => (
                    <SimplePredictionCard
                      key={pred.id}
                      prediction={pred}
                      onFlag={handleFlagTrade}
                      onDelete={handleDeletePrediction}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                  {displayedPredictions.map((pred) => (
                    <PredictionCard 
                      key={pred.id} 
                      prediction={pred} 
                      onFlag={handleFlagTrade}
                      onDelete={handleDeletePrediction}
                    />
                  ))}
                </div>
              )}
              {!showAll && predictions.length > 4 && (
                <div className="mt-8 text-center">
                  <Button onClick={() => setShowAll(true)}>
                    Load More
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
