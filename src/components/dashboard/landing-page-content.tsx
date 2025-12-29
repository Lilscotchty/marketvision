"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Check, 
  Star, 
  ShieldCheck, 
  Zap, 
  Globe, 
  BarChart3, 
  Cpu,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- BENTO CARD COMPONENT (Enhanced with Depth & Glassmorphism) ---
const BentoCard = ({
  title,
  description,
  className,
  children,
  label
}: {
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
  label?: string;
}) => (
  <div className={cn(
    "group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
    className
  )}>
    <div className="absolute top-0 right-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-blue-50/50 blur-3xl transition-colors group-hover:bg-blue-100/50" />
    
    <div className="space-y-4 z-10">
      {label && <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600/80">{label}</span>}
      <h3 className="font-bold text-2xl text-slate-900 tracking-tight leading-tight">{title}</h3>
      <p className="text-base text-slate-500 leading-relaxed max-w-md">{description}</p>
    </div>
    {children && <div className="mt-8 relative z-0">{children}</div>}
  </div>
);

// --- MOCK UI COMPONENTS (Enhanced with "Live" feel) ---
const MockTradeRow = ({ asset, type, result, prob }: { asset: string, type: string, result: string, prob: string }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-100/80 last:border-0 hover:bg-slate-50/50 px-2 rounded-lg transition-colors cursor-default">
    <div className="flex items-center gap-4">
      <div className={cn("w-1.5 h-10 rounded-full animate-pulse", type === 'Buy' ? 'bg-emerald-500' : 'bg-rose-500')} />
      <div>
        <div className="font-mono font-bold text-sm text-slate-900 flex items-center gap-2">
          {asset} <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-1.5 rounded">15M</span>
        </div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{type} Liquidity Grab</div>
      </div>
    </div>
    <div className="text-right">
      <div className={cn("font-mono font-bold text-sm", result.startsWith('+') ? 'text-emerald-600' : 'text-slate-600')}>
        {result}
      </div>
      <div className="text-[9px] font-bold text-blue-500/80">{prob} Prob.</div>
    </div>
  </div>
);

const ReviewCard = ({ name, role, quote }: { name: string, role: string, quote: string }) => (
  <div className="group p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:border-blue-100 hover:shadow-lg">
    <div className="flex gap-1 mb-6">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
    <p className="text-slate-700 text-lg leading-relaxed mb-8 italic">"{quote}"</p>
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-400">
        {name.charAt(0)}
      </div>
      <div>
        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{name}</div>
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">{role}</div>
      </div>
    </div>
  </div>
);

export function ReforgeLandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. HEADER */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
           <div className="flex items-center gap-2 font-black text-2xl tracking-tighter text-slate-900">
              NEVODEX<span className="text-blue-600">AI</span>
           </div>
           <div className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-widest text-slate-500">
              <Link href="#capabilities" className="hover:text-blue-600 transition-colors">Engine</Link>
              <Link href="#performance" className="hover:text-blue-600 transition-colors">Verification</Link>
              <Link href="#reviews" className="hover:text-blue-600 transition-colors">Testimonials</Link>
           </div>
           <div className="flex items-center gap-6">
              <Link href="/login" className="text-sm font-bold text-slate-900 hover:text-blue-600 hidden sm:block transition-colors underline-offset-4 hover:underline">Log in</Link>
              <Link href="/signup">
                <Button className="bg-slate-900 text-white hover:bg-blue-600 rounded-xl px-6 h-11 text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-slate-900/10">
                   Get Started
                </Button>
              </Link>
           </div>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* 2. HERO SECTION (Title Block) - Image Blended Here */}
        <section className="relative pt-24 pb-20 md:pt-36 md:pb-32 overflow-hidden bg-white">
          
          {/* --- IMAGE BLENDING CONTAINER --- */}
          <div className="absolute inset-0 z-0 pointer-events-none">
              {/* The Texture Image: Grayscale, low opacity, high contrast for texture */}
              <div 
                 className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.5] grayscale contrast-125"
                 style={{ backgroundImage: 'url(https://i.ibb.co/PvZkW8F8/IMG-20251127-195347.jpg)' }}
              />
              {/* A Radial Gradient Overlay: Ensures center text is perfectly readable, texture is stronger at edges */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-white/70 to-transparent" />
              
              {/* A Bottom Fade: Smooth transition to the next section */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
          </div>


          {/* Main Content (relative z-10 to sit on top of image) */}
          <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 shadow-sm">
                 <Zap className="w-3 h-3 fill-blue-600" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Institutional Engine v2.4</span>
              </div>
              
              <h1 className="mx-auto max-w-5xl text-6xl font-black tracking-tight text-slate-900 sm:text-7xl lg:text-8xl mb-8 leading-[1.05]">
                 Trade with the <br />
                 <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600">
                    Eyes of the Market.
                 </span>
              </h1>
              
              <p className="mx-auto max-w-2xl text-xl text-slate-500 leading-relaxed mb-12 font-medium">
                 The first AI-native terminal trained specifically on Market Structure, Liquidity Sweeps, and ICT Narrative. Stop guessing. Start validating.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
                 <Link href="/signup">
                    <Button size="lg" className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-2xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95">
                       Launch Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                 </Link>
                 <Link href="/about">
                    <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-lg bg-white/50 backdrop-blur-sm">
                       Our Methodology
                    </Button>
                 </Link>
              </div>

              {/* TRUST BAR */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto pt-10 border-t border-slate-200/60 relative">
                {/* Subtle glow behind trust bar */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
                {[
                  { label: "Daily Analysis", val: "1.2M+" },
                  { label: "Win Probability", val: "84.2%" },
                  { label: "Active Traders", val: "50k+" },
                  { label: "Verification", val: "On-Chain" }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-black text-slate-900 tracking-tighter">{stat.val}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
          </div>
        </section>

        {/* 3. CAPABILITIES (Bento Grid) */}
        <section id="capabilities" className="py-24 md:py-40 bg-slate-50/50 relative overflow-hidden border-t border-slate-100">
             {/* Background subtle grid pattern for this section onwards */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

           <div className="relative z-10 mx-auto max-w-7xl px-6">
              <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
                 <div className="max-w-2xl">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-8">
                       Precision-Engineered <br />Intelligence.
                    </h2>
                    <p className="text-xl text-slate-500 font-medium">
                       Most retail tools are lagging indicators. Nevodex analyzes the footprint of institutional orders before the move happens.
                    </p>
                 </div>
                 <div className="flex gap-4">
                   <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
                        <div className="text-xs font-bold text-slate-900">Secure Protocol</div>
                      </div>
                   </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                 
                 {/* Card 1: Computer Vision */}
                 <BentoCard 
                    label="Visual Recognition"
                    title="Computer Vision Engine" 
                    description="Drop any chart. Our neural network decodes SMT Divergence, Market Structure Breaks, and Change of Character in milliseconds."
                    className="md:col-span-8 bg-white border-blue-100/50"
                 >
                    <div className="mt-6 border border-slate-200/60 bg-slate-50/50 rounded-2xl p-8 relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-[shimmer_2s_infinite]" 
                            style={{ backgroundSize: '200% 100%' }} />
                       
                       <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-4">
                             <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <Cpu className="text-white w-8 h-8" />
                             </div>
                             <div>
                                <div className="h-4 w-32 bg-slate-200 rounded-full mb-2 animate-pulse" />
                                <div className="h-3 w-20 bg-slate-100 rounded-full" />
                             </div>
                          </div>
                          <Badge className="bg-blue-600 text-white border-0 py-1.5 px-4 rounded-lg font-bold">SMT DETECTED: 99.4%</Badge>
                       </div>
                       
                       <div className="grid grid-cols-4 gap-4">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-white rounded-xl border border-slate-100 flex items-end p-2 gap-1">
                               <div className="w-full bg-slate-100 rounded-sm" style={{ height: `${Math.random() * 100}%` }} />
                               <div className="w-full bg-blue-400 rounded-sm" style={{ height: `${Math.random() * 100}%` }} />
                            </div>
                          ))}
                       </div>
                    </div>
                 </BentoCard>

                 {/* Card 2: History Validation */}
                 <BentoCard 
                    label="Backtesting"
                    title="Live Validation" 
                    description="Real-time probability scoring based on 10+ years of institutional data."
                    className="md:col-span-4"
                 >
                    <div className="mt-4 space-y-1">
                       <MockTradeRow asset="BTC/USD" type="Buy" result="+12.4%" prob="94%" />
                       <MockTradeRow asset="ETH/USD" type="Sell" result="+8.1%" prob="89%" />
                       <MockTradeRow asset="SOL/USD" type="Buy" result="+15.3%" prob="91%" />
                    </div>
                 </BentoCard>

                 {/* Card 3: Sniper Models */}
                 <BentoCard 
                    label="The Strategy"
                    title="ICT Sniper Models" 
                    description="Automated detection of Fair Value Gaps (FVG) and Silver Bullet setups."
                    className="md:col-span-4"
                 >
                    <div className="mt-auto p-6 bg-slate-900 rounded-[1.5rem] text-white shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-20"><Globe className="w-12 h-12" /></div>
                       <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Setup</span>
                          </div>
                       </div>
                       <div className="font-mono text-3xl font-black mb-1 tracking-tighter">FVG ENTRY</div>
                       <div className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em]">1H Timeframe</div>
                    </div>
                 </BentoCard>

                 {/* Card 4: Daily Bias */}
                 <BentoCard 
                    label="The Narrative"
                    title="Daily Bias Framework" 
                    description="The most critical element of trading. We solve the 'where is price going' question every single morning."
                    className="md:col-span-8 bg-slate-900 text-white border-slate-800 shadow-2xl shadow-blue-900/10"
                 >
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                       <div className="p-6 rounded-[1.5rem] bg-white/5 border border-white/10 backdrop-blur-xl group-hover:border-blue-500/30 transition-colors">
                          <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-[0.2em]">Directional Bias</div>
                          <div className="text-2xl font-black text-emerald-400">BULLISH</div>
                       </div>
                       <div className="p-6 rounded-[1.5rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                          <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-[0.2em]">Draw on Liq.</div>
                          <div className="text-2xl font-black text-white">42.5k</div>
                       </div>
                       <div className="p-6 rounded-[1.5rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                          <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-[0.2em]">Model Conf.</div>
                          <div className="text-2xl font-black text-blue-400">94.8%</div>
                       </div>
                    </div>
                 </BentoCard>
              </div>
           </div>
        </section>

        {/* 4. PERFORMANCE SHOWCASE */}
        <section id="performance" className="py-32 md:py-48 bg-white">
           <div className="mx-auto max-w-7xl px-6">
              <div className="flex flex-col lg:flex-row gap-20 items-center">
                 <div className="lg:w-5/12 space-y-8 text-center lg:text-left">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900">Radical <br />Transparency.</h2>
                    <p className="text-xl text-slate-500 leading-relaxed font-medium">
                       Trading is a game of statistics, not luck. Every signal generated is stored on an immutable ledger for your audit.
                    </p>
                    
                    <div className="grid grid-cols-1 gap-4 pt-4">
                       {[
                         { title: "Timestamped Accuracy", icon: <Lock className="w-5 h-5" /> },
                         { title: "Risk-to-Reward Tracking", icon: <BarChart3 className="w-5 h-5" /> }
                       ].map((item, i) => (
                         <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 font-bold">
                              {item.icon}
                            </div>
                            <span className="font-bold text-slate-700">{item.title}</span>
                         </div>
                       ))}
                    </div>

                    <Link href="/performance" className="inline-block">
                        <Button size="lg" className="mt-4 bg-slate-900 text-white font-bold h-14 px-8 rounded-2xl hover:bg-blue-600 transition-all">
                           Explore Performance Ledger
                        </Button>
                    </Link>
                 </div>
                 
                 <div className="lg:w-7/12 w-full relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 blur-3xl opacity-10" />
                    <div className="relative bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="flex gap-1.5">
                                 <div className="w-3 h-3 rounded-full bg-rose-400" />
                                 <div className="w-3 h-3 rounded-full bg-amber-400" />
                                 <div className="w-3 h-3 rounded-full bg-emerald-400" />
                              </div>
                              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Live Execution Feed</span>
                           </div>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-left text-sm">
                              <thead>
                                 <tr className="border-b border-slate-100">
                                    <th className="px-8 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest">Asset Pair</th>
                                    <th className="px-8 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest">Signal</th>
                                    <th className="px-8 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest">Result</th>
                                    <th className="px-8 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">Verification</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                 {[
                                   { pair: "BTC/USD", signal: "LONG", res: "+2.4R", status: "Verified" },
                                   { pair: "EUR/JPY", signal: "SHORT", res: "+3.1R", status: "Verified" },
                                   { pair: "NQ1!", signal: "LONG", res: "+1.2R", status: "Live" },
                                   { pair: "XAU/USD", signal: "SHORT", res: "-1.0R", status: "Stopped" }
                                 ].map((row, i) => (
                                   <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                      <td className="px-8 py-6 font-mono font-bold text-slate-900">{row.pair}</td>
                                      <td className="px-8 py-6">
                                         <span className={cn(
                                           "px-3 py-1 rounded-full text-[10px] font-black tracking-widest",
                                           row.signal === 'LONG' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                         )}>{row.signal}</span>
                                      </td>
                                      <td className="px-8 py-6 font-mono font-black text-slate-900">{row.res}</td>
                                      <td className="px-8 py-6 text-right">
                                        <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold">{row.status}</Badge>
                                      </td>
                                   </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* 5. REVIEWS SECTION */}
        <section id="reviews" className="py-32 bg-slate-50/50">
           <div className="mx-auto max-w-7xl px-6">
              <div className="text-center mb-24">
                 <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-6">Built for Professionals.</h2>
                 <p className="text-xl text-slate-500 font-medium">Used by proprietary firms and hedge fund analysts globally.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <ReviewCard 
                    name="Marcus Chen"
                    role="Prop Firm Trader, London"
                    quote="The granularity of the daily bias analysis changed how I approach my morning routine. It's not just a signal; it's a structural breakdown."
                 />
                 <ReviewCard 
                    name="Sarah Williams"
                    role="Forex Analyst"
                    quote="Nevodex doesn't try to predict the future. It identifies liquidity. That's the difference. It highlights exactly where the stops are sitting."
                 />
                 <ReviewCard 
                    name="David Okonjo"
                    role="Crypto Swing Trader"
                    quote="The multi-timeframe alignment is key. Usually I have to flip between 4 charts. Nevodex does the correlation for me instantly."
                 />
              </div>
           </div>
        </section>

        {/* 6. CTA FOOTER */}
        <section className="relative py-40 bg-slate-900 overflow-hidden">
           <div className="absolute inset-0 z-0 opacity-20" 
                style={{ backgroundImage: `linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
           
           <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
              <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tighter leading-tight">
                 Own the Edge. <br />Join the <span className="text-blue-500">1%.</span>
              </h2>
              <p className="text-2xl text-slate-400 mb-14 leading-relaxed font-medium">
                 Start your 5-day full-access trial. <br />No commitment. Just performance.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                 <Link href="/signup">
                    <Button size="lg" className="h-16 px-14 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-black text-xl shadow-2xl shadow-blue-600/40">
                       Start Free Trial
                    </Button>
                 </Link>
                 <Link href="/contact">
                    <Button size="lg" variant="outline" className="h-16 px-14 rounded-2xl border-white/20 text-white hover:bg-white/10 font-black text-xl backdrop-blur-sm bg-transparent">
                       Talk to Sales
                    </Button>
                 </Link>
              </div>
              <p className="mt-16 text-xs font-bold text-slate-600 uppercase tracking-[0.3em]">
                 © 2025 NEVODEX AI • Institutional Intelligence Agency
              </p>
           </div>
        </section>

      </main>
    </div>
  );
}