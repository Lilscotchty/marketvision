
"use client";

import React, { useState, useEffect } from "react";
import { AlertConfigForm } from "@/components/alerts/alert-config-form";
import { AlertListDisplay } from "@/components/alerts/alert-list-display";
import type { AlertConfig } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useNotificationCenter } from "@/contexts/notification-context";
import { useAuth } from "@/contexts/auth-context";
import { sendEmailNotification } from "@/ai/flows/send-email-flow";

const IS_BROWSER = typeof window !== 'undefined';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertConfig[]>(() => {
    if (!IS_BROWSER) return [];
    const savedAlerts = localStorage.getItem("marketVisionAlerts");
    return savedAlerts ? JSON.parse(savedAlerts) : [];
  });
  const { toast } = useToast();
  const { addNotification } = useNotificationCenter();
  const { user } = useAuth();

  useEffect(() => {
    if (IS_BROWSER) {
      localStorage.setItem("marketVisionAlerts", JSON.stringify(alerts));
    }
  }, [alerts]);

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
        description: `This alert will ${!alert.isActive ? "now send" : "no longer send"} notifications.`,
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

  const handleSimulateTrigger = async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    if (alert.notificationMethod === 'email') {
      if (!user?.email) {
        toast({
          title: "Email Not Found",
          description: "Could not find your email address to send the notification.",
          variant: "destructive",
        });
        return;
      }
      try {
        const subject = `FinSight AI Alert Triggered: ${alert.name}`;
        const body = `Your alert for ${alert.asset} has met its condition: ${alert.conditionType.replace('_', ' ')} at ${alert.value}.`;
        
        await sendEmailNotification({
          to: user.email,
          subject,
          body,
        });

        toast({
          title: "Email Alert Simulated",
          description: `An email notification for "${alert.name}" has been sent to ${user.email}.`,
        });
      } catch (error) {
         console.error("Failed to send email notification:", error);
         toast({
          title: "Email Simulation Failed",
          description: "Could not simulate sending the email alert. See console for details.",
          variant: "destructive",
        });
      }

    } else { // 'in-app'
      addNotification({
        title: `Alert Triggered: ${alert.name}`,
        message: `Your alert for ${alert.asset} has met its condition: ${alert.conditionType.replace('_', ' ')} at ${alert.value}. (This is a simulated trigger)`,
        type: 'alert_trigger',
        iconName: 'BellRing',
        relatedLink: `/alerts#${alert.id}`
      });
      toast({
          title: "Alert Trigger Simulated",
          description: `An in-app notification for alert "${alert.name}" has been sent to your Notification Center.`,
      });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-12">
      <header className="text-center">
        <h1 className="text-4xl font-headline font-bold tracking-tight sm:text-5xl">
          Alert <span className="text-accent">System</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
          Stay informed about market changes and prediction updates with customizable alerts.
        </p>
      </header>

      <section>
        <AlertConfigForm onAddAlert={handleAddAlert} />
      </section>

      <section>
        <AlertListDisplay
          alerts={alerts}
          onToggleAlert={handleToggleAlert}
          onDeleteAlert={handleDeleteAlert}
          onSimulateTrigger={handleSimulateTrigger}
        />
      </section>
    </div>
  );
}
