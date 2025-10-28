
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AlertConfig } from "@/types";
import { BellOff, Trash2, BellRing, MoreVertical } from "lucide-react";
import { CustomDropdown, type CustomDropdownMenuItem } from "@/components/ui/custom-dropdown";
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

interface AlertListDisplayProps {
  alerts: AlertConfig[];
  onToggleAlert: (alertId: string) => void;
  onDeleteAlert: (alertId: string) => void;
}

export function AlertListDisplay({ alerts, onToggleAlert, onDeleteAlert }: AlertListDisplayProps) {
  if (alerts.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BellOff className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">No Alerts Configured</h3>
            <p className="text-muted-foreground">Create an alert to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Configured Alerts</CardTitle>
        <CardDescription>Manage your existing market alerts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const dropdownItems: CustomDropdownMenuItem[][] = [
            [
              {
                icon: alert.isActive ? <BellOff /> : <BellRing />,
                label: alert.isActive ? "Deactivate" : "Activate",
                onClick: () => onToggleAlert(alert.id),
              },
            ],
            [
              {
                icon: <Trash2 />,
                label: "Delete",
                isDelete: true,
                onClick: (e) => {
                  e.stopPropagation();
                  document.getElementById(`delete-trigger-${alert.id}`)?.click();
                },
              },
            ],
          ];

          return (
            <div key={alert.id} id={alert.id} className="group relative bg-muted/30 hover:bg-muted/50 transition-colors rounded-lg flex items-center p-2 pr-2">
              <div className="flex-1 text-left p-2 rounded-lg flex items-center gap-4">
                <div className="flex-shrink-0">
                    <Badge variant={alert.isActive ? "default" : "outline"} className={alert.isActive ? "bg-green-600 hover:bg-green-700 text-white" : ""}>
                      {alert.isActive ? "Active" : "Inactive"}
                    </Badge>
                </div>
                <div className="flex-1">
                    <p className="font-bold text-base">{alert.name}</p>
                    <p className="text-xs text-muted-foreground">{alert.asset} - {alert.conditionType.replace('_', ' ')} at {alert.value}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <CustomDropdown
                  items={dropdownItems}
                  trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button id={`delete-trigger-${alert.id}`} className="hidden" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the alert "{alert.name}".
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
            </div>
          )
        })}
      </CardContent>
    </Card>
  );
}
