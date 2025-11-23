// src/components/dashboard/luxury-landing-page.tsx
"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Zap, Lock, TrendingUp } from "lucide-react";
import { Odometer } from "@/components/ui/odometer";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Hero3DScene } from "./hero-3d-scene";
import { cn } from "@/lib/utils";

// Mock Data
const chartData = Array.from({ length: 24 }).map((_, i) => ({
  height: Math.random() * 60 + 20,
  isGreen: Math.random() > 0.45,
}));

export function LuxuryLandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const yHero = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const yEngine = useTransform(scrollYProgress, [0.1, 0.4], [100, 0]);
  const yGrid = useTransform(scrollYProgress, [0.3, 0.6], [100, 0]);

  return (
    <div ref={containerRef} className="relative w-full bg-[#030303] text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-100 overflow-hidden">
      
      {/* BACKGROUND ATMOSPHERE (Blue/Cyan) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-950/20 rounded-full blur-[180px] opacity-60" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-900/20 rounded-full blur-[150px] opacity-60" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light" />
      </div>

      {/* 3D SCENE */}
      <div className="fixed inset-0 z-10 h-screen pointer-events-auto">
        <Hero3DScene />
      </div>

      {/* CONTENT */}
      <div className="relative z-20 pointer-events-none">
        
        {/* --- HERO SECTION --- */}
        <section className="relative min-h-screen flex flex-col justify-center items-center px-6">
          <motion.div style={{ y: yHero, opacity: opacityHero }} className="flex flex-col items-center text-center max-w-5xl mx-auto">
            
            {/* Badge (Cyan) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-8 pointer-events-auto inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-950/30 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] shadow-[0_0_20px_-5px_rgba(34,211,238,0.3)]"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Institutional Access
            </motion.div>

            {/* Main Title */}
            <h1 className="font-headline text-7xl md:text-[9rem] lg:text-[11rem] font-bold tracking-tighter text-white mb-6 leading-[0.85] mix-blend-overlay opacity-90">
              MARKET<br />VISION
            </h1>

            {/* Subtext */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="font-sans text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed mb-10 pointer-events-auto"
            >
              The first terminal designed for the <span className="text-cyan-200 font-medium">Post-Fiat Era</span>. 
              Visualize liquidity, predict order flow, and execute with algorithmic precision.
            </motion.p>

            {/* CTAs (Cyan/Blue Theme) */}
            <div className="flex flex-col sm:flex-row gap-6 pointer-events-auto">
              <Link href="/signup">
                <MagneticButton className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold px-10 py-5 shadow-[0_0_50px_-15px_rgba(34,211,238,0.5)] border-none min-w-[200px]">
                  Initialize
                </MagneticButton>
              </Link>
              <Link href="/live-analysis">
                <MagneticButton className="bg-black/40 border border-white/15 text-white hover:bg-white/10 backdrop-blur-xl min-w-[200px]">
                  Live Demo
                </MagneticButton>
              </Link>
            </div>

          </motion.div>

          {/* Bottom Ticker Tape */}
          <div className="absolute bottom-0 w-full border-t border-white/5 bg-black/20 backdrop-blur-sm pointer-events-auto">
            <div className="max-w-[1800px] mx-auto px-6 py-4 flex justify-between items-end">
                <div className="flex gap-12 font-mono text-xs">
                     <div className="group cursor-pointer">
                         <div className="text-slate-500 uppercase tracking-widest mb-1 group-hover:text-cyan-400 transition-colors">BTC/USD</div>
                         <div className="text-lg text-white flex gap-2 items-baseline">
                            $<Odometer value={98450.20} />
                            <span className="text-emerald-500 text-xs">▲ 2.4%</span>
                         </div>
                     </div>
                     {/* Other tickers... */}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                    System Optimal <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: THE ENGINE (Gradient Fade) --- */}
        <section className="relative py-32 px-6 pointer-events-auto">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030303]/80 to-[#030303] z-0" />

          <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <motion.div style={{ y: yEngine }} className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-6">
                  <div className="h-[1px] w-12 bg-cyan-500" />
                  <span className="text-cyan-500 font-mono text-xs uppercase tracking-widest">Core Architecture</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[0.9] text-white">
                PREDICTIVE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-600">ENGINEERING</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-md leading-relaxed mb-8">
                Our AI deconstructs market structure tick-by-tick.
              </p>
              
              <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                  <div>
                      <div className="text-3xl font-bold text-white mb-1"><Odometer value={94} />%</div>
                      <div className="text-xs text-slate-500 uppercase tracking-widest">Accuracy Rate</div>
                  </div>
                  <div>
                      <div className="text-3xl font-bold text-white mb-1"><Odometer value={12} />ms</div>
                      <div className="text-xs text-slate-500 uppercase tracking-widest">Execution Speed</div>
                  </div>
              </div>
            </motion.div>

            {/* Breathing Chart UI (Cyan Theme) */}
            <div className="lg:col-span-7">
               <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                  
                  <div className="relative bg-[#080808] border border-white/10 rounded-xl p-6 md:p-8 h-[450px] flex flex-col shadow-2xl overflow-hidden">
                     <div className="flex justify-between items-center border-b border-white/5 pb-6 mb-auto">
                        <div className="flex gap-2">
                            <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50" />
                            <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                            <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50" />
                        </div>
                        <div className="font-mono text-[10px] text-slate-500 flex gap-4">
                           <span>AI_MODEL_V4.2</span>
                           <span className="text-cyan-500">ONLINE</span>
                        </div>
                     </div>

                     {/* Candles */}
                     <div className="flex items-end justify-between h-64 gap-1 md:gap-2 px-2">
                        {chartData.map((candle, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: "5%" }}
                              whileInView={{ height: `${candle.height}%` }}
                              viewport={{ once: false }}
                              transition={{ delay: i * 0.03, duration: 0.8, type: "spring", stiffness: 100 }}
                              animate={{ 
                                  height: [`${candle.height}%`, `${candle.height + (Math.random() * 15 - 7)}%`, `${candle.height}%`],
                                  opacity: [0.7, 1, 0.7]
                              }}
                              // @ts-ignore
                              transition={{ repeat: Infinity, duration: 2 + Math.random() * 3, repeatType: "reverse" }}
                              className={cn(
                                  "w-full rounded-[1px] min-w-[6px] md:min-w-[12px] relative",
                                  candle.isGreen 
                                      ? "bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]" 
                                      : "bg-slate-800 shadow-none opacity-40"
                              )}
                            />
                        ))}
                     </div>

                     {/* Floating Signal */}
                     <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="absolute top-20 right-8 bg-black/80 border border-white/10 p-4 rounded-lg backdrop-blur-md shadow-2xl w-48"
                      >
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[10px] text-slate-400 uppercase tracking-wider">Signal</span>
                             <TrendingUp className="w-3 h-3 text-cyan-400" />
                          </div>
                          <div className="text-2xl font-bold text-white font-mono">$<Odometer value={42150.00} /></div>
                          <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-500 w-[85%]" />
                          </div>
                          <div className="mt-1 text-[10px] text-right text-cyan-400 font-mono">STRONG BUY</div>
                     </motion.div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: GRID --- */}
        <section className="relative py-32 px-6 bg-[#030303] pointer-events-auto">
           <div className="max-w-7xl mx-auto">
              <motion.div style={{ y: yGrid }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Feature 1 (Wide) */}
                  <div className="group md:col-span-2 bg-white/[0.02] border border-white/5 rounded-3xl p-10 hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-600/20 transition-all duration-500" />
                       <Zap className="w-10 h-10 text-cyan-400 mb-6" />
                       <h3 className="text-3xl font-bold mb-4 text-white">Zero-Latency Signals</h3>
                       <p className="text-slate-400 max-w-lg">
                          Processed on edge networks. By the time the pixel changes, the trade is verified.
                       </p>
                  </div>

                  {/* Feature 2 (Tall) */}
                  <div className="group md:row-span-2 bg-white/[0.02] border border-white/5 rounded-3xl p-10 hover:bg-white/[0.04] transition-all duration-500 flex flex-col justify-between relative overflow-hidden min-h-[500px]">
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                      
                      <div>
                        <Lock className="w-10 h-10 text-blue-400 mb-6" />
                        <h3 className="text-3xl font-bold mb-4 text-white">Fortress Security</h3>
                        <p className="text-slate-400">
                            Enterprise-grade encryption. We protect your edge.
                        </p>
                      </div>

                      {/* Abstract Visual */}
                      <div className="relative h-40 w-full mt-10 rounded-xl bg-black/50 overflow-hidden border border-white/5">
                          <div className="absolute inset-0 grid grid-cols-4 gap-1 opacity-30">
                             {Array.from({ length: 16 }).map((_, i) => (
                                 <div key={i} className="bg-cyan-500/20 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                             ))}
                          </div>
                      </div>
                  </div>

                  {/* Feature 3 (CTA Box) */}
                  <div className="md:col-span-2 bg-[#050505] border border-white/10 rounded-3xl p-0 flex flex-col md:flex-row overflow-hidden group">
                      <div className="p-10 flex-1 z-10">
                          <h3 className="text-3xl font-bold mb-4 text-white">Liquidity Analysis</h3>
                          <p className="text-slate-400 mb-8">
                              Visualize order blocks instantly.
                          </p>
                           <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-mono uppercase tracking-widest text-xs border-b border-cyan-400/30 pb-1 hover:border-cyan-400 transition-colors inline-block">
                              Start Analysis &rarr;
                           </Link>
                      </div>
                      {/* Animated Graphic */}
                      <div className="w-full md:w-2/5 bg-gradient-to-br from-slate-900 to-black relative min-h-[250px]">
                           <div className="absolute inset-0 flex items-center justify-center">
                               <div className="w-40 h-40 border border-cyan-500/10 rounded-full flex items-center justify-center animate-[spin_15s_linear_infinite]">
                                   <div className="w-28 h-28 border border-cyan-500/20 rounded-full border-t-cyan-500 border-r-transparent" />
                               </div>
                               <div className="absolute w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
                           </div>
                      </div>
                  </div>
              </motion.div>
           </div>
        </section>

        {/* --- FOOTER CTA --- */}
        <section className="relative py-48 px-6 text-center overflow-hidden pointer-events-auto bg-[#030303]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-cyan-900/10 blur-[120px] rounded-full" />
            
            <div className="relative z-10">
              <h2 className="text-5xl md:text-9xl font-bold tracking-tighter mb-12 text-white">
                READY TO <br /><span className="text-cyan-400 text-stroke">ASCEND?</span>
              </h2>
              <div className="flex justify-center">
                <Link href="/signup">
                    <MagneticButton className="bg-white text-black hover:bg-cyan-50 px-12 py-8 text-xl font-bold tracking-widest">
                        Get Access Now
                    </MagneticButton>
                </Link>
              </div>
            </div>
        </section>

      </div>
    </div>
  );
}