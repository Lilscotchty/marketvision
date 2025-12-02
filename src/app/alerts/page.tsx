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
import { Loader2, BellRing, Plus } from "lucide-react";
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
const POLLING_INTERVAL = 10000;

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();
  const { addNotification } = useNotificationCenter();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const isMobile = useIsMobile();
  const pollingRef = useRef<NodeJS.Timeout>();

  const activeAlerts = alerts.filter(a => a.isActive);
  const inactiveAlerts = alerts.filter(a => !a.isActive);

  // 1. Fetch Alerts from DB
  useEffect(() => {
    async function loadAlerts() {
      if (!user) return;
      setLoadingData(true);
      const { data, error } = await getAlertsAction();
      if (error) {
        toast({ title: "Error loading alerts", description: error, variant: "destructive" });
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

  // Request Notification Permissions
  useEffect(() => {
    if (IS_BROWSER && "Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);
  
  // 2. Trigger Logic
  const triggerAlertNotification = useCallback(async (alert: AlertConfig, currentPrice: number) => {
    const notificationTitle = `Target Hit: ${alert.asset}`;
    const notificationMessage = `${alert.name} triggered! Price hit ${currentPrice.toLocaleString()} (Target: ${Number(alert.value).toLocaleString()})`;

    // In-App
    addNotification({
      title: notificationTitle,
      message: notificationMessage,
      type: 'alert_trigger',
      iconName: 'BellRing',
      relatedLink: `/alerts#${alert.id}`
    });

    // Native Browser Push
    if (IS_BROWSER && "Notification" in window && Notification.permission === "granted") {
      new Notification(notificationTitle, {
        body: notificationMessage,
        icon: "/icon.jpg",
        tag: `alert-${alert.id}`
      });
    }

    // Email
    if (alert.notificationMethod === 'email') {
      if (user?.email) {
        try {
          await sendEmailNotification({
            to: user.email,
            subject: `FinSight AI Alert: ${alert.name}`,
            body: notificationMessage,
          });
        } catch (error) {
           console.error("Failed to send email:", error);
        }
      }
    } else {
        toast({ title: notificationTitle, description: notificationMessage });
    }

    // Deactivate in DB
    await toggleAlertStatusAction(alert.id, false);
    
    // Update UI
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, isActive: false } : a));

  }, [addNotification, user?.email, toast]);


  // 3. Polling Logic (Price Check)
  useEffect(() => {
    const checkAlerts = async () => {
      const activePriceAlerts = alerts.filter(a => a.isActive && a.conditionType === 'price_target');
      if (activePriceAlerts.length === 0) return;

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
        const originalPrice = alert.originalPrice;

        if (originalPrice !== undefined) {
          const wasBullish = targetPrice > originalPrice; 
          const wasBearish = targetPrice < originalPrice; 

          if (wasBullish && currentPrice >= targetPrice) shouldTrigger = true;
          else if (wasBearish && currentPrice <= targetPrice) shouldTrigger = true;
        } else {
           if (currentPrice >= targetPrice) shouldTrigger = true;
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
    const response = await createAlertAction(alertData);
    if (response.success && response.alert) {
        setAlerts(prev => [response.alert!, ...prev]);
        setIsFormOpen(false);
        toast({ title: "Alert Saved", description: "Your alert is now active." });
    } else {
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
        <header className="mb-8">
          <h1 className="text-3xl font-headline font-bold tracking-tight">
            Alerts Feed
          </h1>
          <div className="mt-1 flex justify-between items-center">
            <p className="text-lg text-muted-foreground">
              Manage your custom market alerts.
            </p>
            {IS_BROWSER && "Notification" in window && Notification.permission === "default" && (
                <Button variant="outline" size="sm" onClick={() => Notification.requestPermission()}>
                    Enable Push Notifications
                </Button>
            )}
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
          
          {/* UI FIX: Flex column layout to handle scrolling properly */}
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