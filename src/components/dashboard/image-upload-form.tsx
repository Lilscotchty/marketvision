"use client";

import React, { useState, useRef, useEffect, useCallback, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { handleImageAnalysisAction, uploadChartImages, type AnalysisResult } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, UploadCloud, X, ImagePlus, Sparkles, Lock, Zap } from "lucide-react";
import { PredictionResults } from "./prediction-results";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionModal } from "@/components/billing/subscription-modal";
import type { HistoricalPrediction, UserAppData } from "@/types";
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
  const isProcessing = isPending || uploadingMessage !== null;

  // Helper to get status bar content
  const getStatusContent = () => {
    if (interactionDisabledForAuth) return {
      icon: Lock,
      color: "text-muted-foreground",
      bg: "bg-muted",
      text: "Authentication required"
    };
    if (needsSubscription) return {
      icon: AlertCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      text: "Subscription required"
    };
    if (!hasSubscription) return {
      icon: Zap,
      color: "text-orange-600 dark:text-orange-500",
      bg: "bg-orange-100 dark:bg-orange-500/10",
      text: `${trialPoints} trial analyses remaining`
    };
    return {
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-500",
      bg: "bg-green-100 dark:bg-green-500/10",
      text: "Premium Active"
    };
  };

  const status = getStatusContent();

  const renderFileInput = () => (
    <div
      className={cn(
        "group relative flex flex-col items-center justify-center w-full h-64 rounded-2xl cursor-pointer transition-all duration-300 ease-out",
        "border-2 border-dashed border-border", // Light/Dark aware border
        "bg-secondary/20 dark:bg-secondary/10", // Subtle backgrounds
        isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "hover:bg-secondary/40 hover:border-muted-foreground/40",
        (interactionDisabledForAuth || needsSubscription || isProcessing) && "cursor-not-allowed opacity-50"
      )}
      onClick={() => !(interactionDisabledForAuth || needsSubscription || isProcessing) && fileInputRef.current?.click()}
      onDragEnter={handleDragEvents}
      onDragLeave={handleDragEvents}
      onDragOver={handleDragEvents}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
        <div className={cn(
          "w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:border-primary/30 group-hover:shadow-lg"
        )}>
          <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <p className="mb-2 text-sm text-foreground font-medium">
          <span className="text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">Supports JPG, PNG, WEBP (Max 5MB)</p>
      </div>

      {/* Subtle grid background inside dropzone */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px] rounded-2xl" />
    </div>
  );

  const renderPreviews = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {previewUrls.map((url, index) => (
        <div key={index} className="relative group w-full aspect-video rounded-xl overflow-hidden border border-border bg-background shadow-sm">
          <Image
            src={url}
            alt={`Preview ${index + 1}`}
            fill
            className="object-contain"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-2 bg-red-500/20 text-red-400 rounded-full border border-red-500/50 hover:bg-red-500 hover:text-white transition-colors"
                disabled={isProcessing}
              >
                <X className="w-5 h-5" />
              </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Main Card Container */}
      <div className="group relative w-full rounded-3xl border border-border bg-card overflow-hidden transition-all duration-500 hover:border-primary/20 shadow-xl">
        
        {/* Background Ambient Glows - Hidden in Light Mode for cleanliness, Visible in Dark */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-0 dark:opacity-20 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl opacity-0 dark:opacity-20 pointer-events-none" />

        {isProcessing && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                <Loader />
                {uploadingMessage ? (
                  <p className="mt-6 text-sm font-medium text-foreground animate-pulse">{uploadingMessage}</p>
                ) : (
                  <TypingLoaderText />
                )}
            </div>
        )}
        
        <div className={cn("relative z-10 p-1", isProcessing && "blur-sm scale-[0.98] transition-all duration-700")}>
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col h-full">
            
            {/* Header */}
            <div className="px-6 py-6 border-b border-border">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                         Analysis Engine
                    </h3>
                </div>
                <p className="text-sm text-muted-foreground pl-12">
                    Upload charts to detect patterns, bias, and entry models.
                </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
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
                <div className="space-y-4">
                  {renderPreviews()}
                  {previewUrls.length < MAX_FILES && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-dashed border-border bg-transparent hover:bg-secondary text-muted-foreground hover:text-foreground"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={interactionDisabledForAuth || needsSubscription || isProcessing}
                    >
                      <ImagePlus className="mr-2 h-4 w-4" />
                      Add More Images ({previewUrls.length}/{MAX_FILES})
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-muted/30 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                
                {/* Modern Status Pill */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors", status.bg, status.color, "border-current/20")}>
                        <status.icon className="w-3 h-3" />
                        {status.text}
                    </div>
                    
                    {needsSubscription && (
                         <Button 
                            variant="link" 
                            size="sm" 
                            className="text-foreground h-auto p-0 font-medium hover:text-primary" 
                            onClick={() => setIsSubscriptionModalOpen(true)}
                         >
                            Upgrade Now 
                         </Button>
                    )}
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    {hasFiles && (
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={handleReset} 
                            className="text-muted-foreground hover:text-foreground hover:bg-secondary"
                            disabled={isProcessing}
                        >
                            Reset
                        </Button>
                    )}
                    
                    <Button
                        type="submit"
                        disabled={interactionDisabledForAuth || !canAnalyze || isProcessing || !hasFiles}
                        className={cn(
                            "flex-1 sm:flex-none min-w-[140px] shadow-lg hover:shadow-xl transition-all hover:scale-105",
                            isProcessing ? "bg-secondary text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                    >
                        {isProcessing ? "Processing..." : "Start Analysis"}
                    </Button>
                </div>
            </div>
            </form>
        </div>
      </div>

      {state?.error && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      
      {state?.prediction && state.analysis && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
             <PredictionResults 
                prediction={state.prediction} 
                analysis={state.analysis} 
                imagePreviewUrls={state.imagePreviewUrls || []}
            />
        </div>
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
