"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getNewsPosts } from '@/lib/actions';
import type { NewsPost } from '@/types';
import { format } from 'date-fns';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from '../ui/scroll-area';

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
  const [news, setNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNews() {
      setLoading(true);
      setError(null);
      const { data, error } = await getNewsPosts();
      if (error) {
        setError(error);
      } else if (data) {
        setNews(data);
      }
      setLoading(false);
    }
    loadNews();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
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
      {news.map((item) => (
        <Dialog key={item.id}>
          <Card className="flex flex-col hover:shadow-xl transition-shadow duration-300">
            {item.banner_image_url && (
                <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                    <Image
                    src={item.banner_image_url}
                    alt={item.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    />
                </div>
            )}
            <CardHeader>
              <CardTitle className="text-base font-bold leading-tight">{item.title}</CardTitle>
              <div className="text-xs text-muted-foreground pt-1">
                {/* UPDATED: Display only the date */}
                <span>{format(new Date(item.created_at), "MMM dd, yyyy")}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground line-clamp-4">{item.content}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <DialogTrigger asChild>
                <Button variant="default">
                    Read More <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </DialogTrigger>
              <Badge variant={
                item.sentiment === 'Bullish' ? 'default' :
                item.sentiment === 'Bearish' ? 'destructive' :
                'secondary'
              } className={
                item.sentiment === 'Bullish' ? 'bg-green-600 hover:bg-green-700' : ''
              }>
                {item.sentiment}
              </Badge>
            </CardFooter>
          </Card>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
                <DialogTitle className="text-2xl font-headline">{item.title}</DialogTitle>
                <div className="text-sm text-muted-foreground pt-1">
                    {/* UPDATED: Display only the date */}
                    <span>{format(new Date(item.created_at), "MMM dd, yyyy")}</span>
                </div>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
                {item.banner_image_url && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted my-4">
                        <Image
                            src={item.banner_image_url}
                            alt={item.title}
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                )}
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground">
                    {item.content}
                </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}