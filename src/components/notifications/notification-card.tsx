
"use client";

import React from "react";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Bell, Info, AlertTriangle, ServerCog, BellRing, FileText, Sparkles, Mail, X } from "lucide-react";
import type { AppNotification, NotificationType } from "@/types";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "../ui/button";

const iconMap: Record<string, React.ElementType> = {
  BellRing,
  Info,
  AlertTriangle,
  ServerCog,
  Sparkles,
  FileText,
  Mail,
};

const NotificationIcon = ({ type, iconName }: { type: NotificationType; iconName?: string }) => {
  let SpecificIcon: React.ElementType = Bell;

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
  return (
    <div 
        className={cn(
            "bg-card text-card-foreground rounded-lg p-4 border-l-4 transition-all hover:shadow-md relative",
            notification.read ? "border-muted-foreground/30" : "border-primary"
        )}
    >
        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
            }}
        >
            <X className="h-4 w-4" />
        </Button>

        <Accordion type="single" collapsible>
            <AccordionItem value={notification.id} className="border-b-0">
                <AccordionTrigger className="hover:no-underline p-0">
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
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-0">
                    <div className="pl-9 space-y-4">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notification.message}</p>
                        <div className="flex gap-2">
                            {!notification.read && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => onMarkAsRead(notification.id)}
                                >
                                    Mark as Read
                                </Button>
                            )}
                            {notification.relatedLink && (
                                <a href={notification.relatedLink} target="_blank" rel="noopener noreferrer">
                                    <Button variant="secondary" size="sm">
                                        View Details
                                    </Button>
                                </a>
                            )}
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
  );
};
