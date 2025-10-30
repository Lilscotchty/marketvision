
"use client";

import React from "react";
import { useNotificationCenter } from "@/contexts/notification-context";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckCheck, Trash2, BellOff } from "lucide-react";
import type { AppNotification } from "@/types";
import { cn } from "@/lib/utils";
import { NotificationCard } from "@/components/notifications/notification-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NotificationsPage() {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications,
    unreadCount 
  } = useNotificationCenter();

  const unreadNotifications = notifications.filter(n => !n.read);

  const EmptyState = () => (
    <div className="text-center py-24">
      <BellOff className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
      <h3 className="text-2xl font-semibold mb-2 text-foreground">No records found</h3>
      <p className="text-muted-foreground">There are no notifications in this category.</p>
    </div>
  );

  const NotificationList = ({ items }: { items: AppNotification[] }) => (
    <div className="space-y-4">
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        items.map((notification) => (
          <NotificationCard 
            key={notification.id} 
            notification={notification}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        ))
      )}
    </div>
  );

  return (
    <main className="flex-1 p-4 sm:px-6 md:gap-8 pb-24 md:pb-8">
      <div className="container mx-auto py-8">
        <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">
              Notification Center
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">
              Manage your recent notifications. {unreadCount > 0 && `You have ${unreadCount} unread.`}
            </p>
          </div>
          {notifications.length > 0 && (
            <div className="flex gap-2 items-center flex-shrink-0">
              <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                <CheckCheck className="mr-2 h-4 w-4" /> Mark All Read
              </Button>
              <Button variant="destructive" size="sm" onClick={clearAllNotifications}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear All
              </Button>
            </div>
          )}
        </header>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-sm">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <NotificationList items={notifications} />
          </TabsContent>
          <TabsContent value="unread" className="mt-6">
            <NotificationList items={unreadNotifications} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
