
// src/components/dashboard/trading-strategy-cards.tsx
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent, // Using CardContent for the description
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Zap, // Power of Three
  CandlestickChart, // First Candle Strategy
  Target, // Sniper Entry
  Handshake, // Liquidity Grab
  TrendingUp, // Trend Following
  LineChart, // Breakout Trading
} from 'lucide-react';
import Link from 'next/link'; // Import Link

// Define the type for a trading strategy
interface TradingStrategy {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  tag?: 'Advanced' | 'Beginner' | 'Intermediate';
  href: string; // URL for the card to link to
}

// Data for the trading strategies
const tradingStrategies: TradingStrategy[] = [
  {
    id: 'power_of_three',
    title: 'Power of Three (ICT)',
    description: 'Accumulation, Manipulation, and Distribution price cycle.',
    icon: Zap,
    tag: 'Advanced',
    href: '#', // Placeholder link
  },
  {
    id: 'first_candle',
    title: 'First Candle Strategy',
    description: "Using the session's first candle to determine bias.",
    icon: CandlestickChart,
    tag: 'Beginner',
    href: '#', // Placeholder link
  },
  {
    id: 'sniper_entry',
    title: 'Sniper Entry',
    description: 'Precision entries using confluence on lower timeframes.',
    icon: Target,
    tag: 'Advanced',
    href: '#', // Placeholder link
  },
  {
    id: 'liquidity_grab',
    title: 'Liquidity Grab (SMC)',
    description: 'Trading against liquidity sweeps at key price levels.',
    icon: Handshake,
    tag: 'Intermediate',
    href: '#', // Placeholder link
  },
  {
    id: 'trend_following',
    title: 'Trend Following',
    description: 'Entering trades in the direction of the established market trend.',
    icon: TrendingUp,
    tag: 'Beginner',
    href: '#', // Placeholder link
  },
  {
    id: 'breakout_trading',
    title: 'Breakout Trading',
    description: 'Capitalizing on price after breaking support or resistance.',
    icon: LineChart,
    tag: 'Intermediate',
    href: '#', // Placeholder link
  },
];

const TradingStrategyCards: React.FC = () => {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">
        Popular Trading Strategies
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tradingStrategies.map((strategy) => (
          <Link key={strategy.id} href={strategy.href} passHref>
            <Card className="h-full hover:border-primary/60 transition-colors duration-200 cursor-pointer flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                {/* This div creates the icon + title row */}
                <div className="flex items-center gap-3">
                  <strategy.icon className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg font-semibold">
                    {strategy.title}
                  </CardTitle>
                </div>
                {strategy.tag && (
                  <Badge
                    variant={
                      strategy.tag === 'Advanced' ? 'destructive' :
                      strategy.tag === 'Beginner' ? 'secondary' :
                      'default'
                    }
                    className="text-xs"
                  >
                    {strategy.tag}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  {strategy.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TradingStrategyCards;
