
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { MessageSquare, X } from 'lucide-react';
import { SupportChatbot } from './support-chatbot';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <div className={cn(
        "fixed right-4 z-50",
        isMobile ? "bottom-[calc(3.5rem+1rem)]" : "bottom-4" // h-14 (3.5rem) + bottom-4 (1rem) for mobile
      )}>
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Button
                size="icon"
                className="rounded-full w-14 h-14 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                onClick={() => setIsOpen(true)}
              >
                <MessageSquare className="h-6 w-6" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-0 border-0 shadow-2xl max-w-md h-[70vh] flex flex-col gap-0 data-[state=open]:animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10">
          <DialogHeader className="p-4 border-b bg-muted/50 rounded-t-lg">
            <DialogTitle className="font-headline text-lg text-foreground">FinSight AI Support</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              How can we assist you?
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <SupportChatbot />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
