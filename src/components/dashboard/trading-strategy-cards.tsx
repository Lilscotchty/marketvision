// src/components/dashboard/trading-strategy-cards.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Zap, // Power of Three
  CandlestickChart, // First Candle Strategy
  Target, // Sniper Entry
  Handshake, // Liquidity Grab
  TrendingUp, // Trend Following
  LineChart, // Breakout Trading
  DollarSign, // Cost Averaging
  Clock, // Time-based strategies
} from 'lucide-react';

// Define the type for a trading strategy
interface TradingStrategy {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType; // Icon component from lucide-react
  tag?: string; // Optional tag like "Advanced", "Beginner"
}

// Data for the trading strategies
const tradingStrategies: TradingStrategy[] = [
  {
    id: 'power_of_three',
    title: 'Power of Three (ICT)',
    description: 'Accumulation, Manipulation, Distribution cycle observed daily.',
    icon: Zap,
    tag: 'Advanced',
  },
  {
    id: 'first_candle',
    title: 'First Candle Strategy',
    description: 'Trading based on the price action of the first candle of a session.',
    icon: CandlestickChart,
    tag: 'Beginner',
  },
  {
    id: 'sniper_entry',
    title: 'Sniper Entry',
    description: 'Precision entries using confluence of indicators on lower timeframes.',
    icon: Target,
    tag: 'Advanced',
  },
  {
    id: 'liquidity_grab',
    title: 'Liquidity Grab (SMC)',
    description: 'Identifying and trading against liquidity sweeps at key levels.',
    icon: Handshake,
    tag: 'Intermediate',
  },
  {
    id: 'trend_following',
    title: 'Trend Following',
    description: 'Entering trades in the direction of the established market trend.',
    icon: TrendingUp,
    tag: 'Beginner',
  },
  {
    id: 'breakout_trading',
    title: 'Breakout Trading',
    description: 'Capitalizing on price movements after breaking significant support/resistance.',
    icon: LineChart,
    tag: 'Intermediate',
  },
  {
    id: 'cost_averaging',
    title: 'Dollar-Cost Averaging (DCA)',
    description: 'Investing a fixed amount regularly, regardless of price fluctuations.',
    icon: DollarSign,
    tag: 'Long-term',
  },
  {
    id: 'session_break',
    title: 'Session Break Trading',
    description: 'Analyzing and trading the market behavior around major session openings/closings.',
    icon: Clock,
    tag: 'Intermediate',
  },
];

const TradingStrategyCards: React.FC = () => {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">
        Popular Trading Strategies
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tradingStrategies.map((strategy) => (
          <Card key={strategy.id} className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <strategy.icon className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg font-semibold">{strategy.title}</CardTitle>
              </div>
              {strategy.tag && (
                <Badge 
                  variant={
                    strategy.tag === 'Advanced' ? 'destructive' : 
                    strategy.tag === 'Beginner' ? 'secondary' : 
                    'default'
                  }
                  className="text-xs px-2 py-0.5"
                >
                  {strategy.tag}
                </Badge>
              )}
            </CardHeader>
            <CardDescription className="px-6 pb-4 text-sm text-muted-foreground">
              {strategy.description}
            </CardDescription>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default TradingStrategyCards;
