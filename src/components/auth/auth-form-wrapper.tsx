
import React, { type ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BotIcon } from 'lucide-react';

interface AuthFormWrapperProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthFormWrapper({ title, description, children }: AuthFormWrapperProps) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
             <BotIcon className="h-8 w-8 text-accent" />
          </div>
          <CardTitle className="text-3xl font-headline font-bold">{title}</CardTitle>
          <CardDescription className="mt-2">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
