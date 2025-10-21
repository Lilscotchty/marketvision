
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { fetchMarketNews, type FetchNewsResult } from '@/lib/actions';
import type { MarketNewsItem } from '@/types';
import { format, parse } from 'date-fns';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';

const NewsCardSkeleton = () => (
  <Card className="flex flex-col animate-pulse">
    <div className="relative aspect-video w-full bg-muted overflow-hidden">
      <Skeleton className="h-full w-full" />
    </div>
    <CardHeader>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2 mt-2" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-8 w-24" />
    </CardFooter>
  </Card>
);

export function NewsFeed() {
  const [news, setNews] = useState<MarketNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNews() {
      setLoading(true);
      setError(null);
      const result: FetchNewsResult = await fetchMarketNews();
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setNews(result.data);
      }
      setLoading(false);
    }
    loadNews();
  }, []);

  const parseAndFormatDate = (timeString: string) => {
    try {
      // Format is YYYYMMDDTHHMMSS
      const parsedDate = parse(timeString, 'yyyyMMddHHmmss', new Date());
      return format(parsedDate, "MMM dd, yyyy 'at' hh:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <NewsCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Fetching News</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {news.map((item, index) => (
        <Card key={index} className="flex flex-col hover:shadow-xl transition-shadow duration-300">
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
            <Image
              src={item.banner_image || 'https://picsum.photos/seed/news' + index + '/400/225'}
              alt={item.title}
              fill
              style={{ objectFit: 'cover' }}
              data-ai-hint="news finance"
            />
          </div>
          <CardHeader>
            <CardTitle className="text-base font-bold leading-tight">{item.title}</CardTitle>
            <div className="text-xs text-muted-foreground pt-1">
              <span>{item.source}</span> &bull; <span>{parseAndFormatDate(item.time_published)}</span>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground line-clamp-4">{item.summary}</p>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <Button variant="default">
                Read More <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <Badge variant={
              item.overall_sentiment_label.includes('Bullish') ? 'default' :
              item.overall_sentiment_label.includes('Bearish') ? 'destructive' :
              'secondary'
            } className={
              item.overall_sentiment_label.includes('Bullish') ? 'bg-green-600 hover:bg-green-700' : ''
            }>
              {item.overall_sentiment_label}
            </Badge>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
