
"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const messages = [
  "Magic is happening...",
  "Analyzing market structures...",
  "We are cooking something big...",
  "Identifying ICT patterns...",
  "Almost done...",
  "Finalizing prediction...",
];

export const TypingLoaderText = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleTyping = () => {
      const currentMessage = messages[messageIndex];
      
      if (isDeleting) {
        if (displayedText.length > 0) {
          setDisplayedText(currentMessage.substring(0, displayedText.length - 1));
        } else {
          setIsDeleting(false);
          setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }
      } else {
        if (displayedText.length < currentMessage.length) {
          setDisplayedText(currentMessage.substring(0, displayedText.length + 1));
        } else {
          // Pause at the end of the message before deleting
          setTimeout(() => setIsDeleting(true), 1500);
        }
      }
    };

    const typingSpeed = isDeleting ? 50 : 100;
    const timeout = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, messageIndex]);

  return (
    <div className="mt-6 text-center">
      <p className="text-lg font-medium text-foreground h-6">
        {displayedText}
        <span className="animate-ping">_</span>
      </p>
    </div>
  );
};
