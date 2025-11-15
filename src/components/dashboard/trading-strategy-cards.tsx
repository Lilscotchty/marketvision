// src/components/dashboard/trading-strategy-cards.tsx
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image'; // <-- NEW: Import Image component

// Define the type for a trading strategy
interface TradingStrategy {
  id: string;
  title: string;
  description: string;
  imageUrl: string; // <-- CHANGED: from 'icon' to 'imageUrl'
  tag?: 'Advanced' | 'Beginner' | 'Intermediate';
  href: string; // URL for the card to link to
}

// Data for the trading strategies
const tradingStrategies: TradingStrategy[] = [
  {
    id: 'power_of_three',
    title: 'Power of Three (ICT)',
    description: 'Accumulation, Manipulation, and Distribution price cycle.',
    imageUrl: 'https://placehold.co/40x40/7c3aed/white?text=P3', // <-- CHANGED: Using placeholder image
    tag: 'Advanced',
    href: '#', // Placeholder link
  },
  {
    id: 'first_candle',
    title: 'First Candle Strategy',
    description: "Using the session's first candle to determine bias.",
    imageUrl: 'https://placehold.co/40x40/1e40af/white?text=F1', // <-- CHANGED: Using placeholder image
    tag: 'Beginner',
    href: '#', // Placeholder link
  },
  {
    id: 'sniper_entry',
    title: 'Sniper Entry',
    description: 'Precision entries using confluence on lower timeframes.',
    imageUrl: 'https://placehold.co/40x40/b91c1c/white?text=SE', // <-- CHANGED: Using placeholder image
    tag: 'Advanced',
    href: '#', // Placeholder link
  },
  {
    id: 'liquidity_grab',
    title: 'Liquidity Grab (SMC)',
    description: 'Trading against liquidity sweeps at key price levels.',
    imageUrl: 'https://placehold.co/40x40/16a34a/white?text=LG', // <-- CHANGED: Using placeholder image
    tag: 'Intermediate',
    href: '#', // Placeholder link
  },
  {
    id: 'trend_following',
    title: 'Trend Following',
    description: 'Entering trades in the direction of the established market trend.',
    imageUrl: 'https://placehold.co/40x40/0891b2/white?text=TF', // <-- CHANGED: Using placeholder image
    tag: 'Beginner',
    href: '#', // Placeholder link
  },
  {
    id: 'breakout_trading',
    title: 'Breakout Trading',
    description: 'Capitalizing on price after breaking support or resistance.',
    imageUrl: 'https://placehold.co/40x40/d97706/white?text=BT', // <-- CHANGED: Using placeholder image
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
                  {/* --- MODIFIED: Replaced icon with Image component --- */}
                  <Image
                    src={strategy.imageUrl}
                    alt={strategy.title}
                    width={40}
                    height={40}
                    className="rounded-full" // <-- Makes it circular
                  />
                  {/* ---------------------------------------------------- */}
                  <CardTitle className="text-lg font-semibold">
                    {strategy.title}
                  </CardTitle>
                </div>
                {strategy.tag && (
                  <Badge
                    variant={
                      strategy.tag === 'Advanced'
                        ? 'destructive'
                        : strategy.tag === 'Beginner'
                        ? 'secondary'
                        : 'default'
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
