"use client";

import React from "react";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Bell, Info, AlertTriangle, ServerCog, BellRing, FileText, Sparkles, Mail, X } from "lucide-react";
import type { AppNotification, NotificationType } from "@/types";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

// Fix 1: Type the map values to explicitly accept className
const iconMap: Record<string, React.ElementType<{ className?: string }>> = {
  BellRing,
  Info,
  AlertTriangle,
  ServerCog,
  Sparkles,
  FileText,
  Mail,
};

const NotificationIcon = ({ type, iconName }: { type: NotificationType; iconName?: string }) => {
  // Fix 2: Type the component variable to explicitly accept className
  let SpecificIcon: React.ElementType<{ className?: string }> = Bell;

  if (iconName && iconMap[iconName]) {
    SpecificIcon = iconMap[iconName];
  } else {
    // Fallback based on type if iconName is not provided
    switch (type) {
      case 'alert_trigger': SpecificIcon = BellRing; break;
      case 'site_message': SpecificIcon = Info; break;
      case 'system_update': SpecificIcon = ServerCog; break;
      case 'info': SpecificIcon = Info; break;
      default: SpecificIcon = Bell;
    }
  }

  const iconColorClass =
    type === 'alert_trigger' ? 'text-accent' :
    type === 'system_update' ? 'text-orange-500' :
    'text-primary';

  return <SpecificIcon className={cn("h-5 w-5 flex-shrink-0", iconColorClass)} />;
};

interface NotificationCardProps {
  notification: AppNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationCard = ({ notification, onMarkAsRead, onDelete }: NotificationCardProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div 
            className={cn(
                "group bg-card text-card-foreground rounded-lg p-4 border-l-4 transition-all hover:shadow-md relative cursor-pointer",
                notification.read ? "border-muted-foreground/30" : "border-primary"
            )}
        >
            <div className="flex items-start gap-4 text-left w-full pr-8">
                <NotificationIcon type={notification.type} iconName={notification.iconName} />
                <div className="flex-grow">
                    <h3 className={cn(
                        "font-semibold text-sm leading-tight",
                        !notification.read && "text-foreground"
                    )}>
                        {notification.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(parseISO(notification.timestamp), { addSuffix: true })}
                    </p>
                </div>
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                }}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-3">
             <NotificationIcon type={notification.type} iconName={notification.iconName} />
             <span>{notification.title}</span>
          </DialogTitle>
          <DialogDescription className="pl-8 pt-1">
            {formatDistanceToNow(parseISO(notification.timestamp), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 text-sm text-muted-foreground whitespace-pre-wrap">
            {notification.message}
        </div>
        
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          {!notification.read && (
            <Button 
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                    onMarkAsRead(notification.id);
                    setIsOpen(false);
                }}
            >
                Mark as Read
            </Button>
          )}
          {notification.relatedLink && (
            <a href={notification.relatedLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full">
                    View Details
                </Button>
            </a>
          )}
           <Button 
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() => {
                    onDelete(notification.id);
                    setIsOpen(false);
                }}
            >
              Delete
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
