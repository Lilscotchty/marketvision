
// src/components/dashboard/image-upload-form.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { handleImageAnalysisAction, uploadChartImages, type AnalysisResult } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AlertCircle, CheckCircle, UploadCloud, CreditCard, X, ImagePlus, BarChartHorizontal, Loader2 } from "lucide-react";
import { PredictionResults } from "./prediction-results";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionModal } from "@/components/billing/subscription-modal";
import type { HistoricalPrediction, UserAppData, Role } from "@/types";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import Loader from "./loader";
import { TypingLoaderText } from "./typing-loader-text";


const KORAPAY_TEST_PAYMENT_LINK = "https://test-checkout.korapay.com/pay/7RZ4eL2uRlHObOg";
const MOCK_NEW_PREDICTIONS_KEY = 'marketVisionNewPredictionTimestamp';
const MAIN_PERFORMANCE_KEY = 'marketVisionPerformance';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILES = 3;
const INITIAL_TRIAL_POINTS = 5;

export function ImageUploadForm() {
  const [state, setState] = useState<AnalysisResult | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const [uploadingMessage, setUploadingMessage] = useState<string | null>(null);

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
    if (typeof window !== 'undefined' && user) {
      const data = localStorage.getItem(`marketVisionUserData_${user.id}`);
      if (data) {
        setUserData(JSON.parse(data));
      } else {
        const initialData: UserAppData = {
          userId: user.id,
          email: user.email || '',
          hasActiveSubscription: false,
          chartAnalysisTrialPoints: INITIAL_TRIAL_POINTS,
          roles: ['User'],
        };
        localStorage.setItem(`marketVisionUserData_${user.id}`, JSON.stringify(initialData));
        setUserData(initialData);
      }
    }
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const decrementTrialPoint = () => {
    if (userData && !userData.hasActiveSubscription && userData.chartAnalysisTrialPoints > 0) {
      const newTrialPoints = userData.chartAnalysisTrialPoints - 1;
      const newUserData: UserAppData = { ...userData, chartAnalysisTrialPoints: newTrialPoints };
      setUserData(newUserData);
      if (user) {
        localStorage.setItem(`marketVisionUserData_${user.id}`, JSON.stringify(newUserData));
      }
    }
  };

  const activateSubscription = () => {
    const newUserData: UserAppData = {
      ...userData,
      userId: user!.id,
      email: user!.email!,
      hasActiveSubscription: true,
      chartAnalysisTrialPoints: 0,
      roles: userData?.roles || ['User'],
    };
    setUserData(newUserData);
    if (user) {
      localStorage.setItem(`marketVisionUserData_${user.id}`, JSON.stringify(newUserData));
    }
    setIsSubscriptionModalOpen(false);
  };

  useEffect(() => {
    if (!state) return;

    if (state?.prediction && state.analysis) {
        if (typeof window !== 'undefined' && user) {
            decrementTrialPoint();

            const newPredictionEntry: HistoricalPrediction = {
                id: `pred_${new Date().getTime()}`,
                date: new Date().toISOString(),
                asset: state.analysis.asset || 'Unknown', 
                imagePreviewUrl: state.imagePreviewUrls?.[0] || "https://placehold.co/150x100/1e1e1e/a8a8a8.png?text=Chart",
                prediction: state.prediction,
                analysis: state.analysis,
                imagePreviewUrls: state.imagePreviewUrls,
                manualFlag: undefined,
            };

            const existingPredictionsString = localStorage.getItem(MAIN_PERFORMANCE_KEY);
            let existingPredictions: HistoricalPrediction[] = existingPredictionsString ? JSON.parse(existingPredictionsString) : [];

            const predictionsForStorage = [newPredictionEntry, ...existingPredictions];
            
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
    const fileList = Array.from(newFiles);

    if (fileList.length > MAX_FILES) {
      toast({
        title: "Too Many Files",
        description: `You can only upload up to ${MAX_FILES} images at a time.`,
        variant: "destructive",
      });
      return;
    }

    for (const file of fileList) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File Too Large",
          description: `"${file.name}" is larger than 5MB.`,
          variant: "destructive",
        });
        return;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: `"${file.name}" is not a supported image type.`,
          variant: "destructive",
        });
        return;
      }
    }

    previewUrls.forEach(url => URL.revokeObjectURL(url));

    setFiles(fileList);
    
    const newPreviewUrls: string[] = [];
    fileList.forEach(file => {
      newPreviewUrls.push(URL.createObjectURL(file));
    });
    setPreviewUrls(newPreviewUrls);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        handleFileDrop(event.target.files);
    }
  };

  const handleDragEvents = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setIsDragging(true);
    } else if (event.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(event);
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFileDrop(event.dataTransfer.files);
    }
  };

  const removeFile = (indexToRemove: number) => {
    URL.revokeObjectURL(previewUrls[indexToRemove]);
    setPreviewUrls(prev => prev.filter((_, index) => index !== indexToRemove));
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    
    if (previewUrls.length === 1) {
      setState(undefined);
    }
  };

  const handleReset = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setFiles([]);
    setState(undefined);
    setUploadingMessage(null);
    formRef.current?.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!files.length || !user || !canAnalyze) return;

    setUploadingMessage("Uploading charts...");
    setState(undefined);

    const uploadResults = await uploadChartImages(files);
    
    const uploadedUrls: string[] = [];
    for (const result of uploadResults) {
      if (result.error) {
        console.error("Upload failed:", result.error);
        setUploadingMessage(null);
        toast({
          title: "Upload Failed",
          description: `Could not upload one or more images: ${result.error.message}`,
          variant: "destructive",
        });
        return;
      }
      if (result.publicUrl) {
        uploadedUrls.push(result.publicUrl);
      }
    }

    if (uploadedUrls.length !== files.length) {
        setUploadingMessage(null);
        toast({
          title: "Upload Incomplete",
          description: "Some images failed to upload. Please try again.",
          variant: "destructive",
        });
        return;
    }

    setUploadingMessage("Upload complete. Starting analysis...");

    startTransition(async () => {
      const result = await handleImageAnalysisAction(uploadedUrls);
      
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
      setState(result);
      setUploadingMessage(null);

      if (result && !result.error && result.imagePreviewUrls) {
          setPreviewUrls(result.imagePreviewUrls.filter(Boolean) as string[]);
      }
    });
  };

  const hasFiles = previewUrls.length > 0;

  const getHelperText = () => {
    if (interactionDisabledForAuth) return "Please log in to analyze charts.";
    if (needsSubscription) return "Your trials have ended. Subscribe for unlimited analysis.";
    if (!hasSubscription) return `You have ${trialPoints} trial analyses remaining.`;
    return "You have an active subscription.";
  };

  const renderFileInput = () => (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
        "border-border/50 hover:border-accent/80 hover:bg-muted/50",
        isDragging && "border-accent bg-accent/10",
        (interactionDisabledForAuth || needsSubscription || (isPending || uploadingMessage !== null)) && "cursor-not-allowed opacity-50"
      )}
      onClick={() => !(interactionDisabledForAuth || needsSubscription || (isPending || uploadingMessage !== null)) && fileInputRef.current?.click()}
      onDragEnter={handleDragEvents}
      onDragLeave={handleDragEvents}
      onDragOver={handleDragEvents}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
        <p className="mb-2 text-sm text-muted-foreground">
          <span className="font-semibold text-accent">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">Up to 3 images (PNG, JPG, WEBP) - 5MB max each</p>
      </div>
    </div>
  );

  const renderPreviews = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {previewUrls.map((url, index) => (
        <div key={index} className="relative group w-full aspect-video">
          <Image
            src={url}
            alt={`Preview ${index + 1}`}
            fill
            className="rounded-md border bg-card object-contain"
          />
          <button
            type="button"
            onClick={() => removeFile(index)}
            className="absolute -top-2 -right-2 z-10 p-1 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove image"
            disabled={(isPending || uploadingMessage !== null)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );

  const isProcessing = isPending || uploadingMessage !== null;

  return (
    <div className="space-y-8">
      <Card className="shadow-lg relative overflow-hidden">
        {isProcessing && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm">
                <Loader />
                {uploadingMessage ? (
                  <p className="mt-6 text-lg font-medium text-foreground">{uploadingMessage}</p>
                ) : (
                  <TypingLoaderText />
                )}
            </div>
        )}
        <div className={cn("relative z-10", isProcessing && "blur-sm")}>
            <form ref={formRef} onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white">
                Chart Analysis
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">Upload your candlestick charts to receive a detailed AI analysis and market prediction.</CardDescription>
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
                disabled={interactionDisabledForAuth || needsSubscription || isProcessing}
                className="hidden"
              />
              
              {!hasFiles && renderFileInput()}
              
              {hasFiles && (
                <>
                  {renderPreviews()}
                  {previewUrls.length < MAX_FILES && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={interactionDisabledForAuth || needsSubscription || isProcessing}
                    >
                      <ImagePlus className="mr-2 h-4 w-4" />
                      Add More Images ({previewUrls.length}/{MAX_FILES})
                    </Button>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Alert className={cn(
                    "w-full sm:w-auto sm:flex-grow",
                    !isFullyAuthenticated && "border-blue-500/50",
                    needsSubscription && "border-destructive/50",
                    canAnalyze && !hasSubscription && "border-green-500/50"
                )}>
                    {needsSubscription ? <AlertCircle className="h-4 w-4 text-destructive" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                    <AlertTitle>
                        {interactionDisabledForAuth && "Authentication"}
                        {needsSubscription && "Subscription Required"}
                        {canAnalyze && !hasSubscription && "Trial Active"}
                        {canAnalyze && hasSubscription && "Premium Access"}
                    </AlertTitle>
                    <AlertDescription>
                        {getHelperText()}
                        {needsSubscription && (
                          <Button variant="link" size="sm" className="p-0 h-auto ml-1 text-destructive" onClick={() => setIsSubscriptionModalOpen(true)}>
                            Subscribe Now
                          </Button>
                        )}
                    </AlertDescription>
                </Alert>

                <div className="flex gap-2 w-full sm:w-auto self-end">
                <Button type="button" variant="outline" onClick={handleReset} className="w-full sm:w-auto" disabled={interactionDisabledForAuth || isProcessing}>
                    Reset
                </Button>
                <Button
                  type="submit"
                  disabled={interactionDisabledForAuth || !canAnalyze || isProcessing || !hasFiles}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploadingMessage ? 'Uploading...' : 'Analyzing...'}
                    </>
                  ) : (
                    "Analyze Charts"
                  )}
                </Button>
                </div>
            </CardFooter>
            </form>
        </div>
      </Card>

      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      
      {state?.prediction && state.analysis && (
        <PredictionResults 
          prediction={state.prediction} 
          analysis={state.analysis} 
          imagePreviewUrls={state.imagePreviewUrls || []}
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
