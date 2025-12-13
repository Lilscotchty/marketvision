"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from 'next/navigation';
import { AlertConfigForm } from "@/components/alerts/alert-config-form";
import { AlertListDisplay } from "@/components/alerts/alert-list-display";
import type { AlertConfig } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useNotificationCenter } from "@/contexts/notification-context";
import { useAuth } from "@/contexts/auth-context";
import { sendEmailNotification } from "@/ai/flows/send-email-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger
} from "@/components/ui/sheet";
import { 
  fetchMarketData, 
  createAlertAction, 
  getAlertsAction, 
  deleteAlertAction, 
  toggleAlertStatusAction 
} from "@/lib/actions";

const IS_BROWSER = typeof window !== 'undefined';
const POLLING_INTERVAL = 10000; // Check every 10 seconds

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  const { toast } = useToast();
  const { addNotification } = useNotificationCenter();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const isMobile = useIsMobile();
  const pollingRef = useRef<NodeJS.Timeout>();

  const activeAlerts = alerts.filter(a => a.isActive);
  const inactiveAlerts = alerts.filter(a => !a.isActive);

  // 1. Initial Data Fetch
  useEffect(() => {
    async function loadAlerts() {
      if (!user) return;
      setLoadingData(true);
      const { data, error } = await getAlertsAction();
      if (error) {
        toast({ title: "Sync Error", description: "Could not load alerts.", variant: "destructive" });
      } else {
        setAlerts(data);
      }
      setLoadingData(false);
    }

    if (!authLoading && user) {
      loadAlerts();
    } else if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router, toast]);

  // Request Permissions on Mount
  useEffect(() => {
    if (IS_BROWSER && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // 2. Notification Logic (Trigger)
  const triggerAlertNotification = useCallback(async (alert: AlertConfig, currentPrice: number) => {
    const notificationTitle = `Target Hit: ${alert.asset}`;
    const notificationMessage = `${alert.name} triggered! Price: ${currentPrice.toLocaleString()} (Target: ${Number(alert.value).toLocaleString()})`;

    // A. In-App Notification Center (Saved to DB via Context)
    // This ensures the notification appears in the user's notification list
    addNotification({
      title: notificationTitle,
      message: notificationMessage,
      type: 'alert_trigger',
      iconName: 'BellRing',
      relatedLink: `/alerts#${alert.id}`
    });

    // B. Browser Push Notification
    // This pushes a system-level alert to the device
    if (IS_BROWSER && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(notificationTitle, {
          body: notificationMessage,
          icon: "/icon.jpg", 
          tag: `alert-${alert.id}`
        });
      } catch (e) {
        console.error("Push failed", e);
      }
    }

    // C. Email
    if (alert.notificationMethod === 'email' && user?.email) {
        sendEmailNotification({
          to: user.email,
          subject: `NEVODEX Alert: ${alert.name}`,
          body: notificationMessage,
        }).catch(console.error);
    } else if (!("Notification" in window) || Notification.permission !== "granted") {
       // Fallback Toast if push is disabled
       toast({ title: notificationTitle, description: notificationMessage, duration: 5000 });
    }

    // D. Deactivate Alert
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, isActive: false } : a));
    await toggleAlertStatusAction(alert.id, false);

  }, [addNotification, user?.email, toast]);


  // 3. Smart Polling Logic
  useEffect(() => {
    const checkAlerts = async () => {
      const activePriceAlerts = alerts.filter(a => a.isActive && a.conditionType === 'price_target');
      if (activePriceAlerts.length === 0) return;

      setLastChecked(new Date());

      const uniqueAssets = Array.from(new Set(activePriceAlerts.map(a => a.asset.toUpperCase())));
      
      const priceResults = await Promise.all(uniqueAssets.map(async (asset) => {
         const result = await fetchMarketData(asset);
         return { asset, price: result.data?.price };
      }));

      const symbolPriceMap = new Map<string, number>();
      priceResults.forEach(r => {
          if (r.price !== undefined) symbolPriceMap.set(r.asset, r.price);
      });

      for (const alert of activePriceAlerts) {
        const currentPrice = symbolPriceMap.get(alert.asset.toUpperCase());
        const targetPrice = Number(alert.value);

        if (currentPrice === undefined || isNaN(targetPrice)) continue;

        let shouldTrigger = false;
        let originalPrice = alert.originalPrice;

        // Auto-detect direction if originalPrice missing
        if (originalPrice === undefined || originalPrice === null) {
            originalPrice = currentPrice; 
        }

        const wasBullishSetup = targetPrice > originalPrice; 
        const wasBearishSetup = targetPrice < originalPrice; 

        if (wasBullishSetup) {
           if (currentPrice >= targetPrice) shouldTrigger = true;
        } else if (wasBearishSetup) {
           if (currentPrice <= targetPrice) shouldTrigger = true;
        } else {
           if (currentPrice === targetPrice) shouldTrigger = true;
        }

        if (shouldTrigger) {
          triggerAlertNotification(alert, currentPrice);
        }
      }
    };
    
    if (pollingRef.current) clearInterval(pollingRef.current);

    if (activeAlerts.length > 0) {
        checkAlerts(); 
        pollingRef.current = setInterval(checkAlerts, POLLING_INTERVAL);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [alerts, triggerAlertNotification, activeAlerts.length]);

  const handleAddAlert = async (alertData: AlertConfig) => {
    const tempAlert = { ...alertData, id: 'temp-' + Date.now() };
    setAlerts(prev => [tempAlert, ...prev]);
    setIsFormOpen(false);

    const response = await createAlertAction(alertData);
    if (response.success && response.alert) {
        setAlerts(prev => [response.alert!, ...prev.filter(a => a.id !== tempAlert.id)]);
        toast({ title: "Alert Saved", description: "Your alert is active." });
    } else {
        setAlerts(prev => prev.filter(a => a.id !== tempAlert.id));
        toast({ title: "Error", description: response.message, variant: "destructive" });
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    const prevAlerts = [...alerts];
    setAlerts(prev => prev.filter(a => a.id !== alertId));

    const response = await deleteAlertAction(alertId);
    if (!response.success) {
        setAlerts(prevAlerts); 
        toast({ title: "Error", description: "Failed to delete alert.", variant: "destructive" });
    } else {
        toast({ title: "Alert Deleted", description: "Removed from database." });
    }
  };

  if (authLoading || loadingData) {
    return (
      <main className="flex-1 p-4 sm:px-6 md:gap-8 pb-16 md:pb-8">
        <div className="container mx-auto py-8">
           <div className="flex items-center gap-2 mb-8">
             <Loader2 className="h-6 w-6 animate-spin text-primary" />
             <span className="text-muted-foreground">Syncing alerts...</span>
           </div>
          <Skeleton className="h-10 w-48 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const FormDialog = isMobile ? Sheet : Dialog;
  const FormDialogTrigger = isMobile ? SheetTrigger : DialogTrigger;
  const FormDialogContent = isMobile ? SheetContent : DialogContent;
  const FormDialogHeader = isMobile ? SheetHeader : DialogHeader;
  const FormDialogTitle = isMobile ? SheetTitle : DialogTitle;
  const FormDialogDescription = isMobile ? SheetDescription : DialogDescription;

  return (
    <main className="flex-1 p-4 sm:px-6 md:gap-8 pb-24 md:pb-8">
      <div className="container mx-auto py-8">
        <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">
              Alerts Feed
            </h1>
            <div className="mt-1 flex items-center gap-3">
                <p className="text-lg text-muted-foreground">
                Manage your custom market alerts.
                </p>
                {lastChecked && (
                    <span className="text-xs text-muted-foreground/60 flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full">
                        <RefreshCw className="h-3 w-3 animate-pulse" /> 
                        Live: {lastChecked.toLocaleTimeString()}
                    </span>
                )}
            </div>
          </div>
        </header>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <AlertListDisplay alerts={alerts} onDeleteAlert={handleDeleteAlert} />
          </TabsContent>
          <TabsContent value="active" className="mt-6">
            <AlertListDisplay alerts={activeAlerts} onDeleteAlert={handleDeleteAlert} />
          </TabsContent>
          <TabsContent value="inactive" className="mt-6">
             <AlertListDisplay alerts={inactiveAlerts} onDeleteAlert={handleDeleteAlert} />
          </TabsContent>
        </Tabs>

        <FormDialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <FormDialogTrigger asChild>
            <Button className="fixed bottom-20 right-6 md:bottom-8 md:right-8 h-14 w-14 rounded-full shadow-lg z-50">
              <Plus className="h-6 w-6" />
              <span className="sr-only">Add Alert</span>
            </Button>
          </FormDialogTrigger>
          
          <FormDialogContent 
             side={isMobile ? 'bottom' : undefined} 
             className={isMobile ? 'flex flex-col h-[90vh]' : 'sm:max-w-[425px] flex flex-col max-h-[85vh]'}
          >
            <FormDialogHeader>
              <FormDialogTitle>Create a New Alert</FormDialogTitle>
              <FormDialogDescription>
                Set up a new market event notification.
              </FormDialogDescription>
            </FormDialogHeader>
            <div className="flex-1 overflow-y-auto pr-1">
              <AlertConfigForm onAddAlert={handleAddAlert} />
            </div>
          </FormDialogContent>
        </FormDialog>
      </div>
    </main>
  );
}