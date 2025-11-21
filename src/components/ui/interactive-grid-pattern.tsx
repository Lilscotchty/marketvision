"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface InteractiveGridPatternProps {
  className?: string;
  width?: number;
  height?: number;
  squares?: [number, number];
  gap?: number;
}

export function InteractiveGridPattern({
  className,
  gap = 40,
}: InteractiveGridPatternProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<{ x: number; y: number; startTime: number; id: number }[]>([]);
  const reqRef = useRef<number>(0);
  const lastRippleTime = useRef<number>(0); // Ref for throttling

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configuration
    const maxRadius = 250; // Slightly reduced radius for cleaner trails
    const duration = 1500; // Faster fade for responsiveness
    const dotSize = 1.5;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    
    window.addEventListener("resize", resize);
    resize();

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isDark = document.documentElement.classList.contains("dark");
      // Dynamic color adaptation: Black dots in light mode, White in dark mode
      const dotColor = isDark ? "255, 255, 255" : "0, 0, 0"; 

      // Filter out old ripples
      ripplesRef.current = ripplesRef.current.filter(
        (r) => time - r.startTime < duration
      );

      if (ripplesRef.current.length === 0) {
        reqRef.current = requestAnimationFrame(animate);
        return;
      }

      // Draw Grid
      for (let x = 0; x < canvas.width; x += gap) {
        for (let y = 0; y < canvas.height; y += gap) {
          
          let totalAlpha = 0;

          ripplesRef.current.forEach((ripple) => {
            const elapsed = time - ripple.startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease-out quadratic for radius expansion
            const easeOut = 1 - Math.pow(1 - progress, 2);
            const currentRadius = maxRadius * easeOut;
            
            // Calculate distance from ripple center to dot
            const dx = x - ripple.x;
            const dy = y - ripple.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < currentRadius) {
              // Alpha logic: Fade out over time and at edges
              const rippleAlpha = (1 - progress) * (1 - dist / currentRadius);
              totalAlpha += rippleAlpha;
            }
          });

          // Clamp alpha to max 1
          totalAlpha = Math.min(totalAlpha, 1);

          // Only draw if visible to save resources
          if (totalAlpha > 0.01) {
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            // Max opacity set to 0.6 for a balanced look
            ctx.fillStyle = `rgba(${dotColor}, ${totalAlpha * 0.6})`; 
            ctx.fill();
          }
        }
      }

      reqRef.current = requestAnimationFrame(animate);
    };

    reqRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(reqRef.current);
    };
  }, [gap]);

  // Throttled Mouse Move Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const now = performance.now();
    // Create a new ripple every 30ms (approx 30fps) to create a smooth trail without overloading
    if (now - lastRippleTime.current < 30) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      ripplesRef.current.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        startTime: now,
        id: Math.random(),
      });
      lastRippleTime.current = now;
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 block w-full h-full cursor-crosshair", className)}
      onMouseMove={handleMouseMove}
      style={{ touchAction: "none" }} 
    />
  );
}