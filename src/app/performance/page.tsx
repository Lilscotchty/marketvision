
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { PerformanceHistoryTable } from "@/components/performance/performance-history-table";
import type { HistoricalPrediction } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const IS_BROWSER = typeof window !== 'undefined';

const MOCK_NEW_PREDICTIONS_KEY = 'marketVisionNewPredictions';

export default function PerformancePage() {
  const [predictions, setPredictions] = useState<HistoricalPrediction[]>(() => {
    if (!IS_BROWSER) return [];
    const savedPredictions = localStorage.getItem("marketVisionPerformance");
    return savedPredictions ? JSON.parse(savedPredictions) : [];
  });
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  const addNewPredictionsFromStorage = useCallback(() => {
    if (!IS_BROWSER) return;
    const newPredictionsString = localStorage.getItem(MOCK_NEW_PREDICTIONS_KEY);
    if (newPredictionsString) {
      try {
        const newPredictionEntries: HistoricalPrediction[] = JSON.parse(newPredictionsString);
        if (Array.isArray(newPredictionEntries) && newPredictionEntries.length > 0) {
          setPredictions(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const trulyNew = newPredictionEntries.filter(np => !existingIds.has(np.id));
            if (trulyNew.length > 0) {
              return [...trulyNew, ...prev];
            }
            return prev;
          });
          localStorage.removeItem(MOCK_NEW_PREDICTIONS_KEY); 
        }
      } catch (error) {
        console.error("Error processing new predictions from storage:", error);
        localStorage.removeItem(MOCK_NEW_PREDICTIONS_KEY); 
      }
    }
  }, []);


  useEffect(() => {
    addNewPredictionsFromStorage(); 

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === MOCK_NEW_PREDICTIONS_KEY) {
        addNewPredictionsFromStorage();
      }
    };
    if (IS_BROWSER) {
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [addNewPredictionsFromStorage]);


  useEffect(() => {
    if (IS_BROWSER) {
       localStorage.setItem("marketVisionPerformance", JSON.stringify(predictions));
    }
  }, [predictions]);

  const handleFlagTrade = (predictionId: string, flag: 'successful' | 'unsuccessful') => {
    setPredictions((prevPredictions) =>
      prevPredictions.map((pred) =>
        pred.id === predictionId ? { ...pred, manualFlag: flag } : pred
      )
    );
    toast({
      title: "Trade Flagged",
      description: `Prediction marked as ${flag}.`,
    });
  };

  if (loading) {
     return (
      <main className="flex-1 items-start gap-4 p-2 sm:px-6 sm:py-0 md:gap-8 pb-16 md:pb-0">
        <div className="container mx-auto py-8 space-y-12">
           <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                 <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
        </div>
      </main>
    );
  }
  
  if (!user) {
    return null; // Return null to prevent rendering while redirecting
  }

  return (
    <main className="flex-1 items-start gap-4 p-2 sm:px-6 sm:py-0 md:gap-8 pb-16 md:pb-0">
      <div className="container mx-auto py-8 space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-headline font-bold tracking-tight sm:text-5xl">
            Performance <span className="text-accent">Metrics</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
            Track and evaluate prediction history.
          </p>
        </header>

        <section>
          <PerformanceHistoryTable predictions={predictions} onFlagTrade={handleFlagTrade} />
        </section>
      </div>
    </main>
  );
}
