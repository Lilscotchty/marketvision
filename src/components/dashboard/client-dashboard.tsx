"use client";

import React, { useState } from 'react';
import { ImageUploadForm } from "@/components/dashboard/image-upload-form";
import TradingStrategyCards from './trading-strategy-cards';
import { Activity, Cpu, Zap, LayoutDashboard, ChevronDown, ChevronUp, Server, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern"; // Import the new component

export function ClientDashboard() {
  const [showStrategies, setShowStrategies] = useState(false);

  return (
    // Added relative and z-0 to ensure background stacking works correctly
    <div className="relative w-full min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300 overflow-hidden">
      
      {/* --- BACKGROUND STACK --- */}
      
      {/* 1. Ambient Gradient Orbs (Deepest Layer) */}
      <div className="fixed top-0 left-1/4 w-[1000px] h-[500px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px] -z-20 pointer-events-none mix-blend-multiply dark:mix-blend-normal" />
      <div className="fixed bottom-0 right-1/4 w-[1000px] h-[500px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[120px] -z-20 pointer-events-none mix-blend-multiply dark:mix-blend-normal" />
      
      {/* 2. Interactive Ripple Grid (Middle Layer) */}
      <div className="fixed inset-0 z-0">
        <InteractiveGridPattern className="w-full h-full opacity-80" />
      </div>

      {/* --- CONTENT LAYER (z-10) --- */}
      {/* UPDATED: Changed padding to px-2 on mobile for wider containers and increased max-width */}
      <div className="relative z-10 max-w-7xl mx-auto px-0 py-6 md:p-8 space-y-10 pointer-events-none"> 
        {/* Note: pointer-events-none on container allows clicks to pass through to the canvas background 
            IF the elements inside don't catch them. 
            However, we need buttons/forms to work. 
            So we set pointer-events-auto on the children elements.
        */}
        
        {/* Dashboard Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8 pointer-events-auto px-2 md:px-0">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold tracking-wide text-green-700 dark:text-green-500 uppercase">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                System Online
              </div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-muted border border-border text-[10px] font-medium text-muted-foreground">
                 v2.4.0-stable
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              NEVODEX AI <span className="text-muted-foreground font-light">Studio</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
              Institutional-grade chart analysis powered by autonomous AI agents.
            </p>
          </div>
          
          {/* Header Actions & Stats */}
          <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
             <div className="hidden lg:flex gap-8 items-center border-r border-border pr-8">
                 <div className="text-right space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Inference Speed</p>
                    <p className="text-xl font-mono text-foreground flex items-center justify-end gap-2">
                       <Zap className="w-4 h-4 text-amber-500" /> 140ms
                    </p>
                 </div>
                 <div className="text-right space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Network Status</p>
                    <p className="text-xl font-mono text-foreground flex items-center justify-end gap-2">
                       <Activity className="w-4 h-4 text-green-600 dark:text-green-500" /> Stable
                    </p>
                 </div>
             </div>
          </div>
        </header>

        {/* Main Content Stack */}
        {/* UPDATED: Increased gap on mobile to gap-24 */}
        <div className="flex flex-col gap-10 md:gap-12 pointer-events-auto">
          
          {/* 1. The Engine */}
          <div className="w-full relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-[2.5rem] blur-xl opacity-0 dark:opacity-30 transition duration-1000"></div>
             <div className="relative">
                <ImageUploadForm />
             </div>
          </div>

          {/* Toggle Button */}
          <div className="flex justify-center">
            <Button 
                variant="outline" 
                size="lg"
                onClick={() => setShowStrategies(!showStrategies)}
                className="rounded-full px-8 h-12 gap-2 shadow-sm hover:shadow-md border-input bg-background text-foreground transition-all"
             >
                <LayoutDashboard className="w-4 h-4 text-primary" />
                {showStrategies ? "Hide Neural Models" : "View Neural Models"}
                {showStrategies ? <ChevronUp className="w-4 h-4 ml-1 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 ml-1 text-muted-foreground" />}
            </Button>
          </div>

          <div className="flex flex-col gap-10 md:gap-12 pointer-events-auto"> </div>



          {/* 2. Neural Models Section */}
          {showStrategies && (
            <div className="w-full animate-in slide-in-from-top-10 fade-in duration-700 ease-out">
              <div className="space-y-6 bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                             <Cpu className="w-6 h-6" />
                          </div>
                          <div>
                              <h3 className="text-2xl font-bold text-foreground">Active Strategies</h3>
                              <p className="text-sm text-muted-foreground">Select a model to fine-tune the analysis engine.</p>
                          </div>
                      </div>
                      <Badge variant="secondary" className="bg-secondary text-secondary-foreground border-border">
                          3 Active
                      </Badge>
                  </div>
                  <Separator className="bg-border" />
                  <div className="pt-2">
                     <TradingStrategyCards />
                  </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}