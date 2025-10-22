
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const promotionalImages = [
  {
    type: 'image',
    src: 'https://i.ibb.co/ym2dh44q/1000150562-imgupscaler-ai-General-8-K-jpg.jpg',
    alt: 'Promotion 1: Advanced AI Analysis',
    dataAiHint: 'modern technology',
    title: 'Unlock Advanced AI Analysis',
    description: 'Go beyond basic patterns with our Pro-tier insights.',
  },
  {
    type: 'image',
    src: 'https://i.ibb.co/ym2dh44q/1000150562-imgupscaler-ai-General-8-K-jpg.jpg',
    alt: 'Promotion 2: Real-time Alerts',
    dataAiHint: 'notification bell',
    title: 'Never Miss a Move',
    description: 'Set custom, real-time alerts for price, patterns, and more.',
  },
  {
    type: 'video',
    videoSrc: "https://imagekit.io/player/embed/1ejsuh0x4/Modern_performance_tracking_202510221027.mp4?controls=false&autoplay=true&loop=true&background=%23000000&mute=true",
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
    }, 9000); // Change image every 9 seconds

    return () => clearInterval(interval);
  }, []);

  const currentItem = promotionalImages[index];

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
          {currentItem.type === 'video' && currentItem.videoSrc ? (
            <iframe
              src={currentItem.videoSrc}
              title={currentItem.alt}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full z-0 object-cover"
            ></iframe>
          ) : (
             currentItem.src && <Image
              src={currentItem.src}
              alt={currentItem.alt}
              fill
              style={{objectFit: 'cover'}}
              className="z-0"
              data-ai-hint={currentItem.dataAiHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
          <div className="absolute inset-0 z-20 flex flex-col justify-center items-start p-6 md:p-12 text-white">
            <h3 className="text-2xl md:text-4xl font-headline font-bold drop-shadow-lg">
              {currentItem.title}
            </h3>
            <p className="mt-2 text-md md:text-lg max-w-md text-white/90 drop-shadow-md">
              {currentItem.description}
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
