
"use client";

import React, { useState, useRef, useEffect } from "react";
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
import type { HistoricalPrediction } from "@/types";
import { cn } from "@/lib/utils";

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


export function ImageUploadForm() {
  const initialState: AnalysisResult | undefined = undefined;
  const [state, formAction, isPending] = useActionState(handleImageAnalysisAction, initialState);
  
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([null, null, null]);
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];
  
  const { user, loading: authLoading, userData, decrementTrialPoint, activateSubscription } = useAuth();
  const { toast } = useToast();
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [formKey, setFormKey] = useState(Date.now()); // Used to reset the form

  const imageFields = [
    { name: "chartImage1", label: "HTF Chart (e.g., 4H, Daily)", ref: fileInputRefs[0] },
    { name: "chartImage2", label: "MTF Chart (e.g., 1H, 15M)", ref: fileInputRefs[1] },
    { name: "chartImage3", label: "LTF Chart (e.g., 5M, 1M)", ref: fileInputRefs[2] },
  ];

  useEffect(() => {
    if (isPending) return;

    if (state?.prediction && state.analysis) {
        if (typeof window !== 'undefined') {
            const newPredictionEntry: HistoricalPrediction = {
                id: `pred_${new Date().getTime()}`,
                date: new Date().toISOString(),
                asset: state.asset, // Get asset from state
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
        decrementTrialPoint();
    }
}, [state, isPending, decrementTrialPoint, toast]);


  const isFullyAuthenticated = !authLoading && user;
  const hasSubscription = userData?.hasActiveSubscription;
  const trialPoints = userData?.chartAnalysisTrialPoints ?? 0;

  const canAnalyze = isFullyAuthenticated && (hasSubscription || trialPoints > 0);
  const needsSubscription = isFullyAuthenticated && !hasSubscription && trialPoints <= 0;
  const interactionDisabledForAuth = authLoading || !user;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!user && !authLoading) {
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

    const file = event.target.files?.[0];
    const newPreviewUrls = [...previewUrls];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviewUrls[index] = reader.result as string;
        setPreviewUrls(newPreviewUrls);
      };
      reader.readAsDataURL(file);
    } else {
      newPreviewUrls[index] = null;
      setPreviewUrls(newPreviewUrls);
    }
  };

  const handleReset = () => {
    setPreviewUrls([null, null, null]);
    setFormKey(Date.now()); // Re-mount the form to clear file inputs and reset action state
  };

  const hasFiles = previewUrls.some(url => url !== null);

  const getHelperText = () => {
    if (authLoading) return "Loading user data...";
    if (!user) return "Log in or sign up to analyze charts.";
    if (hasSubscription) return "Premium access enabled.";
    if (trialPoints > 0) return `You have ${trialPoints} trial analyses remaining.`;
    return "Your trial has ended. Subscribe to continue.";
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <form action={formAction} key={formKey}>
           <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2"><BarChartHorizontal className="text-primary"/>Multi-Timeframe Analysis</CardTitle>
            <CardDescription>{getHelperText()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {imageFields.map((field, index) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name} className="text-sm font-medium flex items-center gap-1.5">
                      <ImagePlus className="h-4 w-4 text-muted-foreground"/> {field.label}
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => handleFileChange(e, index)}
                    ref={field.ref}
                    disabled={interactionDisabledForAuth || needsSubscription}
                    className="file:text-foreground file:font-medium file:bg-muted file:border-0 file:px-3 file:py-2 file:rounded-md file:mr-3 text-xs"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-2">
                <Label htmlFor="asset" className="text-sm font-medium flex items-center gap-1.5">
                    Asset/Pair (e.g., BTC/USD)
                </Label>
                <Input
                    id="asset"
                    name="asset"
                    placeholder="Enter the asset symbol shown in the chart"
                    disabled={interactionDisabledForAuth || needsSubscription}
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
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full"
                         onClick={() => {
                           const newPreviews = [...previewUrls];
                           newPreviews[index] = null;
                           setPreviewUrls(newPreviews);
                           if (fileInputRefs[index].current) {
                             fileInputRefs[index].current!.value = "";
                           }
                         }}
                       >
                         <X className="h-4 w-4" />
                       </Button>
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
