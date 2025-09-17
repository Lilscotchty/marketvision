
import { ImageUploadForm } from "@/components/dashboard/image-upload-form";
import { CandlestickChart } from "lucide-react";
import { PromotionalImageTray } from "@/components/dashboard/promotional-image-tray"; 

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-2 md:py-8">
      
      <main className="space-y-10 md:space-y-12">

        <section id="chart-analysis-tool">
          <header className="mb-6 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold flex items-center justify-center">
              <CandlestickChart className="mr-3 h-8 w-8 text-primary"/>
              Chart Analysis <span className="text-accent">Tool</span>
            </h2>
            <p className="mt-2 text-md md:text-lg text-muted-foreground max-w-lg mx-auto">
              Upload a chart image for AI-powered analysis.
            </p>
          </header>
          
          <div className="my-6">
            <PromotionalImageTray />
          </div>

          <ImageUploadForm />
        </section>

      </main>
    </div>
  );
}
