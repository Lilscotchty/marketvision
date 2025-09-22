
"use client";

import React, { useMemo } from "react";
import type { HistoricalPrediction } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, ReferenceLine, Legend } from 'recharts';
import { Sparkles, TrendingUp, TrendingDown, CalendarDays, Trophy, Info } from "lucide-react";
import { differenceInCalendarDays, parseISO, startOfDay, format } from 'date-fns';

interface PerformanceStatsProps {
  predictions: HistoricalPrediction[];
}

// Custom cell for conditional coloring
const CustomizedBar = (props: any) => {
  const { x, y, width, height, value } = props;
  const color = value > 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))';
  return <rect x={x} y={y} width={width} height={height} fill={color} />;
};


// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 bg-background/80 border rounded-md shadow-lg backdrop-blur-sm text-xs">
        <p className="font-bold">{label}</p>
        <p style={{ color: data.pnl > 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' }}>
          P/L: {data.pnl.toFixed(2)}
        </p>
        <p className="text-muted-foreground">Wins: {data.wins}</p>
        <p className="text-muted-foreground">Losses: {data.losses}</p>
      </div>
    );
  }
  return null;
};

export function PerformanceStats({ predictions }: PerformanceStatsProps) {
  const { chartData, totalPnl, totalProfit, totalLoss, ...stats } = useMemo(() => {
    const totalPredictions = predictions.length;
    const flaggedPredictions = predictions.filter(p => p.manualFlag);
    const successfulTrades = flaggedPredictions.filter(p => p.manualFlag === 'successful').length;
    const unsuccessfulTrades = flaggedPredictions.filter(p => p.manualFlag === 'unsuccessful').length;
    const totalFlagged = successfulTrades + unsuccessfulTrades;

    const winRate = totalFlagged > 0 ? (successfulTrades / totalFlagged) * 100 : 0;
    
    // --- Chart and P&L Data Calculation ---
    const dailyPnl: { [date: string]: { pnl: number; wins: number; losses: number; } } = {};
    let totalPnl = 0;
    let totalProfit = 0;
    let totalLoss = 0;

    flaggedPredictions.forEach(p => {
      const date = format(parseISO(p.date), 'dd MMM');
      if (!dailyPnl[date]) {
        dailyPnl[date] = { pnl: 0, wins: 0, losses: 0 };
      }
      
      // Simulate P&L: win = +1 unit, loss = -1 unit
      const pnlValue = p.manualFlag === 'successful' ? (10 * (p.prediction.confidenceLevel + 0.5)) : (-10 * (p.prediction.confidenceLevel + 0.5));
      dailyPnl[date].pnl += pnlValue;
      totalPnl += pnlValue;

      if (pnlValue > 0) {
        dailyPnl[date].wins += 1;
        totalProfit += pnlValue;
      } else {
        dailyPnl[date].losses += 1;
        totalLoss += pnlValue;
      }
    });

    const chartData = Object.entries(dailyPnl)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


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
      chartData,
      totalPnl,
      totalProfit,
      totalLoss,
    };
  }, [predictions]);

  const { winRate } = stats;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="shadow-lg lg:col-span-3">
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center justify-between">
            Conceptual Profit / Loss
             <div className="text-right">
                <p className={`text-xl font-bold ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalPnl.toFixed(2)}
                </p>
                <p className={`text-xs font-normal ${winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                   {winRate.toFixed(1)}% Win Rate
                </p>
             </div>
          </CardTitle>
          <CardDescription>
              Daily performance based on flagged predictions.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-0">
          {predictions.length === 0 ? (
             <div className="text-center py-8 h-64 flex flex-col justify-center items-center">
                <p className="text-muted-foreground">No predictions to analyze yet.</p>
             </div>
          ) : (
              <div className="h-64 w-full">
                   <ResponsiveContainer>
                        <RechartsBarChart 
                          data={chartData}
                           margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                        >
                             <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                             <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                             <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                             <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                             <Bar dataKey="pnl" shape={<CustomizedBar />} />
                        </RechartsBarChart>
                  </ResponsiveContainer>
              </div>
          )}
        </CardContent>
         <CardHeader className="pt-0">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span>Profit</span>
                        <span className="font-semibold text-foreground">+{totalProfit.toFixed(2)}</span>
                    </div>
                     <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-destructive" />
                        <span>Loss</span>
                        <span className="font-semibold text-foreground">{totalLoss.toFixed(2)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  <span>Conceptual P/L Units</span>
                </div>
            </div>
        </CardHeader>
      </Card>
      
      <div className="lg:col-span-2 space-y-6">
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
    </div>
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
    <div className="p-4 border rounded-lg bg-card flex flex-col justify-between h-full">
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
