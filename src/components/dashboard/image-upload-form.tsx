
"use client";

import React, { useState, useRef } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { handleImageAnalysisAction, type AnalysisResult } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2, UploadCloud, CreditCard } from "lucide-react";
import { PredictionResults } from "./prediction-results";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionModal } from "@/components/billing/subscription-modal"; // New import

interface SubmitButtonProps {
  isAuthDisabled: boolean;
}

function SubmitButton({ isAuthDisabled }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || isAuthDisabled} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <UploadCloud className="mr-2 h-4 w-4" />
          Analyze Chart
        </>
      )}
    </Button>
  );
}

const KORAPAY_TEST_PAYMENT_LINK = "https://test-checkout.korapay.com/pay/7RZ4eL2uRlHObOg";

export function ImageUploadForm() {
  const initialState: AnalysisResult | undefined = undefined;
  const [state, formAction] = useActionState(handleImageAnalysisAction, initialState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, loading: authLoading, userData, decrementTrialPoint, activateSubscription } = useAuth();
  const { toast } = useToast();
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const isFullyAuthenticated = !authLoading && user;
  const hasSubscription = userData?.hasActiveSubscription;
  const trialPoints = userData?.chartAnalysisTrialPoints ?? 0;

  const canAnalyze = isFullyAuthenticated && (hasSubscription || trialPoints > 0);
  const needsSubscription = isFullyAuthenticated && !hasSubscription && trialPoints <= 0;
  const interactionDisabledForAuth = authLoading || !user;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user && !authLoading) {
      toast({
        title: "Authentication Required",
        description: (
          <p>
            Please{' '}
            <Link href="/login" className="font-semibold text-accent hover:underline">
              log in
            </Link>{' '}
            or{' '}
            <Link href="/signup" className="font-semibold text-accent hover:underline">
              sign up
            </Link>{' '}
            to analyze charts.
          </p>
        ),
        variant: "destructive",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
      }
      setPreviewUrl(null);
      return;
    }

    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleReset = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Upload Candlestick Chart</CardTitle>
          <CardDescription>
            {getHelperText()}
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="chartImage" className="text-base">Chart Image</Label>
              <Input
                id="chartImage"
                name="chartImage"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                required
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={interactionDisabledForAuth || needsSubscription}
                className="file:text-foreground file:font-medium file:bg-muted file:border-0 file:px-4 file:py-2 file:rounded-md file:mr-4 hover:file:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>

            {previewUrl && (
              <div className="mt-4 border border-dashed border-border rounded-lg p-4 flex justify-center items-center bg-muted/20">
                <Image
                  src={previewUrl}
                  alt="Chart preview"
                  width={400}
                  height={300}
                  className="rounded-md object-contain max-h-[300px]"
                  data-ai-hint="chart finance"
                />
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
              {!state?.error && state?.prediction && (
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
            <div className="flex gap-2 w-full sm:w-auto">
              <Button type="button" variant="outline" onClick={handleReset} className="w-full sm:w-auto" disabled={interactionDisabledForAuth}>
                Reset
              </Button>
              <SubmitButton isAuthDisabled={interactionDisabledForAuth || !canAnalyze } />
            </div>
          </CardFooter>
        </form>
      </Card>

      {isFullyAuthenticated && state?.prediction && state?.analysis && (
        <PredictionResults 
          prediction={state.prediction} 
          analysis={state.analysis} 
          imagePreviewUrl={state.imagePreviewUrl} 
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
