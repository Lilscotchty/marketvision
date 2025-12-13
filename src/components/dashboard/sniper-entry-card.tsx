"use client";

import React, { useRef } from 'react';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { cn } from '@/lib/utils';

interface SniperEntryCardProps {
    title: string;
    value: string;
    footerText: string;
    bgColor?: string;
    gradientFrom?: string;
    gradientTo?: string;
}

export const SniperEntryCard = ({ 
    title, 
    value, 
    footerText,
    bgColor = 'bg-purple-400',
    gradientFrom = 'from-purple-500',
    gradientTo = 'to-orange-300'
}: SniperEntryCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const handleDownload = async () => {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: null, // Transparent background
                useCORS: true,
            });
            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = `${title.replace(/\s+/g, '-')}-card.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({
                title: "Download Started",
                description: `${title} card image is being downloaded.`,
            });
        } catch (error) {
            console.error("Error generating image:", error);
            toast({
                title: "Download Failed",
                description: "Could not generate the card image.",
                variant: "destructive",
            });
        }
    };

  return (
    <div ref={cardRef} className="w-[200px] h-[300px] relative border border-solid border-white/40 rounded-2xl overflow-hidden">
      <div className={cn("w-full h-full p-1 absolute", bgColor)}>
        <div className="w-full h-full rounded-xl rounded-tr-[100px] rounded-br-[40px] bg-[#222]" />
      </div>
      <div className="w-full h-full flex items-center justify-center relative backdrop-blur-lg rounded-2xl">
        <div 
            className={cn(
                "w-32 h-32 rounded-full bg-gradient-to-tr animate-spin",
                gradientFrom,
                gradientTo
            )}
            style={{animationDuration: '12s'}} 
        />
      </div>
      <div className="w-full h-full p-2 flex justify-between absolute inset-0">
        <div className="w-3/5 p-2 pt-3 pb-1.5 flex flex-col rounded-xl backdrop-blur-lg bg-gray-50/10 text-gray-200 font-medium font-mono">
          <span className="text-xl font-medium">{title}</span>
          <span className="text-xs text-gray-400 break-words">{value}</span>
          <div className="w-full mt-auto flex items-center justify-center">
            <span className="text-xs text-gray-400">{footerText}</span>
          </div>
        </div>
        <div className="h-full pt-2 flex flex-col items-end text-white/50">
          <span className="text-[10px] leading-[12px]">NEVODEX</span>
          <span className="text-[10px] leading-[13px]">Sniper</span>
          <div 
            onClick={handleDownload}
            className="w-8 h-8 mt-auto flex items-center justify-center rounded-full backdrop-blur-lg bg-gray-50/20 cursor-pointer transition-all duration-300 hover:bg-gray-50/30"
            title="Download Card"
            >
            <Download className="w-4 h-4 text-white/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
