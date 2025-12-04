"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AppNotification } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context'; // Import Auth to check user status
import { 
  getNotificationsAction, 
  createNotificationAction, 
  markNotificationReadAction, 
  markAllNotificationsReadAction, 
  deleteNotificationAction, 
  clearAllNotificationsAction 
} from '@/lib/actions';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notificationData: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth(); // Only fetch if user exists

  // 1. Fetch Notifications on Mount (and when user changes)
  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await getNotificationsAction();
      if (!error) {
        setNotifications(data);
      }
    } catch (e) {
      console.error("Error fetching notifications", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshNotifications();
    } else {
      setNotifications([]); // Clear if logged out
    }
  }, [user, refreshNotifications]);

  // 2. Add Notification (Triggers DB Write + Optimistic UI)
  const addNotification = useCallback(async (notificationData: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    // A. Show Toast Immediately
    if (notificationData.type === 'alert_trigger') {
        toast({
            title: `🔔 ${notificationData.title}`,
            description: notificationData.message,
            duration: 5000,
        });
    } else if (notificationData.type !== 'info') {
         toast({
            title: `ℹ️ ${notificationData.title}`,
            description: notificationData.message,
            duration: 5000,
        });
    }

    // B. Optimistic Update (Temporary ID)
    const tempId = Math.random().toString(36).substr(2, 9);
    const newNotification: AppNotification = {
      ...notificationData,
      id: tempId,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);

    // C. Write to Database
    await createNotificationAction(notificationData);
    
    // D. Re-fetch to get real ID and server timestamp
    refreshNotifications();

  }, [toast, refreshNotifications]);

  // 3. Mark Read
  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistic
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
    // DB Update
    await markNotificationReadAction(notificationId);
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Optimistic
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // DB Update
    await markAllNotificationsReadAction();
  }, []);

  // 4. Delete
  const deleteNotification = useCallback(async (notificationId: string) => {
    // Optimistic
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    // DB Update
    await deleteNotificationAction(notificationId);
  }, []);

  const clearAllNotifications = useCallback(async () => {
    // Optimistic
    setNotifications([]);
    // DB Update
    await clearAllNotificationsAction();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        loading
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationCenter() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationCenter must be used within a NotificationProvider');
  }
  return context;
}