"use client";

import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, TrendingUp, Target, BarChart3, Activity, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the type for a trading strategy
interface TradingStrategy {
  id: string;
  title: string;
  description: string;
  // We can keep imageUrl for backward compatibility but mapped icons are more "app-like"
  imageUrl?: string; 
  icon?: React.ElementType;
  tag?: 'Advanced' | 'Beginner' | 'Intermediate';
  difficultyColor?: string;
  href: string;
}

// Enhanced Data with Icons and specific colors
const tradingStrategies: TradingStrategy[] = [
  {
    id: 'power_of_three',
    title: 'Power of Three (ICT)',
    description: 'Accumulation, Manipulation, and Distribution price cycle analysis.',
    icon: Layers,
    imageUrl: 'https://i.ibb.co/j9wjBTGL/IMG2.jpg',
    tag: 'Advanced',
    difficultyColor: 'text-red-400 bg-red-400/10 border-red-400/20',
    href: '#',
  },
  {
    id: 'first_candle',
    title: 'Opening Range Breakout',
    description: " leveraging the session's initial volatility to determine directional bias.",
    icon: Zap,
    imageUrl: 'https://i.ibb.co/j9wjBTGL/IMG2.jpg',
    tag: 'Beginner',
    difficultyColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    href: '#',
  },
  {
    id: 'sniper_entry',
    title: 'Sniper Entry Model',
    description: 'High-precision entries using lower timeframe confluence (1m/5m).',
    icon: Target,
    imageUrl: 'https://i.ibb.co/HDvPKgPk/IMG3.jpg',
    tag: 'Advanced',
    difficultyColor: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    href: '#',
  },
  {
    id: 'liquidity_grab',
    title: 'Liquidity Sweeps (SMC)',
    description: 'Trading reversals after aggressive stop-hunts at key levels.',
    icon: Activity,
    imageUrl: 'https://i.ibb.co/mCW6D5fn/IMG4.jpg',
    tag: 'Intermediate',
    difficultyColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    href: '#',
  },
  {
    id: 'trend_following',
    title: 'Trend Continuation',
    description: 'Algorithmic trend following using moving average ribbons.',
    icon: TrendingUp,
    imageUrl: 'https://i.ibb.co/23yC5QrR/ferdinand-stohr-NFs6d-RTBga-M-unsplash.jpg',
    tag: 'Beginner',
    difficultyColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    href: '#',
  },
  {
    id: 'breakout_trading',
    title: 'Volatility Breakout',
    description: 'Capitalizing on expansion phases after price compression.',
    icon: BarChart3,
    imageUrl: 'https://i.ibb.co/Gv8rmzb3/jr-korpa-9-Xngo-Ipxc-Eo-unsplash.jpg',
    tag: 'Intermediate',
    difficultyColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    href: '#',
  },
];

const TradingStrategyCards: React.FC = () => {
  return (
    <section className="w-full">
      {/* Removed the internal header "Popular Trading Strategies" to blend better with the dashboard container which already has a header */}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tradingStrategies.map((strategy) => (
          <Link
            key={strategy.id}
            href={strategy.href}
            className="group block h-full outline-none" 
          >
            <Card className="relative h-full flex flex-col overflow-hidden bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(var(--primary),0.3)] hover:-translate-y-1">
              
              {/* Subtle Gradient Background Effect on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-300">
                     {/* Prefer Icon if available, else Image */}
                     {strategy.icon ? (
                        <strategy.icon className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
                     ) : (
                        <Image
                            src={strategy.imageUrl || ''}
                            alt={strategy.title}
                            width={24}
                            height={24}
                            className="rounded-full"
                        />
                     )}
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                        {strategy.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow relative z-10">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {strategy.description}
                </p>
              </CardContent>
              
              <CardFooter className="flex justify-between items-center pt-4 border-t border-white/5 relative z-10 bg-black/10">
                {strategy.tag && (
                  <Badge
                    variant="outline"
                    className={cn(
                        "text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 border-0",
                        strategy.difficultyColor || "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {strategy.tag}
                  </Badge>
                )}
                
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  <span>Configure</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TradingStrategyCards;