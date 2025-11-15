// src/components/dashboard/trading-strategy-cards.tsx
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter, // Import CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react'; // Import the arrow

// Define the type for a trading strategy
interface TradingStrategy {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tag?: 'Advanced' | 'Beginner' | 'Intermediate';
  href: string;
}

// Data for the trading strategies, matching the screenshot
const tradingStrategies: TradingStrategy[] = [
  {
    id: 'power_of_three',
    title: 'Power of Three (ICT)',
    description: 'Accumulation, Manipulation, and Distribution price cycle.',
    imageUrl: 'https://placehold.co/40x40/111111/cyan?text=P3',
    tag: 'Advanced',
    href: '#',
  },
  {
    id: 'first_candle',
    title: 'First Candle Strategy',
    description: "Using the session's first candle to determine bias.",
    imageUrl: 'https://placehold.co/40x40/111111/cyan?text=F1',
    tag: 'Beginner',
    href: '#',
  },
  {
    id: 'sniper_entry',
    title: 'Sniper Entry',
    description: 'Precision entries using confluence on lower timeframes.',
    imageUrl: 'https://placehold.co/40x40/111111/cyan?text=SE',
    tag: 'Advanced',
    href: '#',
  },
  {
    id: 'liquidity_grab',
    title: 'Liquidity Grab (SMC)',
    description: 'Trading against liquidity sweeps at key price levels.',
    imageUrl: 'https://placehold.co/40x40/111111/cyan?text=LG',
    tag: 'Intermediate',
    href: '#',
  },
  {
    id: 'trend_following',
    title: 'Trend Following',
    description: 'Entering trades in the direction of the established market trend.',
    imageUrl: 'https://placehold.co/40x40/111111/cyan?text=TF',
    tag: 'Beginner',
    href: '#',
  },
  {
    id: 'breakout_trading',
    title: 'Breakout Trading',
    description: 'Capitalizing on price after breaking support or resistance.',
    imageUrl: 'https://placehold.co/40x40/111111/cyan?text=BT',
    tag: 'Intermediate',
    href: '#',
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
          <Link
            key={strategy.id}
            href={strategy.href}
            passHref
            className="group" // Add group for hover effect
          >
            <Card
              className="h-full flex flex-col rounded-lg 
                         bg-[#111111] border border-gray-800 
                         transition-all duration-200 
                         border-t-2 border-transparent 
                         group-hover:border-t-cyan-400" // Hover effect
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <Image
                    src={strategy.imageUrl}
                    alt={strategy.title}
                    width={40}
                    height={40}
                    className="rounded-full" // Circular image
                  />
                  <CardTitle className="text-lg font-semibold text-white">
                    {strategy.title}
                  </CardTitle>
                </div>
                {strategy.tag && (
                  <Badge
                    className="bg-gray-800 text-gray-300 text-xs 
                               hover:bg-gray-700" // Exact badge colors
                  >
                    {strategy.tag}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-400">
                  {strategy.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-4">
                <span className="text-sm font-medium text-cyan-400">
                  Learn more
                </span>
                <ArrowRight className="h-4 w-4 text-cyan-400" />
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TradingStrategyCards;
