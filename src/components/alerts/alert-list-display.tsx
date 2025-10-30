
"use client";

import React from "react";
import type { AlertConfig } from "@/types";
import { BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from 'date-fns';

interface AlertListDisplayProps {
  alerts: AlertConfig[];
  onDeleteAlert: (alertId: string) => void;
}

export function AlertListDisplay({ alerts, onDeleteAlert }: AlertListDisplayProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <BellOff className="h-24 w-24 text-muted-foreground/30 mb-6" />
        <h3 className="text-2xl font-semibold mb-2 text-foreground">No records found</h3>
        <p className="text-muted-foreground">There are no alerts in this category.</p>
      </div>
    );
  }

  const getBorderColor = (isActive: boolean, conditionType: string) => {
    if (!isActive) return 'border-muted-foreground/30';
    switch (conditionType) {
      case 'price_target':
        return 'border-primary';
      case 'pattern_detected':
        return 'border-accent';
      default:
        return 'border-secondary';
    }
  };

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div key={alert.id} id={alert.id} className={cn("relative bg-card text-card-foreground rounded-lg p-4 border-l-4 transition-all hover:shadow-md", getBorderColor(alert.isActive, alert.conditionType))}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6">
                <X className="h-4 w-4" />
                <span className="sr-only">Delete alert</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the alert "{alert.name}". This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteAlert(alert.id)} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold text-muted-foreground pr-8">{alert.asset}</p>
            <p className="text-3xl font-bold tracking-tight">
                {typeof alert.value === 'number' ? `$${alert.value.toLocaleString()}` : alert.value}
            </p>
            <div className="flex justify-between items-end">
              <p className="text-xs text-muted-foreground">
                {alert.isActive ? `Price target set at ${alert.value}` : `Alert triggered` }
              </p>
              <p className="text-xs text-muted-foreground">
                {alert.createdAt && formatDistanceToNow(parseISO(alert.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
