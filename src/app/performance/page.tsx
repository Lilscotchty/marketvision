
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { PerformanceHistoryTable } from "@/components/performance/performance-history-table";
import { PerformanceStats } from "@/components/performance/performance-stats";
import type { HistoricalPrediction } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const IS_BROWSER = typeof window !== 'undefined';

const MOCK_NEW_PREDICTIONS_KEY = 'marketVisionNewPredictionTimestamp';
const MAIN_PERFORMANCE_KEY = 'marketVisionPerformance';


export default function PerformancePage() {
  const [predictions, setPredictions] = useState<HistoricalPrediction[]>(() => {
    if (!IS_BROWSER) return [];
    const savedPredictions = localStorage.getItem(MAIN_PERFORMANCE_KEY);
    return savedPredictions ? JSON.parse(savedPredictions) : [];
  });
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [lastSeenNewId, setLastSeenNewId] = useState<string | null>(null);


  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  const syncPredictionsFromStorage = useCallback(() => {
    if (!IS_BROWSER) return;
    const newPredictionId = localStorage.getItem(MOCK_NEW_PREDICTIONS_KEY);
    
    // Check if the trigger value has changed to avoid redundant updates
    if (newPredictionId && newPredictionId !== lastSeenNewId) {
      const allPredictionsString = localStorage.getItem(MAIN_PERFORMANCE_KEY);
      if (allPredictionsString) {
        try {
          const allPredictions: HistoricalPrediction[] = JSON.parse(allPredictionsString);
          setPredictions(allPredictions);
        } catch (error) {
          console.error("Error parsing performance data from storage:", error);
        }
      }
      setLastSeenNewId(newPredictionId);
    }
  }, [lastSeenNewId]);


  useEffect(() => {
    syncPredictionsFromStorage(); // Initial sync

    const handleStorageChange = (event: StorageEvent) => {
      // Listen for changes to the main data store or the trigger key
      if (event.key === MAIN_PERFORMANCE_KEY || event.key === MOCK_NEW_PREDICTIONS_KEY) {
        syncPredictionsFromStorage();
      }
    };
    if (IS_BROWSER) {
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [syncPredictionsFromStorage]);


  useEffect(() => {
    if (IS_BROWSER) {
       localStorage.setItem(MAIN_PERFORMANCE_KEY, JSON.stringify(predictions));
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

  const handleDeletePrediction = (predictionId: string) => {
    const predictionToDelete = predictions.find(p => p.id === predictionId);
    if (predictionToDelete) {
      setPredictions(prevPredictions => prevPredictions.filter(p => p.id !== predictionId));
      toast({
        title: "Prediction Deleted",
        description: `The analysis from ${new Date(predictionToDelete.date).toLocaleDateString()} has been removed.`,
        variant: "destructive"
      });
    }
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
            Track and evaluate your prediction history.
          </p>
        </header>

        <section>
          <PerformanceStats predictions={predictions} />
        </section>

        <section>
          <PerformanceHistoryTable 
            predictions={predictions} 
            onFlagTrade={handleFlagTrade}
            onDeletePrediction={handleDeletePrediction}
          />
        </section>
      </div>
    </main>
  );
}
