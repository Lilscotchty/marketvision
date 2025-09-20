
import { ClientDashboard } from "@/components/dashboard/client-dashboard";

export default function DashboardPage() {
  return (
    <main className="flex-1 items-start gap-4 p-2 sm:px-6 sm:py-0 md:gap-8 pb-16 md:pb-0">
      <div className="container mx-auto py-2 md:py-8">
        <ClientDashboard />
      </div>
    </main>
  );
}
