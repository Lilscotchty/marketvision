import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, CreditCard, BarChart, ShieldCheck } from "lucide-react";
import AdminClient from "./admin-client"; 
import type { UserManagementProfile, Role, NewsPost } from "@/types";
import { getNewsPosts } from "@/lib/actions";

async function getAdminData() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  
  const isHardcodedOwner = user.email === 'pb7552212@gmail.com';

  const { data: profile } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();

  const userRoles = profile?.roles || [];
  const isOwner = isHardcodedOwner || userRoles.includes("Owner");
  const isDeveloper = userRoles.includes("Developer");
  
  if (!isOwner && !isDeveloper) {
     redirect("/");
  }

  // 2. Fetch all stats and data at the same time
  const [userCountResult, subscriberCountResult, analysisCountResult, profilesResult, newsPostsResult] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("has_active_subscription", true),
      supabase.from("analyses").select("*", { count: "exact", head: true }),
      // UPDATED: Added 'chart_analysis_trial_points' to this query
      supabase.from("profiles").select("id, email, roles, has_active_subscription, chart_analysis_trial_points"), 
      getNewsPosts(),
    ]);

  // 3. Format profiles data for the client
  const managedUsers: UserManagementProfile[] = profilesResult.data?.map(p => ({
    userId: p.id,
    email: p.email,
    roles: p.roles || ['User'], 
    hasActiveSubscription: p.has_active_subscription, 
    // UPDATED: Now correctly reading from DB instead of hardcoded 0
    chartAnalysisTrialPoints: p.chart_analysis_trial_points ?? 0, 
  })) ?? [];
  
  const newsPosts: NewsPost[] = newsPostsResult.data || [];

  return {
    totalUsers: userCountResult.count ?? 0,
    totalSubscribers: subscriberCountResult.count ?? 0,
    totalAnalyses: analysisCountResult.count ?? 0,
    managedUsers,
    initialNewsPosts: newsPosts,
    isOwner,
  };
}

export default async function AdminPage() {
  const {
    totalUsers,
    totalSubscribers,
    totalAnalyses,
    managedUsers,
    initialNewsPosts,
    isOwner,
  } = await getAdminData();

  return (
    <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 pb-16 md:pb-0">
      <div className="container mx-auto py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-headline font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Application metrics and user management.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Total users in the database
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Subscribers
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSubscribers}</div>
              <p className="text-xs text-muted-foreground">
                Users with an active subscription
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Analyses Made
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAnalyses}</div>
              <p className="text-xs text-muted-foreground">
                Total analyses performed by users
              </p>
            </CardContent>
          </Card>
        </div>

        <AdminClient
          initialManagedUsers={managedUsers}
          initialNewsPosts={initialNewsPosts}
          isOwner={isOwner}
        />
      </div>
    </main>
  );
}
