
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { handleImageAnalysisAction, type AnalysisResult } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2, UploadCloud, CreditCard, X, ImagePlus, BarChartHorizontal } from "lucide-react";
import { PredictionResults } from "./prediction-results";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionModal } from "@/components/billing/subscription-modal";
import type { HistoricalPrediction, UserAppData } from "@/types";
import { cn } from "@/lib/utils";
import { Lights } from "@/components/ui/background-lights";

interface SubmitButtonProps {
  isAuthDisabled: boolean;
  hasFiles: boolean;
}

function SubmitButton({ isAuthDisabled, hasFiles }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || isAuthDisabled || !hasFiles} className="w-full bg-primary hover:bg-primary/90">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <UploadCloud className="mr-2 h-4 w-4" />
          Analyze Charts
        </>
      )}
    </Button>
  );
}

const KORAPAY_TEST_PAYMENT_LINK = "https://test-checkout.korapay.com/pay/7RZ4eL2uRlHObOg";
const MOCK_NEW_PREDICTIONS_KEY = 'marketVisionNewPredictionTimestamp';
const MAIN_PERFORMANCE_KEY = 'marketVisionPerformance';
const MAX_FILES = 3;
const INITIAL_TRIAL_POINTS = 5;

export function ImageUploadForm() {
  const initialState: AnalysisResult | undefined = undefined;
  const [state, formAction, isPending] = useActionState(handleImageAnalysisAction, initialState);
  
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());

  const [userData, setUserData] = useState<UserAppData | null>(null);

  const loadUserData = useCallback(() => {
    if (!user) {
      setUserData(null);
      return;
    }
    const storedData = localStorage.getItem(`userData-${user.uid}`);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (typeof parsedData.chartAnalysisTrialPoints === 'undefined') {
            parsedData.chartAnalysisTrialPoints = INITIAL_TRIAL_POINTS;
        }
         if (parsedData.chartAnalysisTrialPoints < 0) {
          parsedData.chartAnalysisTrialPoints = 0;
        }
        if (typeof parsedData.hasActiveSubscription === 'undefined') {
          parsedData.hasActiveSubscription = false;
        }
        setUserData(parsedData);
      } catch (error) {
        console.error("Failed to parse user data:", error)
        // Set default if parsing fails
        setUserData({
            userId: user.uid,
            email: user.email || '',
            chartAnalysisTrialPoints: INITIAL_TRIAL_POINTS,
            hasActiveSubscription: false,
        });
      }
    } else {
      // Initialize for a new user
      const newUser: UserAppData = {
        userId: user.uid,
        email: user.email || '',
        chartAnalysisTrialPoints: INITIAL_TRIAL_POINTS,
        hasActiveSubscription: false,
      };
      setUserData(newUser);
      localStorage.setItem(`userData-${user.uid}`, JSON.stringify(newUser));
    }
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);


  const decrementTrialPoint = () => {
    setUserData(prev => {
        if (prev && !prev.hasActiveSubscription && prev.chartAnalysisTrialPoints > 0) {
            const newPoints = Math.max(0, prev.chartAnalysisTrialPoints - 1);
            const updatedUserData = { ...prev, chartAnalysisTrialPoints: newPoints };
            localStorage.setItem(`userData-${prev.userId}`, JSON.stringify(updatedUserData));
            return updatedUserData;
        }
        return prev;
    });
  };

  const activateSubscription = () => {
    setUserData(prev => {
        if (prev) {
            const updatedUserData = { ...prev, hasActiveSubscription: true };
            localStorage.setItem(`userData-${prev.userId}`, JSON.stringify(updatedUserData));
            return updatedUserData;
        }
        return null;
    });
  };


  useEffect(() => {
    if (isPending) return;

    if (state?.prediction && state.analysis) {
        if (typeof window !== 'undefined' && user) {
            decrementTrialPoint();

            const newPredictionEntry: HistoricalPrediction = {
                id: `pred_${new Date().getTime()}`,
                date: new Date().toISOString(),
                asset: state.analysis.asset || 'Unknown', // Get asset from analysis
                imagePreviewUrl: "https://placehold.co/150x100/1e1e1e/a8a8a8.png?text=Chart",
                prediction: state.prediction,
                analysis: state.analysis,
                imagePreviewUrls: state.imagePreviewUrls,
                manualFlag: undefined,
            };

            const existingPredictionsString = localStorage.getItem(MAIN_PERFORMANCE_KEY);
            let existingPredictions: HistoricalPrediction[] = existingPredictionsString ? JSON.parse(existingPredictionsString) : [];

            const predictionsForStorage = [newPredictionEntry, ...existingPredictions].map(p => {
              const { imagePreviewUrls, ...rest } = p;
              if (!rest.imagePreviewUrl || rest.imagePreviewUrl.startsWith('data:image')) {
                rest.imagePreviewUrl = "https://placehold.co/150x100/1e1e1e/a8a8a8.png?text=Chart";
              }
              return rest;
            });
            
            try {
              localStorage.setItem(MAIN_PERFORMANCE_KEY, JSON.stringify(predictionsForStorage));
            } catch (error) {
               console.error("Failed to set item in localStorage:", error);
               toast({
                 title: "Storage Error",
                 description: "Could not save the analysis. The browser storage might be full.",
                 variant: "destructive"
               });
            }
            
            localStorage.setItem(MOCK_NEW_PREDICTIONS_KEY, newPredictionEntry.id);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, isPending, user, toast]);


  const isFullyAuthenticated = !authLoading && !!user;
  const hasSubscription = userData?.hasActiveSubscription;
  const trialPoints = userData?.chartAnalysisTrialPoints ?? 0;

  const canAnalyze = isFullyAuthenticated && (hasSubscription || trialPoints > 0);
  const needsSubscription = isFullyAuthenticated && !hasSubscription && trialPoints <= 0;
  const interactionDisabledForAuth = authLoading || !user;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (interactionDisabledForAuth) {
      toast({
        title: "Authentication Required",
        description: (
          <p>Please <Link href="/login" className="font-semibold text-accent hover:underline">log in</Link> or <Link href="/signup" className="font-semibold text-accent hover:underline">sign up</Link> to analyze charts.</p>
        ),
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    const files = event.target.files;
    if (!files) return;
    
    if (files.length > MAX_FILES) {
        toast({
            title: "Too Many Files",
            description: `You can only upload up to ${MAX_FILES} images at a time.`,
            variant: "destructive"
        });
        if(fileInputRef.current) fileInputRef.current.value = "";
        setPreviewUrls([]);
        return;
    }

    const newPreviewUrls: string[] = [];
    const fileList = Array.from(files);

    fileList.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
            newPreviewUrls.push(reader.result as string);
            if (newPreviewUrls.length === fileList.length) {
                setPreviewUrls(newPreviewUrls);
            }
        };
        reader.readAsDataURL(file);
    });
  };

  const handleReset = () => {
    setPreviewUrls([]);
    setFormKey(Date.now()); // Re-mount the form to clear file inputs and reset action state
  };

  const hasFiles = previewUrls.length > 0;

  const getHelperText = () => {
    if (authLoading || userData === null) return "Loading user data...";
    if (!user) return "Log in or sign up to analyze charts.";
    if (hasSubscription) return "Premium access enabled.";
    if (trialPoints > 0) return `You have ${trialPoints} trial analyses remaining.`;
    return "Your trial has ended. Subscribe to continue.";
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg relative overflow-hidden">
        <Lights className="absolute top-0 left-0 w-full h-full" />
        <div className="relative z-10">
            <form action={formAction} key={formKey}>
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2"><BarChartHorizontal className="text-primary h-5 mr-2 w-5"/>Multi-Timeframe Analysis</CardTitle>
                <CardDescription>{getHelperText()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="chart-images" className="text-sm font-medium flex items-center gap-1.5">
                        <ImagePlus className="h-4 w-4 text-muted-foreground"/> Upload Charts (Max {MAX_FILES})
                    </Label>
                    <Input
                        id="chart-images"
                        name="chartImages"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        disabled={interactionDisabledForAuth || needsSubscription}
                        className="file:text-foreground file:font-medium file:bg-muted file:border-0 file:px-3 file:py-2 file:rounded-md file:mr-3 text-xs"
                    />
                </div>
                
                {hasFiles && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {previewUrls.map((url, index) => (
                    url ? (
                        <div key={index} className="relative aspect-[4/3] bg-muted/30 rounded-lg overflow-hidden border">
                        <Image
                            src={url}
                            alt={`Chart preview ${index + 1}`}
                            fill
                            className="object-contain"
                        />
                        </div>
                    ) : null
                    ))}
                </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex-grow w-full sm:w-auto">
                {state?.error && (
                    <Alert variant="destructive" className="mb-4 sm:mb-0">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.error}</AlertDescription>
                    </Alert>
                )}
                {!isPending && !state?.error && state?.prediction && (
                    <Alert variant="default" className="mb-4 sm:mb-0 border-green-500 text-green-500 [&>svg]:text-green-500">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Analysis Complete</AlertTitle>
                    <AlertDescription>Scroll down for results.</AlertDescription>
                    </Alert>
                )}
                {needsSubscription && (
                    <Alert variant="default" className="mb-4 sm:mb-0 border-accent text-accent [&>svg]:text-accent">
                    <CreditCard className="h-4 w-4" />
                    <AlertTitle>Subscription Required</AlertTitle>
                    <AlertDescription>
                        Your trial has ended.
                        <Button 
                        variant="link" 
                        className="p-0 h-auto ml-1 text-accent font-semibold"
                        onClick={() => setIsSubscriptionModalOpen(true)}
                        >
                        Subscribe Now
                        </Button>
                    </AlertDescription>
                    </Alert>
                )}
                </div>
                <div className="flex gap-2 w-full sm:w-auto self-end">
                <Button type="button" variant="outline" onClick={handleReset} className="w-full sm:w-auto" disabled={interactionDisabledForAuth || isPending}>
                    Reset
                </Button>
                <SubmitButton isAuthDisabled={interactionDisabledForAuth || !canAnalyze || isPending} hasFiles={hasFiles} />
                </div>
            </CardFooter>
            </form>
        </div>
      </Card>

      {isFullyAuthenticated && !isPending && state?.prediction && state?.analysis && (
        <PredictionResults 
          prediction={state.prediction} 
          analysis={state.analysis} 
          imagePreviewUrls={state.imagePreviewUrls} 
        />
      )}
      
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSimulateSuccess={() => {
          activateSubscription();
          toast({ title: "Subscription Activated", description: "You now have premium access!" });
        }}
        paymentLink={KORAPAY_TEST_PAYMENT_LINK}
      />
    </div>
  );
}
