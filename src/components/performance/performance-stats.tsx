
"use client";

import React, { useMemo } from "react";
import type { HistoricalPrediction } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, CartesianGrid } from 'recharts';
import { TrendingUp, CalendarDays, Info } from "lucide-react";
import { differenceInCalendarDays, parseISO, startOfDay, format } from 'date-fns';

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background/80 border rounded-md shadow-lg backdrop-blur-sm text-xs">
        <p className="font-bold">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function PerformanceStats({ predictions }: PerformanceStatsProps) {
  const { chartData, totalSuccessful, totalUnsuccessful, ...stats } = useMemo(() => {
    const flaggedPredictions = predictions.filter(p => p.manualFlag);
    const successfulTrades = flaggedPredictions.filter(p => p.manualFlag === 'successful').length;
    const unsuccessfulTrades = flaggedPredictions.filter(p => p.manualFlag === 'unsuccessful').length;
    const totalFlagged = successfulTrades + unsuccessfulTrades;
    const winRate = totalFlagged > 0 ? (successfulTrades / totalFlagged) * 100 : 0;
    
    // --- Chart Data Calculation ---
    const dailyStats: { [date: string]: { successful: number; unsuccessful: number; } } = {};
    
    flaggedPredictions.forEach(p => {
      const date = format(parseISO(p.date), 'dd MMM');
      if (!dailyStats[date]) {
        dailyStats[date] = { successful: 0, unsuccessful: 0 };
      }
      if (p.manualFlag === 'successful') {
        dailyStats[date].successful += 1;
      } else {
        dailyStats[date].unsuccessful += 1;
      }
    });

    const chartData = Object.entries(dailyStats)
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
    
    return {
      totalPredictions: predictions.length,
      successfulTrades,
      unsuccessfulTrades,
      winRate,
      currentStreak,
      chartData,
      totalSuccessful: successfulTrades,
      totalUnsuccessful: unsuccessfulTrades,
    };
  }, [predictions]);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="shadow-lg lg:col-span-3">
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center justify-between">
            Daily Trade Outcomes
             <div className="text-right">
                <p className="text-xl font-bold">
                  {totalSuccessful} Wins / {totalUnsuccessful} Losses
                </p>
                <p className={`text-xs font-normal ${stats.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                   {stats.winRate.toFixed(1)}% Win Rate
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
                             <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                             <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                             <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                             <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                             <Legend wrapperStyle={{fontSize: "12px"}}/>
                             <Bar dataKey="successful" name="Successful" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                             <Bar dataKey="unsuccessful" name="Unsuccessful" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                  </ResponsiveContainer>
              </div>
          )}
        </CardContent>
         <CardHeader className="pt-0">
            <div className="flex justify-end items-center text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  <span>Count of trades flagged by outcome.</span>
                </div>
            </div>
        </CardHeader>
      </Card>
      
      <div className="lg:col-span-2 flex flex-col gap-6">
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
    
