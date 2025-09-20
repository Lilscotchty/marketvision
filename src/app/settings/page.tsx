
import { Settings as SettingsIcon } from "lucide-react"; // Renamed to avoid conflict
import { SettingsForm } from "@/components/settings/settings-form";

export default function SettingsPage() {
  return (
    <main className="flex-1 items-start gap-4 p-2 sm:px-6 sm:py-0 md:gap-8 pb-16 md:pb-0">
      <div className="container mx-auto py-8 space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-headline font-bold tracking-tight sm:text-5xl flex items-center justify-center">
            <SettingsIcon className="mr-3 h-10 w-10 text-accent"/>
            Application <span className="text-accent">Settings</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
            Manage account, appearance, and notifications.
          </p>
        </header>
        <div className="w-full">
          <SettingsForm />
        </div>
      </div>
    </main>
  );
}
