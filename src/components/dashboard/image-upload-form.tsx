
"use client";

import React, { useState, useRef, useEffect, useCallback, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { handleImageAnalysisAction, type AnalysisResult } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AlertCircle, CheckCircle, UploadCloud, CreditCard, X, ImagePlus, BarChartHorizontal } from "lucide-react";
import { PredictionResults } from "./prediction-results";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionModal } from "@/components/billing/subscription-modal";
import type { HistoricalPrediction, UserAppData } from "@/types";
import { cn } from "@/lib/utils";
import { Lights } from "@/components/ui/background-lights";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnalyzeButton } from "./analyze-button";
import Loader from "./loader";

const KORAPAY_TEST_PAYMENT_LINK = "https://test-checkout.korapay.com/pay/7RZ4eL2uRlHObOg";
const MOCK_NEW_PREDICTIONS_KEY = 'marketVisionNewPredictionTimestamp';
const MAIN_PERFORMANCE_KEY = 'marketVisionPerformance';
const MAX_FILES = 3;
const INITIAL_TRIAL_POINTS = 5;

export function ImageUploadForm() {
  const [state, setState] = useState<AnalysisResult | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const [userData, setUserData] = useState<UserAppData | null>(null);
  const isMobile = useIsMobile();

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
    if (!state) return;

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
  }, [state, user, toast]);


  const isFullyAuthenticated = !authLoading && !!user;
  const hasSubscription = userData?.hasActiveSubscription;
  const trialPoints = userData?.chartAnalysisTrialPoints ?? 0;

  const canAnalyze = isFullyAuthenticated && (hasSubscription || trialPoints > 0);
  const needsSubscription = isFullyAuthenticated && !hasSubscription && trialPoints <= 0;
  const interactionDisabledForAuth = authLoading || !user;

  const handleFileDrop = (newFiles: FileList) => {
    if (interactionDisabledForAuth) {
      toast({
        title: "Authentication Required",
        description: (
          <p>Please <Link href="/login" className="font-semibold text-accent hover:underline">log in</Link> or <Link href="/signup" className="font-semibold text-accent hover:underline">sign up</Link> to analyze charts.</p>
        ),
        variant: "destructive",
      });
      return;
    }

    if (!newFiles) return;

    if (newFiles.length > MAX_FILES) {
      toast({
        title: "Too Many Files",
        description: `You can only upload up to ${MAX_FILES} images at a time.`,
        variant: "destructive",
      });
      return;
    }

    const fileList = Array.from(newFiles);
    setFiles(fileList);
    
    const newPreviewUrls: string[] = [];
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
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        handleFileDrop(event.target.files);
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileDrop(e.dataTransfer.files);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setPreviewUrls(prev => prev.filter((_, index) => index !== indexToRemove));
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };


  const handleReset = () => {
    setPreviewUrls([]);
    setFiles([]);
    setState(undefined);
    formRef.current?.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await handleImageAnalysisAction(formData);
      setState(result);
    });
  };

  const hasFiles = previewUrls.length > 0;

  const getHelperText = () => {
    if (authLoading || userData === null) return "Loading user data...";
    if (!user) return "Log in or sign up to analyze charts.";
    if (hasSubscription) return "Premium access enabled.";
    if (trialPoints > 0) return `You have ${trialPoints} trial analyses remaining.`;
    return "Your trial has ended. Subscribe to continue.";
  };

  useEffect(() => {
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
    }
  }, [files]);

  const renderFileInput = () => {
    if (isMobile) {
      return (
        <div 
          className={cn(
            "flex flex-col items-center justify-center w-full min-h-[150px] p-4",
            (interactionDisabledForAuth || needsSubscription) && "cursor-not-allowed opacity-50"
          )}
        >
          {!hasFiles ? (
            <Button 
              type="button" 
              className="w-full h-auto py-8 flex flex-col items-center justify-center bg-muted/20 border-2 border-dashed border-muted-foreground/30 text-foreground hover:bg-muted/40"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm font-semibold">Select Charts to Analyze</p>
              <p className="mt-1 text-xs text-muted-foreground">Up to {MAX_FILES} images</p>
            </Button>
          ) : (
             renderPreviews()
          )}
        </div>
      );
    }

    // Desktop view
    return (
      <div 
        className={cn(
          "group relative flex flex-col items-center justify-center w-full min-h-[150px] border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer transition-colors",
          isDragging && "border-primary bg-primary/10",
          (interactionDisabledForAuth || needsSubscription) && "cursor-not-allowed opacity-50",
          hasFiles && "border-none min-h-0"
        )}
        onDragEnter={handleDragEvents}
        onDragOver={handleDragEvents}
        onDragLeave={handleDragEvents}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {!hasFiles ? (
          <div className="text-center p-8">
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm font-semibold text-foreground">
              Drag & drop charts here or click to select
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Up to {MAX_FILES} images (PNG, JPG, etc.)
            </p>
          </div>
        ) : (
          renderPreviews()
        )}
      </div>
    );
  };
  
  const renderPreviews = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 w-full">
        {previewUrls.map((url, index) => (
        url ? (
            <div key={index} className="relative aspect-video bg-muted/30 rounded-lg overflow-hidden border">
            <Image
                src={url}
                alt={`Chart preview ${index + 1}`}
                fill
                className="object-contain"
            />
            <Button 
                type="button"
                variant="destructive" 
                size="icon" 
                className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                    e.stopPropagation(); // prevent opening file dialog
                    removeFile(index);
                }}
            >
                <X className="h-4 w-4"/>
            </Button>
            </div>
        ) : null
        ))}
        {files.length < MAX_FILES && (
        <div 
            className="flex items-center justify-center aspect-video bg-muted/20 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:bg-muted/40 transition-colors"
            onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
            }}
        >
            <div className="text-center">
                <ImagePlus className="mx-auto h-8 w-8 text-muted-foreground/50"/>
                <p className="mt-2 text-xs text-muted-foreground">Add more</p>
            </div>
        </div>
        )}
    </div>
  );

  return (
    <div className="space-y-8">
      <Card className="shadow-lg relative overflow-hidden">
        {isPending && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-card/50 backdrop-blur-sm">
                <Loader />
            </div>
        )}
        <Lights className="absolute top-0 left-0 w-full h-full" />
        <div className={cn("relative z-10", isPending && "blur-sm")}>
            <form ref={formRef} onSubmit={handleSubmit}>
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2"><BarChartHorizontal className="text-primary h-5 mr-2 w-5"/>Multi-Timeframe Analysis</CardTitle>
                <CardDescription>{getHelperText()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                
              <Input
                id="chart-images"
                name="chartImages"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={interactionDisabledForAuth || needsSubscription}
                className="hidden"
              />
              {renderFileInput()}

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
                <AnalyzeButton
                  isPending={isPending}
                  isDisabled={interactionDisabledForAuth || !canAnalyze || isPending || !hasFiles}
                />
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
