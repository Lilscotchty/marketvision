"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { AlertConfigForm } from "@/components/alerts/alert-config-form";
import { AlertListDisplay } from "@/components/alerts/alert-list-display";
import type { AlertConfig } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useNotificationCenter } from "@/contexts/notification-context";
import { useAuth } from "@/contexts/auth-context";
import { sendEmailNotification } from "@/ai/flows/send-email-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, BellRing, Plus } from "lucide-react";
import { useFinnhubTrades } from "@/hooks/use-finnhub-trades";
import { Badge } from "@/components/ui/badge";
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

const IS_BROWSER = typeof window !== 'undefined';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertConfig[]>(() => {
    if (!IS_BROWSER) return [];
    const savedAlerts = localStorage.getItem("marketVisionAlerts");
    return savedAlerts ? JSON.parse(savedAlerts) : [];
  });
  const { toast } = useToast();
  const { addNotification } = useNotificationCenter();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  useEffect(() => {
    if (IS_BROWSER) {
      localStorage.setItem("marketVisionAlerts", JSON.stringify(alerts));
    }
  }, [alerts]);
  
  const triggerAlertNotification = useCallback(async (alert: AlertConfig, currentPrice: number) => {
    const notificationTitle = `Alert Triggered: ${alert.name}`;
    const notificationMessage = `Your alert for ${alert.asset} met its condition: Price reached ${currentPrice}.`;

    addNotification({
      title: notificationTitle,
      message: notificationMessage,
      type: 'alert_trigger',
      iconName: 'BellRing',
      relatedLink: `/alerts#${alert.id}`
    });

    if (alert.notificationMethod === 'email') {
      if (!user?.email) return; 
      try {
        await sendEmailNotification({
          to: user.email,
          subject: `FinSight AI Alert: ${alert.name}`,
          body: notificationMessage,
        });
        addNotification({
          title: "Email Alert Sent",
          message: `An email confirmation for "${alert.name}" was sent to ${user.email}.`,
          type: 'info',
          iconName: 'Mail', 
          relatedLink: `/alerts#${alert.id}`
        });
      } catch (error) {
         console.error("Failed to send email notification:", error);
      }
    }
     // Deactivate alert after it has been triggered
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, isActive: false } : a));

  }, [addNotification, user?.email]);


  const { connectionStatus } = useFinnhubTrades(
    alerts.filter(a => a.isActive).map(a => a.asset),
    (trade) => {
        const { s: symbol, p: price } = trade;
        const activeAlertsForSymbol = alerts.filter(a => 
            a.isActive && 
            a.asset.toUpperCase() === symbol.toUpperCase() && 
            a.conditionType === 'price_target'
        );

        for (const alert of activeAlertsForSymbol) {
            const targetPrice = Number(alert.value);
            if (isNaN(targetPrice)) continue;

            const originalPrice = alert.originalPrice;

            let shouldTrigger = false;
            
            if (originalPrice !== undefined) {
                if (originalPrice > targetPrice && price <= targetPrice) {
                    shouldTrigger = true;
                } else if (originalPrice < targetPrice && price >= targetPrice) {
                    shouldTrigger = true;
                }
            } else {
                if (price >= targetPrice) { 
                    shouldTrigger = true;
                }
            }

            if (shouldTrigger) {
                 triggerAlertNotification(alert, price);
            }
        }
    }
  );

  const handleAddAlert = (newAlert: AlertConfig) => {
    setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
    setIsFormOpen(false); // Close the dialog/sheet after adding
  };

  const handleDeleteAlert = (alertId: string) => {
    const alertToDelete = alerts.find(a => a.id === alertId);
    if (alertToDelete) {
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== alertId));
      toast({
        title: "Alert Deleted",
        description: `The alert "${alertToDelete.name}" has been successfully removed.`,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <main className="flex-1 p-4 sm:px-6 md:gap-8 pb-16 md:pb-8">
        <div className="container mx-auto py-8">
          <Skeleton className="h-10 w-48 mb-4" />
          <Skeleton className="h-8 w-full max-w-md mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const activeAlerts = alerts.filter(a => a.isActive);
  const inactiveAlerts = alerts.filter(a => !a.isActive);
  
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
             <Badge variant={
                connectionStatus === 'connected' ? 'default' : 
                connectionStatus === 'disconnected' ? 'destructive' : 'secondary'
              } className={
                connectionStatus === 'connected' ? 'bg-green-600 hover:bg-green-700' : ''
              }>
                {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
              </Badge>
          </div>
        </header>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <AlertListDisplay
              alerts={alerts}
              onDeleteAlert={handleDeleteAlert}
            />
          </TabsContent>
          <TabsContent value="active" className="mt-6">
            <AlertListDisplay
              alerts={activeAlerts}
              onDeleteAlert={handleDeleteAlert}
            />
          </TabsContent>
          <TabsContent value="inactive" className="mt-6">
             <AlertListDisplay
              alerts={inactiveAlerts}
              onDeleteAlert={handleDeleteAlert}
            />
          </TabsContent>
        </Tabs>

        <FormDialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <FormDialogTrigger asChild>
            <Button className="fixed bottom-20 right-6 md:bottom-8 md:right-8 h-14 w-14 rounded-full shadow-lg z-50">
              <Plus className="h-6 w-6" />
              <span className="sr-only">Add Alert</span>
            </Button>
          </FormDialogTrigger>
          <FormDialogContent side={isMobile ? 'bottom' : undefined} className={isMobile ? 'h-[90vh]' : 'sm:max-w-[425px]'}>
            <FormDialogHeader>
              <FormDialogTitle>Create a New Alert</FormDialogTitle>
              <FormDialogDescription>
                Set up a new market event notification. It will appear in your feed.
              </FormDialogDescription>
            </FormDialogHeader>
            <div className={isMobile ? 'overflow-y-auto' : ''}>
              <AlertConfigForm onAddAlert={handleAddAlert} />
            </div>
          </FormDialogContent>
        </FormDialog>
      </div>
    </main>
  );
}
