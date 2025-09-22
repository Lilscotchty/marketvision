
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const promotionalImages = [
  {
    src: 'https://i.ibb.co/ym2dh44q/1000150562-imgupscaler-ai-General-8-K-jpg.jpg',
    alt: 'Promotion 1: Advanced AI Analysis',
    dataAiHint: 'modern technology',
    title: 'Unlock Advanced AI Analysis',
    description: 'Go beyond basic patterns with our Pro-tier insights.',
  },
  {
    src: 'https://i.ibb.co/ym2dh44q/1000150562-imgupscaler-ai-General-8-K-jpg.jpg',
    alt: 'Promotion 2: Real-time Alerts',
    dataAiHint: 'notification bell',
    title: 'Never Miss a Move',
    description: 'Set custom, real-time alerts for price, patterns, and more.',
  },
  {
    src: 'https://placehold.co/800x250/000000/FFFFFF.png',
    alt: 'Promotion 3: In-depth Performance Tracking',
    dataAiHint: 'analytics chart',
    title: 'Track Your Performance',
    description: 'Review historical predictions to refine your strategy.',
  },
];

export function PromotionalImageTray() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % promotionalImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const currentImage = promotionalImages[index];

  return (
    <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden shadow-lg border border-border bg-card">
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image
            src={currentImage.src}
            alt={currentImage.alt}
            fill
            style={{objectFit: 'cover'}}
            className="z-0"
            data-ai-hint={currentImage.dataAiHint}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
          <div className="absolute inset-0 z-20 flex flex-col justify-center items-start p-6 md:p-12 text-white">
            <h3 className="text-2xl md:text-4xl font-headline font-bold drop-shadow-lg">
              {currentImage.title}
            </h3>
            <p className="mt-2 text-md md:text-lg max-w-md text-white/90 drop-shadow-md">
              {currentImage.description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {promotionalImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn(
              'h-2 w-2 rounded-full transition-all duration-300',
              i === index ? 'w-6 bg-primary' : 'bg-white/50 hover:bg-white/75'
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
