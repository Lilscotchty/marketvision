
"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { AlertConfig, AssetCategory } from "@/types";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { categorizeAssetAction } from '@/lib/actions';
import { Skeleton } from "../ui/skeleton";

interface AlertListDisplayProps {
  alerts: AlertConfig[];
  onDeleteAlert: (alertId: string) => void;
}

const categoryColors: Record<AssetCategory, string> = {
  Forex: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-500/30",
  Crypto: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-500/30",
  Stock: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-500/30",
  Index: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-500/30",
  Commodity: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-500/30",
  Unknown: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-500/30"
};

const AlertCard = ({ alert, onDeleteAlert }: { alert: AlertConfig; onDeleteAlert: (id: string) => void }) => {
  const [category, setCategory] = useState<AssetCategory | null>(alert.category || null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(!alert.category);

  // Fallback fetching for alerts created before category was saved
  useEffect(() => {
    if (!alert.category && isLoadingCategory) {
      const fetchCategory = async () => {
        try {
          const result = await categorizeAssetAction(alert.asset);
          if (result && !result.error) {
            setCategory(result.category as AssetCategory);
            // Here you could optionally update localStorage to persist the fetched category
          } else {
            setCategory('Unknown');
          }
        } catch (error) {
          console.error("Failed to categorize asset:", error);
          setCategory('Unknown');
        } finally {
          setIsLoadingCategory(false);
        }
      };
      fetchCategory();
    } else if (alert.category) {
        setIsLoadingCategory(false);
    }
  }, [alert.asset, alert.category, isLoadingCategory]);

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

  const colorClass = category ? categoryColors[category] : categoryColors.Unknown;
  
  const formattedValue = (val: string | number) => {
    const num = typeof val === 'number' ? val : parseFloat(val);
    if (!isNaN(num)) {
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 5,
      });
    }
    return val;
  };
  
  const displayValue = formattedValue(alert.value);

  return (
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
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-muted-foreground pr-8">{alert.asset}</p>
          {isLoadingCategory ? (
            <Skeleton className="h-5 w-16 rounded-full" />
          ) : (
            category && <Badge variant="outline" className={cn("text-xs py-0.5", colorClass)}>{category}</Badge>
          )}
        </div>
        <p className="text-3xl font-bold tracking-tight">
          ${displayValue}
        </p>
        <div className="flex justify-between items-end">
          <p className="text-xs text-muted-foreground">
            {alert.isActive ? `Price target set at ${displayValue}` : `Alert triggered`}
          </p>
          {alert.createdAt && (
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(parseISO(alert.createdAt), { addSuffix: true })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

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

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} onDeleteAlert={onDeleteAlert} />
      ))}
    </div>
  );
}
