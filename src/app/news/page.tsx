
"use client";

import React from 'react';
import { NewsFeed } from '@/components/news/news-feed';
import { Newspaper } from 'lucide-react';

export default function NewsPage() {
  return (
    <main className="flex-1 items-start gap-4 p-2 sm:px-6 sm:py-0 md:gap-8 pb-16 md:pb-0">
      <div className="container mx-auto py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-headline font-bold tracking-tight sm:text-5xl flex items-center justify-center">
            <Newspaper className="mr-3 h-10 w-10 text-accent" />
            Latest <span className="text-accent">News</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
            Stay updated with the latest financial news and analysis from our team.
          </p>
        </header>

        <NewsFeed />
      </div>
    </main>
  );
}
