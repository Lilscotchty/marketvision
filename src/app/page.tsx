
"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart, Bot, BrainCircuit, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlowingStarsBackgroundCard } from '@/components/ui/glowing-stars';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import placeholderImages from '@/app/lib/placeholder-images.json';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="relative p-6 bg-card/50 rounded-lg shadow-lg border border-border/20 overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
     <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-primary/10 rounded-full opacity-50 blur-xl" />
    <div className="relative z-10">
      <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4 border border-primary/20 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);

const TestimonialCard = ({ name, role, testimonial, avatar }: { name: string, role: string, testimonial: string, avatar: string }) => (
  <motion.div 
    className="bg-card/50 p-6 rounded-lg shadow-lg border border-border/20"
    whileHover={{ scale: 1.03 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center mb-4">
      <Avatar className="h-12 w-12 mr-4">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
      </Avatar>
      <div>
        <h4 className="font-bold text-foreground">{name}</h4>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
    <p className="text-muted-foreground italic">"{testimonial}"</p>
  </motion.div>
);

export default function LandingPage() {
    const { user, loading } = useAuth();
  
  return (
    <div className="bg-background text-foreground min-h-screen">
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 animated-geometric-background opacity-70 z-0"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Trade Smarter, Not Harder.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Leverage institutional-grade AI to analyze market structures, identify ICT concepts, and gain a predictive edge.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg" className="shiny-button bg-primary hover:bg-primary/90 shadow-lg">
                <Link href={user ? "/live-analysis" : "/signup"}>
                  Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-card/50">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">
            Why <span className="text-accent">FinSight AI</span>?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Bot size={24} />}
              title="AI Chart Analysis"
              description="Upload candlestick charts and get instant, in-depth analysis of market trends, patterns, and structure."
            />
            <FeatureCard 
              icon={<BrainCircuit size={24} />}
              title="ICT Concept Recognition"
              description="Our AI is trained to identify complex Inner Circle Trader concepts like Order Blocks, FVGs, and Breaker Blocks."
            />
            <FeatureCard 
              icon={<Zap size={24} />}
              title="Predictive Insights"
              description="Gain a conceptual edge with AI-driven predictions on market direction, price targets, and stop-loss levels."
            />
          </div>
        </div>
      </section>
      
      {/* How it Works Section */}
       <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">
                Your Edge in <span className="text-accent">Three Steps</span>
            </h2>
            <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1 space-y-8">
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">1</div>
                        <div>
                            <h3 className="text-xl font-semibold">Upload Chart</h3>
                            <p className="text-muted-foreground">Drag & drop or select up to three candlestick chart images from different timeframes.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">2</div>
                        <div>
                            <h3 className="text-xl font-semibold">Analyze</h3>
                            <p className="text-muted-foreground">Our AI performs a multi-timeframe analysis, identifying key patterns and ICT concepts.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">3</div>
                        <div>
                            <h3 className="text-xl font-semibold">Gain Insight</h3>
                            <p className="text-muted-foreground">Receive a detailed breakdown, daily bias, and a conceptual trade prediction to inform your decisions.</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 w-full max-w-lg">
                    <GlowingStarsBackgroundCard>
                         <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg text-white">AI Analysis Output</h3>
                            <BarChart className="text-white/70"/>
                        </div>
                        <div className="flex flex-col mt-4">
                            <p className="font-bold text-4xl text-white">Bullish</p>
                            <p className="font-normal text-sm text-neutral-500">Confidence: 85%</p>
                        </div>
                    </GlowingStarsBackgroundCard>
                </div>
            </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">
            Trusted by <span className="text-accent">Traders</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              name="Alex T."
              role="Forex Trader"
              avatar={placeholderImages.testimonial1.src}
              testimonial="FinSight AI has revolutionized my workflow. The ICT analysis is spot-on and saves me hours of manual charting."
            />
            <TestimonialCard 
              name="Samantha K."
              role="Crypto Analyst"
              avatar={placeholderImages.testimonial2.src}
              testimonial="The multi-timeframe analysis is a game-changer. It helps me see the bigger picture and confirm my trade ideas with much higher confidence."
            />
            <TestimonialCard 
              name="David L."
              role="Day Trader"
              avatar={placeholderImages.testimonial3.src}
              testimonial="I was skeptical about AI in trading, but FinSight is different. It doesn't just give signals, it explains the 'why' behind them."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">Ready to Elevate Your Trading?</h2>
          <p className="text-lg text-muted-foreground mb-8">Join thousands of traders using AI to get a market edge.</p>
          <Button asChild size="lg" className="shiny-button bg-primary hover:bg-primary/90 shadow-xl">
             <Link href={user ? "/live-analysis" : "/signup"}>
                Start Your Free Trial Now <ArrowRight className="ml-2 h-5 w-5" />
             </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
