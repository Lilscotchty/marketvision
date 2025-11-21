"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Bitcoin, 
  CircleDollarSign, 
  Repeat, 
  ShieldCheck, 
  Lock, 
  CreditCard,
  Check,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PaymentOption {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  actionType: 'link' | 'toast';
  link?: string;
  toastMessage?: string;
  isRecommended?: boolean;
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateSuccess: () => void;
  paymentLink: string;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  onSimulateSuccess,
  paymentLink,
}: SubscriptionModalProps) {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string>('korapay');

  const paymentOptions: PaymentOption[] = [
    {
      id: 'korapay',
      name: 'Mobile Money / Card',
      description: 'Instant access via Korapay',
      icon: CreditCard,
      actionType: 'link',
      link: paymentLink,
      isRecommended: true,
    },
    {
      id: 'binance',
      name: 'Binance Pay',
      description: 'Direct crypto transfer',
      icon: Repeat,
      actionType: 'toast',
      toastMessage: 'Binance Pay integration is coming soon!',
    },
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      description: 'BTC Network',
      icon: Bitcoin,
      actionType: 'toast',
      toastMessage: 'Bitcoin deposit option is coming soon!',
    },
    {
      id: 'usdt',
      name: 'Tether (USDT)',
      description: 'TRC20 / ERC20',
      icon: CircleDollarSign,
      actionType: 'toast',
      toastMessage: 'USDT deposit option is coming soon!',
    },
  ];

  const handleProcessPayment = () => {
    const method = paymentOptions.find(m => m.id === selectedMethod);
    if (!method) return;

    if (method.actionType === 'link' && method.link) {
      window.open(method.link, '_blank', 'noopener,noreferrer');
      onClose();
    } else if (method.actionType === 'toast' && method.toastMessage) {
      toast({
        title: 'Feature Unavailable',
        description: method.toastMessage,
        variant: 'default', 
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-[#09090b] border-zinc-800 text-zinc-100 gap-0 shadow-2xl">
        
        {/* Header Section with Gradient */}
        <div className="relative bg-gradient-to-b from-zinc-900 to-[#09090b] p-6 pb-8 border-b border-zinc-800">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-orange-500 opacity-80" />
          <DialogHeader>
            <div className="flex justify-between items-start">
              <DialogTitle className="text-2xl font-headline font-bold tracking-tight text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" /> Secure Checkout
              </DialogTitle>
              <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-medium text-primary flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> SSL ENCRYPTED
              </div>
            </div>
            <p className="text-zinc-400 mt-2 text-sm">
              Complete your subscription to unlock MarketVision Pro.
            </p>
          </DialogHeader>

          {/* Order Summary Card inside Header */}
          <div className="mt-6 bg-black/40 border border-white/5 rounded-xl p-4 flex justify-between items-center backdrop-blur-md">
            <div>
              <p className="text-sm font-medium text-zinc-300">MarketVision Pro</p>
              <p className="text-xs text-zinc-500">Monthly Subscription</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-white">$49.00</p>
              <p className="text-[10px] text-zinc-500">Billed monthly</p>
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div className="p-6 bg-[#09090b]">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Select Payment Method
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            {paymentOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setSelectedMethod(option.id)}
                className={cn(
                  "relative flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 group",
                  selectedMethod === option.id
                    ? "bg-primary/5 border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                )}
              >
                <div className={cn(
                  "p-3 rounded-full transition-colors",
                  selectedMethod === option.id ? "bg-primary/20 text-primary" : "bg-zinc-800 text-zinc-400 group-hover:text-zinc-200"
                )}>
                  <option.icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={cn("font-semibold text-sm", selectedMethod === option.id ? "text-white" : "text-zinc-300")}>
                      {option.name}
                    </p>
                    {option.isRecommended && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold">
                        FAST
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">{option.description}</p>
                </div>

                <div className={cn(
                  "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                  selectedMethod === option.id ? "border-primary bg-primary text-black" : "border-zinc-700"
                )}>
                  {selectedMethod === option.id && <Check className="w-3 h-3" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-6 pt-2 bg-[#09090b] flex-col sm:flex-col gap-3">
          <Button 
            size="lg" 
            className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white font-bold shadow-lg h-12 rounded-xl text-base"
            onClick={handleProcessPayment}
          >
            Pay $49.00 Now
          </Button>
          
          {/* Dev Only / Test Mode Area */}
          <div className="w-full pt-4 border-t border-zinc-800/50 flex justify-between items-center">
            <span className="text-[10px] text-zinc-600 font-mono">TEST MODE ENABLED</span>
            <button
              onClick={() => {
                onSimulateSuccess();
                onClose();
              }}
              className="text-xs text-zinc-500 hover:text-green-500 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Simulate Success
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
