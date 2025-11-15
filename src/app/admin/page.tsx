
// src/app/admin/page.tsx
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
import AdminClient from "./admin-client"; // We will create this client component
import type { UserManagementProfile, Role } from "@/types";

// This function fetches all stats in parallel
async function getAdminData() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  // 1. Get the current user and check their role
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Protect the page at the server level
  if (profile?.role !== "Developer" && profile?.role !== "Owner") {
    redirect("/");
  }

  const isOwner = profile.role === "Owner";

  // 2. Fetch all stats at the same time
  const [userCountResult, subscriberCountResult, analysisCountResult, profilesResult] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "active"), // <--!! UPDATE THIS to your column
      supabase.from("analyses").select("*", { count: "exact", head: true }), // <--!! UPDATE THIS to your table
      supabase.from("profiles").select("id, email, role, subscription_status"), // Fetch all users
    ]);

  // 3. Format profiles data for the client
  const managedUsers: UserManagementProfile[] = profilesResult.data?.map(p => ({
    userId: p.id,
    email: p.email,
    // This logic supports your 'role' column being just TEXT
    // If you change 'role' to TEXT[], you can just use p.role
    roles: p.role ? [p.role as Role] : ['User'], 
    hasActiveSubscription: p.subscription_status === 'active', // <--!! UPDATE THIS
    chartAnalysisTrialPoints: 0, // You would fetch this too
  })) ?? [];
  
  // 4. Return the data
  return {
    totalUsers: userCountResult.count ?? 0,
    totalSubscribers: subscriberCountResult.count ?? 0,
    totalAnalyses: analysisCountResult.count ?? 0,
    managedUsers,
    isOwner,
  };
}

// The Admin Page is now an Async Server Component
export default async function AdminPage() {
  const {
    totalUsers,
    totalSubscribers,
    totalAnalyses,
    managedUsers,
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Users Card */}
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

          {/* Total Subscribers Card */}
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

          {/* Total Analyses Card */}
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

        {/* Pass the server-fetched data to the Client Component */}
        <AdminClient
          initialManagedUsers={managedUsers}
          isOwner={isOwner}
        />
      </div>
    </main>
  );
}
