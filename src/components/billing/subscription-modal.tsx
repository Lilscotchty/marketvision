
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle, Smartphone, Bitcoin, CircleDollarSign, Repeat, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Import useToast
import SubscribeButton from '../pricing/subscribe-button';

interface PaymentOption {
  name: string;
  icon: React.ElementType;
  actionType: 'link' | 'toast';
  link?: string;
  toastMessage?: string;
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateSuccess: () => void;
  paymentLink: string; // Korapay link
}

export function SubscriptionModal({
  isOpen,
  onClose,
  onSimulateSuccess,
  paymentLink,
}: SubscriptionModalProps) {
  const { toast } = useToast(); // Initialize toast

  const paymentOptions: PaymentOption[] = [
    {
      name: 'Mobile Money (Korapay)',
      icon: Smartphone,
      actionType: 'link',
      link: paymentLink,
    },
    {
      name: 'Binance Pay',
      icon: Repeat,
      actionType: 'toast',
      toastMessage: 'Binance Pay integration is coming soon!',
    },
    {
      name: 'Bitcoin Deposit',
      icon: Bitcoin,
      actionType: 'toast',
      toastMessage: 'Bitcoin deposit option is coming soon!',
    },
    {
      name: 'USDT Deposit',
      icon: CircleDollarSign,
      actionType: 'toast',
      toastMessage: 'USDT deposit option is coming soon!',
    },
  ];

  const handlePaymentOptionClick = (option: PaymentOption) => {
    if (option.actionType === 'link' && option.link) {
      window.open(option.link, '_blank', 'noopener,noreferrer');
      onClose(); // Close modal after opening link
    } else if (option.actionType === 'toast' && option.toastMessage) {
      toast({
        title: 'Feature Not Available',
        description: option.toastMessage,
        variant: 'default',
        duration: 3000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Unlock Premium Features</DialogTitle>
          <DialogDescription>
            Choose your preferred payment method to subscribe to MarketVision Pro and get unlimited access.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <div onClick={() => handlePaymentOptionClick(paymentOptions[0])}>
            <SubscribeButton />
          </div>
        </div>
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-center text-muted-foreground pb-2">
            For testing purposes only:
          </p>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              onSimulateSuccess();
              onClose();
            }}
          >
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            Simulate Successful Payment
          </Button>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
