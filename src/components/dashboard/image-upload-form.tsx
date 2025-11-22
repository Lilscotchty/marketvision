"use client";

import React, { useState, useRef, useEffect, useCallback, useTransition } from "react";
import Image from "next/image";
import Link from "next/link"; // Fixed: Added missing Link import
import { 
    handleImageAnalysisAction, 
    uploadChartImages, 
    consumeAnalysisCredit, 
    simulateSubscriptionSuccess, 
    type AnalysisResult 
} from "@/lib/actions";
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; 
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
  
  const { user, loading: authLoading, userData } = useAuth();
  const { toast } = useToast();
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [localCredits, setLocalCredits] = useState<number | null>(null);

  const isMobile = useIsMobile();

  const loadUserData = useCallback(() => {
    if (typeof window !== 'undefined' && user) {
      const data = localStorage.getItem(`marketVisionUserData_${user.id}`);
      if (data) {
        // We can sync if needed, but context takes precedence
        const parsed = JSON.parse(data);
        if (!localCredits && parsed.chartAnalysisTrialPoints) {
             setLocalCredits(parsed.chartAnalysisTrialPoints);
        }
      }
    }
  }, [user, localCredits]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Sync local credits with userData from context initially
  useEffect(() => {
      if (userData) {
          setLocalCredits(userData.chartAnalysisTrialPoints);
      }
  }, [userData]);

  const isFullyAuthenticated = !authLoading && !!user;
  const hasSubscription = userData?.hasActiveSubscription;
  // Use localCredits if available (optimistic update), otherwise fallback to context
  const currentPoints = localCredits ?? (userData?.chartAnalysisTrialPoints || 0);

  // Determine if user can analyze based on DB data
  const canAnalyze = isFullyAuthenticated && (hasSubscription || currentPoints > 0);
  const needsSubscription = isFullyAuthenticated && !hasSubscription && currentPoints <= 0;
  const interactionDisabledForAuth = authLoading || !user;

  const handleActivateSubscription = async () => {
    const result = await simulateSubscriptionSuccess();
    if (result.success) {
         toast({ title: "Subscription Activated", description: "You now have premium access!" });
         setIsSubscriptionModalOpen(false);
         window.location.reload();
    } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

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
    
    if (!files.length || !user) return;
    if (!canAnalyze) {
        setIsSubscriptionModalOpen(true);
        return;
    }

    setUploadingMessage("Verifying credits...");
    
    startTransition(async () => {
        const creditResult = await consumeAnalysisCredit();
        
        if (!creditResult.success) {
            setUploadingMessage(null);
            toast({ 
                title: "Access Denied", 
                description: creditResult.message || "Please upgrade your plan.", 
                variant: "destructive" 
            });
            setIsSubscriptionModalOpen(true);
            return;
        }

        if (creditResult.remainingCredits !== undefined) {
            setLocalCredits(creditResult.remainingCredits);
        }

        setUploadingMessage("Uploading charts...");
        const uploadResults = await uploadChartImages(files);
        
        const uploadedUrls: string[] = [];
        for (const result of uploadResults) {
            if (result.error || !result.publicUrl) {
                console.error("Upload failed:", result.error);
                setUploadingMessage(null);
                toast({ title: "Upload Failed", description: "Could not upload images.", variant: "destructive" });
                return;
            }
            uploadedUrls.push(result.publicUrl);
        }

        setUploadingMessage("Running AI analysis...");
        const result = await handleImageAnalysisAction(uploadedUrls);
        
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setState(result);
        setUploadingMessage(null);

        if (result && !result.error && result.imagePreviewUrls) {
            setPreviewUrls(result.imagePreviewUrls.filter(Boolean) as string[]);
            
            const newPredictionEntry: HistoricalPrediction = {
                id: `pred_${new Date().getTime()}`,
                date: new Date().toISOString(),
                asset: result.analysis?.asset || 'Unknown', 
                imagePreviewUrl: result.imagePreviewUrls?.[0] || "https://placehold.co/150x100/1e1e1e/a8a8a8.png?text=Chart",
                prediction: result.prediction!,
                analysis: result.analysis!,
                imagePreviewUrls: result.imagePreviewUrls,
                manualFlag: undefined,
            };

            const existingPredictionsString = localStorage.getItem(MAIN_PERFORMANCE_KEY);
            let existingPredictions: HistoricalPrediction[] = existingPredictionsString ? JSON.parse(existingPredictionsString) : [];
            const predictionsForStorage = [newPredictionEntry, ...existingPredictions];
            
            try {
              localStorage.setItem(MAIN_PERFORMANCE_KEY, JSON.stringify(predictionsForStorage));
            } catch (error) {
               console.error("Failed to set item in localStorage:", error);
            }
            localStorage.setItem(MOCK_NEW_PREDICTIONS_KEY, newPredictionEntry.id);
        }
    });
  };

  const hasFiles = previewUrls.length > 0;
  // Fixed: Defined isProcessing variable
  const isProcessing = isPending || uploadingMessage !== null;

  const getStatusContent = () => {
    if (interactionDisabledForAuth) return {
      icon: Lock,
      color: "text-zinc-500 dark:text-zinc-400",
      bg: "bg-zinc-100 dark:bg-zinc-800/50",
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
      text: `${currentPoints} trial analyses remaining`
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
        "group relative flex flex-col items-center justify-center w-full h-64 rounded-2xl cursor-pointer transition-all duration-300 ease-out overflow-hidden",
        "border-2 border-dashed border-border", 
        "bg-secondary/20 dark:bg-secondary/10", 
        isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "hover:bg-secondary/40 hover:border-muted-foreground/40",
        (interactionDisabledForAuth || needsSubscription || isProcessing) && "cursor-not-allowed opacity-50"
      )}
      onClick={() => !(interactionDisabledForAuth || needsSubscription || isProcessing) && fileInputRef.current?.click()}
      onDragEnter={handleDragEvents}
      onDragLeave={handleDragEvents}
      onDragOver={handleDragEvents}
      onDrop={handleDrop}
    >
      {/* Inner Grid Texture for Dropzone */}
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
        <div className={cn(
          "w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 border border-border group-hover:border-primary/30 group-hover:shadow-lg"
        )}>
          <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <p className="mb-2 text-sm text-foreground font-medium">
          <span className="text-primary font-bold">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">Supports JPG, PNG, WEBP (Max 5MB)</p>
      </div>
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
      <div className="group relative w-full rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-primary/20 shadow-2xl">
        
        {/* --- PROFESSIONAL BACKGROUND EFFECTS --- */}
    
        {/* 2. Animated Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-600/10 rounded-full blur-[100px] -z-10 animate-pulse delay-700" />

        {/* 3. Stardust Texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none mix-blend-overlay" />


        {isProcessing && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/70 backdrop-blur-md transition-all duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                    <Loader />
                </div>
                {uploadingMessage ? (
                  <p className="mt-8 text-sm font-medium text-foreground animate-pulse tracking-wide">{uploadingMessage}</p>
                ) : (
                  <div className="mt-4"><TypingLoaderText /></div>
                )}
            </div>
        )}
        
        <div className={cn("relative z-10 p-1", isProcessing && "blur-[2px] scale-[0.99] opacity-50 transition-all duration-700")}>
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col h-full">
            
            {/* Header */}
            <div className="px-6 py-6 border-b border-border/40 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-inner">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-foreground">
                            Analysis Engine
                        </h3>
                    </div>
                    <p className="text-sm text-muted-foreground pl-12">
                        Advanced pattern recognition & bias detection.
                    </p>
                </div>
                <div className="hidden sm:block text-xs font-mono text-muted-foreground/50 border border-border/30 px-2 py-1 rounded bg-background/50">
                    AI-MODEL: V4.2
                </div>
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
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  {renderPreviews()}
                  {previewUrls.length < MAX_FILES && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-dashed border-border bg-transparent hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all"
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
            <div className="px-6 py-4 bg-muted/30 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4 backdrop-blur-sm">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors shadow-sm", status.bg, status.color, "border-current/20")}>
                        <status.icon className="w-3 h-3" /> {status.text}
                    </div>
                    
                    {needsSubscription && (
                         <Button 
                            variant="link" 
                            size="sm" 
                            className="text-foreground h-auto p-0 font-medium hover:text-primary underline-offset-4" 
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
                            "flex-1 sm:flex-none min-w-[160px] shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all hover:scale-105 active:scale-95 font-semibold",
                            isProcessing ? "bg-secondary text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                    >
                        {isProcessing ? "Processing..." : "Run Analysis"}
                    </Button>
                </div>
            </div>
            </form>
        </div>
      </div>

      {state?.error && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 text-destructive shadow-lg">
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
        onSimulateSuccess={handleActivateSubscription}
        paymentLink={KORAPAY_TEST_PAYMENT_LINK}
      />
    </div>
  );
}