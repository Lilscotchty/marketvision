
"use client";

import React, { useMemo } from "react";
import type { HistoricalPrediction } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Sparkles, TrendingUp, TrendingDown, CalendarDays, Trophy } from "lucide-react";
import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';

interface PerformanceStatsProps {
  predictions: HistoricalPrediction[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background/80 border rounded-md shadow-lg backdrop-blur-sm">
        <p className="font-bold">{`${label}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export function PerformanceStats({ predictions }: PerformanceStatsProps) {
  const stats = useMemo(() => {
    const totalPredictions = predictions.length;
    const flaggedPredictions = predictions.filter(p => p.manualFlag);
    const successfulTrades = flaggedPredictions.filter(p => p.manualFlag === 'successful').length;
    const unsuccessfulTrades = flaggedPredictions.filter(p => p.manualFlag === 'unsuccessful').length;
    const totalFlagged = successfulTrades + unsuccessfulTrades;

    const winRate = totalFlagged > 0 ? (successfulTrades / totalFlagged) * 100 : 0;

    // Calculate daily streak
    const successfulTradeDates = [...new Set(
      predictions
        .filter(p => p.manualFlag === 'successful')
        .map(p => startOfDay(parseISO(p.date)).toISOString())
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    if (successfulTradeDates.length > 0) {
      const today = startOfDay(new Date());
      const firstDate = startOfDay(parseISO(successfulTradeDates[0]));

      if (differenceInCalendarDays(today, firstDate) <= 1) {
        currentStreak = 1;
        for (let i = 0; i < successfulTradeDates.length - 1; i++) {
          const currentDate = startOfDay(parseISO(successfulTradeDates[i]));
          const nextDate = startOfDay(parseISO(successfulTradeDates[i+1]));
          if (differenceInCalendarDays(currentDate, nextDate) === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }
    
    // Best performing asset
    const assetPerformance: { [asset: string]: { wins: number, total: number } } = {};
    flaggedPredictions.forEach(p => {
        const asset = p.asset || 'N/A';
        if (!assetPerformance[asset]) {
            assetPerformance[asset] = { wins: 0, total: 0 };
        }
        assetPerformance[asset].total++;
        if (p.manualFlag === 'successful') {
            assetPerformance[asset].wins++;
        }
    });

    let bestAsset = 'N/A';
    let bestWinRate = -1;

    for (const asset in assetPerformance) {
        const { wins, total } = assetPerformance[asset];
        const rate = (wins / total) * 100;
        if (rate > bestWinRate) {
            bestWinRate = rate;
            bestAsset = asset;
        }
    }


    return {
      totalPredictions,
      successfulTrades,
      unsuccessfulTrades,
      winRate,
      currentStreak,
      bestAsset,
      bestAssetWinRate: bestWinRate,
    };
  }, [predictions]);

  const chartData = [
    { name: 'Successful', count: stats.successfulTrades, fill: 'hsl(var(--primary))' },
    { name: 'Unsuccessful', count: stats.unsuccessfulTrades, fill: 'hsl(var(--destructive))' },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
            <Sparkles className="text-accent"/> Performance Overview
        </CardTitle>
        <CardDescription>
            Your analysis performance based on flagged predictions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {predictions.length === 0 ? (
           <div className="text-center py-8">
            <p className="text-muted-foreground">No predictions to analyze yet. Run some analyses and flag them!</p>
          </div>
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="lg:col-span-2">
                    <h3 className="text-sm font-semibold mb-2 text-center">Success Ratio</h3>
                    <div className="h-40 w-full">
                         <ResponsiveContainer>
                            <RechartsBarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                               <XAxis type="number" hide />
                               <YAxis type="category" dataKey="name" hide />
                               <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                               <Bar dataKey="count" radius={[4, 4, 4, 4]} barSize={30}/>
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                 <StatCard
                    icon={TrendingUp}
                    title="Win Rate"
                    value={`${stats.winRate.toFixed(1)}%`}
                    description={`${stats.successfulTrades} wins / ${stats.unsuccessfulTrades} losses`}
                    iconBgClass="bg-green-500/10"
                    iconColorClass="text-green-500"
                />

                <StatCard
                    icon={CalendarDays}
                    title="Consistency"
                    value={`${stats.currentStreak} Day Streak`}
                    description="Consecutive days with a successful trade."
                    iconBgClass="bg-blue-500/10"
                    iconColorClass="text-blue-500"
                />

                <StatCard
                    icon={Trophy}
                    title="Best Asset"
                    value={stats.bestAsset}
                    description={stats.bestAsset !== 'N/A' ? `${stats.bestAssetWinRate.toFixed(0)}% win rate` : 'No trades flagged yet'}
                    iconBgClass="bg-yellow-500/10"
                    iconColorClass="text-yellow-500"
                />

            </div>
        )}
      </CardContent>
    </Card>
  );
}


interface StatCardProps {
    icon: React.ElementType;
    title: string;
    value: string;
    description: string;
    iconBgClass: string;
    iconColorClass: string;
}

const StatCard = ({ icon: Icon, title, value, description, iconBgClass, iconColorClass }: StatCardProps) => (
    <div className="p-4 border rounded-lg bg-card flex flex-col justify-between">
        <div>
            <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div className={`p-1.5 rounded-md ${iconBgClass}`}>
                    <Icon className={`h-5 w-5 ${iconColorClass}`} />
                </div>
            </div>
            <p className="text-2xl font-bold font-headline mt-1">{value}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
    </div>
)

    