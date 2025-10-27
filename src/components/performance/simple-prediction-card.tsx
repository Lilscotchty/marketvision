
"use client";

import React from 'react';
import type { HistoricalPrediction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface SimplePredictionCardProps {
  prediction: HistoricalPrediction;
  onFlag: (predictionId: string, flag: 'successful' | 'unsuccessful') => void;
  onDelete: (predictionId: string) => void;
}

const SimplePredictionCard = ({ prediction, onFlag, onDelete }: SimplePredictionCardProps) => {
  const { id, prediction: predData, asset, date, manualFlag } = prediction;
  const marketDirection = predData?.marketDirection || 'NEUTRAL';

  const DirectionInfo = {
    UP: { icon: TrendingUp, color: 'text-green-500', badge: 'default', badgeClass: 'bg-green-600 hover:bg-green-700' },
    DOWN: { icon: TrendingDown, color: 'text-red-500', badge: 'destructive' as const },
    NEUTRAL: { icon: Minus, color: 'text-yellow-500', badge: 'secondary' as const },
  };

  const { icon: Icon, color, badge, badgeClass } = DirectionInfo[marketDirection];

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold">{asset}</CardTitle>
        <div className="text-xs text-muted-foreground">
          {format(new Date(date), 'MMM dd, yyyy')}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${color}`} />
            <span className="font-semibold">{marketDirection}</span>
          </div>
          {manualFlag && (
            <Badge
              variant={manualFlag === 'successful' ? 'default' : 'destructive'}
              className={manualFlag === 'successful' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {manualFlag}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-0 pb-4 px-4">
        <Button
          variant={manualFlag === 'successful' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onFlag(id, 'successful')}
          title="Mark as successful"
        >
          <ThumbsUp className="h-4 w-4 text-green-500" />
        </Button>
        <Button
          variant={manualFlag === 'unsuccessful' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onFlag(id, 'unsuccessful')}
          title="Mark as unsuccessful"
        >
          <ThumbsDown className="h-4 w-4 text-red-500" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(id)}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SimplePredictionCard;
