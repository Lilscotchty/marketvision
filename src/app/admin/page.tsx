
"use client";

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, BarChart, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const AdminDashboardPage = () => {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && (!user || !userData?.isDeveloper)) {
      router.push('/');
    }
  }, [user, userData, loading, router]);

  if (loading || !user || !userData?.isDeveloper) {
    return (
      <main className="flex-1 p-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 pb-16 md:pb-0">
        <div className="container mx-auto py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-headline font-bold tracking-tight flex items-center gap-2">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                    Admin Dashboard
                </h1>
                <p className="text-lg text-muted-foreground">
                    Application metrics and management.
                </p>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">1,234</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+150</div>
                    <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">API Usage (Today)</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">5,732</div>
                    <p className="text-xs text-muted-foreground">+12% since last hour</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Analyses Performed</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+12,234</div>
                    <p className="text-xs text-muted-foreground">+19% from last month</p>
                </CardContent>
                </Card>
            </div>
             <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">User activity log will be displayed here.</p>
                </CardContent>
            </Card>
        </div>
    </main>
  );
};

export default AdminDashboardPage;
