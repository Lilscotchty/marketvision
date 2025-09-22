
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
import { Loader2 } from "lucide-react";
import { useFinnhubTrades } from "@/hooks/use-finnhub-trades";
import { Badge } from "@/components/ui/badge";

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
          message: `An email notification for "${alert.name}" was sent to ${user.email}.`,
          type: 'info',
          iconName: 'BellRing', 
          relatedLink: `/alerts#${alert.id}`
        });
      } catch (error) {
         console.error("Failed to send email notification:", error);
      }
    } else { // 'in-app'
      addNotification({
        title: notificationTitle,
        message: notificationMessage,
        type: 'alert_trigger',
        iconName: 'BellRing',
        relatedLink: `/alerts#${alert.id}`
      });
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
            // Example condition: Price is greater than or equal to target
            // A more robust implementation would check based on original price direction
            if (!isNaN(targetPrice) && price >= targetPrice) {
                 triggerAlertNotification(alert, price);
            }
        }
    }
  );


  const handleAddAlert = (newAlert: AlertConfig) => {
    setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
  };

  const handleToggleAlert = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      setAlerts((prevAlerts) =>
        prevAlerts.map((a) =>
          a.id === alertId ? { ...a, isActive: !a.isActive } : a
        )
      );
      toast({
        title: `Alert "${alert.name}" ${!alert.isActive ? "Activated" : "Deactivated"}`,
      });
    }
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
      <main className="flex-1 items-start gap-4 p-2 sm:px-6 sm:py-0 md:gap-8 pb-16 md:pb-0">
        <div className="container mx-auto py-8 space-y-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                   <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
        </div>
      </main>
    );
  }

  if (!user) {
    return null; // Return null to prevent rendering while redirecting
  }

  return (
    <main className="flex-1 items-start gap-4 p-2 sm:px-6 sm:py-0 md:gap-8 pb-16 md:pb-0">
      <div className="container mx-auto py-8 space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-headline font-bold tracking-tight sm:text-5xl">
            Alert <span className="text-accent">System</span>
          </h1>
          <div className="mt-3 flex justify-center items-center gap-2">
            <p className="text-lg text-muted-foreground">
              Create and manage custom market alerts.
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

        <section>
          <AlertConfigForm onAddAlert={handleAddAlert} />
        </section>

        <section>
          <AlertListDisplay
            alerts={alerts}
            onToggleAlert={handleToggleAlert}
            onDeleteAlert={handleDeleteAlert}
          />
        </section>
      </div>
    </main>
  );
}
