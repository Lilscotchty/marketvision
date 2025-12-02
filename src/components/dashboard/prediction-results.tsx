"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart2,
  Lightbulb,
  Zap,
  Workflow,
  Layers3,
  Info,
  ThumbsUp,
  ThumbsDown,
  Target,
  Activity,
  BookOpen,
  Compass,
  ShieldCheck,
  Crosshair,
  PackageOpen,
  GalleryHorizontal,
  Maximize2,
  Eye
} from "lucide-react";
import type { PredictionOutput, AnalysisOutput, ICTElement } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { SniperEntryCard } from "./sniper-entry-card";
import { cn } from "@/lib/utils";

interface PredictionResultsProps {
  prediction: PredictionOutput;
  analysis: AnalysisOutput;
  imagePreviewUrl?: string; // Legacy
  imagePreviewUrls?: (string | null)[]; // New
}

export function PredictionResults({
  prediction,
  analysis,
  imagePreviewUrl,
  imagePreviewUrls,
}: PredictionResultsProps) {
  const { toast } = useToast();

  // Combine legacy and new image props
  const displayImages =
    imagePreviewUrls?.filter(Boolean) as string[] ||
    (imagePreviewUrl ? [imagePreviewUrl] : []);

  const handleFeedback = (feedbackType: "positive" | "negative") => {
    toast({
      title: "Feedback Received",
      description: "Thank you for improving our model!",
      duration: 3000,
    });
  };

  const dailyBiasReasoning = analysis.dailyBiasReasoning;
  const sniperEntry = analysis.sniperEntrySetup;

  // Determine Theme Colors based on Direction
  const isBullish = prediction.marketDirection === "UP";
  const isBearish = prediction.marketDirection === "DOWN";
  const isNeutral = prediction.marketDirection === "NEUTRAL";

  const themeColor = isBullish
    ? "text-green-500"
    : isBearish
    ? "text-red-500"
    : "text-yellow-500";

  const borderColor = isBullish
    ? "border-green-500/50"
    : isBearish
    ? "border-red-500/50"
    : "border-yellow-500/50";

  const bgGradient = isBullish
    ? "from-green-500/10 to-transparent"
    : isBearish
    ? "from-red-500/10 to-transparent"
    : "from-yellow-500/10 to-transparent";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- 1. HUD SECTION (Heads-Up Display) --- */}
      {/* Compact, high-impact comparison of direction vs targets */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Signal Card */}
        <Card className={cn("md:col-span-6 lg:col-span-5 border-l-4 relative overflow-hidden", borderColor)}>
          <div className={cn("absolute inset-0 bg-gradient-to-r opacity-50", bgGradient)} />
          <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
            <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">AI Signal</p>
                <div className="flex items-center gap-3">
                    {isBullish && <TrendingUp className="h-8 w-8 text-green-500" />}
                    {isBearish && <TrendingDown className="h-8 w-8 text-red-500" />}
                    {isNeutral && <Minus className="h-8 w-8 text-yellow-500" />}
                    <h2 className={cn("text-4xl font-headline font-bold", themeColor)}>
                        {prediction.marketDirection}
                    </h2>
                </div>
            </div>
            
            <div className="mt-6">
                 <div className="flex justify-between items-end mb-2">
                    <Label className="text-xs text-muted-foreground">Confidence Model</Label>
                    <span className="text-sm font-mono font-bold">{Math.round(prediction.confidenceLevel * 100)}%</span>
                 </div>
                 <Progress 
                    value={prediction.confidenceLevel * 100} 
                    className={cn("h-2", isBullish ? "[&>div]:bg-green-500" : isBearish ? "[&>div]:bg-red-500" : "[&>div]:bg-yellow-500")} 
                 />
            </div>
          </CardContent>
        </Card>

        {/* Key Levels (Target & Stop) */}
        <Card className="md:col-span-3 lg:col-span-3.5 flex flex-col justify-center border-l-2 border-green-500/30 bg-gradient-to-b from-green-500/5 to-transparent">
           <CardContent className="p-6 text-center">
               <div className="inline-flex p-2 rounded-full bg-green-500/10 mb-2">
                  <Target className="h-5 w-5 text-green-500" />
               </div>
               <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Take Profit</p>
               <p className="text-2xl font-mono font-bold text-foreground mt-1">
                 {prediction.priceTarget.toLocaleString()}
               </p>
           </CardContent>
        </Card>

        <Card className="md:col-span-3 lg:col-span-3.5 flex flex-col justify-center border-l-2 border-red-500/30 bg-gradient-to-b from-red-500/5 to-transparent">
           <CardContent className="p-6 text-center">
               <div className="inline-flex p-2 rounded-full bg-red-500/10 mb-2">
                  <ShieldCheck className="h-5 w-5 text-red-500" />
               </div>
               <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Stop Loss</p>
               <p className="text-2xl font-mono font-bold text-foreground mt-1">
                 {prediction.stopLossLevel.toLocaleString()}
               </p>
           </CardContent>
        </Card>
      </div>

      {/* --- 2. MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Deep Analysis Console */}
        <Card className="lg:col-span-2 flex flex-col shadow-md h-full">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="font-headline text-lg flex items-center gap-2">
               <Activity className="h-5 w-5 text-primary" /> Intelligence Console
            </CardTitle>
            <CardDescription>Deep dive into the AI's reasoning engine.</CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="overview" className="flex-1 flex flex-col">
            <div className="px-6 pt-4">
                <TabsList className="w-full justify-start h-10 p-1 bg-muted/50">
                    <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                    <TabsTrigger value="structure" className="text-xs">Structure & ICT</TabsTrigger>
                    <TabsTrigger value="bias" className="text-xs">Daily Bias</TabsTrigger>
                </TabsList>
            </div>
            
            <CardContent className="flex-1 pt-6">
                {/* TAB: OVERVIEW */}
                <TabsContent value="overview" className="mt-0 space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div>
                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 text-foreground">
                            <Compass className="h-4 w-4 text-primary" /> Executive Summary
                        </h4>
                        <div className="p-4 rounded-lg bg-muted/30 border text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {analysis.summary}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-semibold mb-2">Detected Trend</h4>
                            <div className="flex items-center gap-2 p-3 rounded border bg-background">
                                <BarChart2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{analysis.trend}</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-2">Rationale</h4>
                             <div className="p-3 rounded border bg-background text-xs text-muted-foreground h-full">
                                {prediction.rationale}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB: STRUCTURE & ICT */}
                <TabsContent value="structure" className="mt-0 space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                    {/* Patterns */}
                     <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" /> Chart Patterns
                        </h4>
                        {analysis.patterns && analysis.patterns.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {analysis.patterns.map((p, i) => (
                                    <Badge key={i} variant="outline" className="bg-yellow-500/5 hover:bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                                        {p}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No specific classic patterns identified.</p>
                        )}
                    </div>

                    {/* ICT Elements */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-blue-500" /> ICT Confluences
                        </h4>
                        {analysis.ictElements && analysis.ictElements.length > 0 ? (
                            <div className="grid gap-3">
                                {analysis.ictElements.map((el, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50 hover:bg-accent/5 transition-colors">
                                        <div className="mt-0.5 p-1 rounded bg-blue-500/10 text-blue-500">
                                            <Workflow className="h-3 w-3" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-foreground">{el.type}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{el.location_description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No specific ICT elements identified.</p>
                        )}
                    </div>
                    
                    {/* AMD Cycle */}
                    {analysis.potentialAMDCycle && (
                        <div className="p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5">
                            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 text-primary">
                                <Layers3 className="h-4 w-4" /> Market Phase (AMD)
                            </h4>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-foreground">{analysis.potentialAMDCycle.phase || "Unclear"}</span>
                            </div>
                            {analysis.potentialAMDCycle.reasoning && (
                                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-primary/10">
                                    {analysis.potentialAMDCycle.reasoning}
                                </p>
                            )}
                        </div>
                    )}
                </TabsContent>

                {/* TAB: DAILY BIAS */}
                <TabsContent value="bias" className="mt-0 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="flex items-center justify-between mb-4 p-4 rounded-lg bg-gradient-to-r from-background to-muted border">
                         <span className="text-sm font-medium text-muted-foreground">Inferred Daily Bias</span>
                         <Badge variant="secondary" className="text-sm px-3 py-1 font-bold">{analysis.inferredDailyBias || "Neutral"}</Badge>
                    </div>
                    
                    {dailyBiasReasoning && (
                        <Accordion type="single" collapsible className="w-full">
                             {/* Reusing existing accordion logic but styled cleaner */}
                             {[
                                { id: 'item-1', icon: Target, label: 'Draw on Liquidity', content: dailyBiasReasoning.drawOnLiquidityAnalysis },
                                { id: 'item-2', icon: Activity, label: 'Time-Based Liquidity', content: dailyBiasReasoning.timeBasedLiquidityAnalysis },
                                { id: 'item-3', icon: Layers3, label: 'LTF Confirmation', content: dailyBiasReasoning.ltfConfirmationOutlook },
                                { id: 'item-4', icon: Info, label: 'Opening Price Confluence', content: dailyBiasReasoning.openingPriceConfluence },
                             ].map((item) => (
                                item.content && (
                                    <AccordionItem key={item.id} value={item.id} className="border-b-muted">
                                        <AccordionTrigger className="hover:bg-muted/30 px-2 py-3 rounded text-xs font-medium">
                                            <div className="flex items-center gap-2">
                                                <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                                                {item.label}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">
                                            {item.content}
                                        </AccordionContent>
                                    </AccordionItem>
                                )
                             ))}
                        </Accordion>
                    )}
                </TabsContent>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t py-3 px-6">
                 <div className="w-full flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Was this analysis helpful?</span>
                    <div className="flex gap-2">
                         <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-green-500" onClick={() => handleFeedback('positive')}>
                             <ThumbsUp className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500" onClick={() => handleFeedback('negative')}>
                             <ThumbsDown className="h-4 w-4" />
                         </Button>
                    </div>
                 </div>
            </CardFooter>
          </Tabs>
        </Card>

        {/* RIGHT COLUMN: Visual Context & Sniipers */}
        <div className="space-y-6 h-full">
           
           {/* Chart Gallery */}
           {displayImages.length > 0 && (
              <Card className="overflow-hidden border-0 shadow-none bg-transparent">
                  <div className="space-y-4">
                    {displayImages.map((url, index) => (
                        <Dialog key={index}>
                           <DialogTrigger asChild>
                               <div className="group relative aspect-video w-full rounded-xl overflow-hidden border bg-muted cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                                  <Image
                                    src={url}
                                    alt={`Chart Analysis ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                      <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                                  </div>
                                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-mono text-white">
                                     CHART {index + 1}
                                  </div>
                               </div>
                           </DialogTrigger>
                           <DialogContent className="max-w-5xl w-[95vw] h-[80vh] p-0 bg-black border-zinc-800">
                              <DialogTitle className="sr-only">Full Chart View</DialogTitle>
                              <div className="relative w-full h-full">
                                <Image src={url} alt="Full Chart" fill className="object-contain" />
                              </div>
                           </DialogContent>
                        </Dialog>
                    ))}
                  </div>
              </Card>
           )}

           {/* Sniper Entry Card */}
           {sniperEntry && (
             <Card className="border-accent/40 bg-gradient-to-b from-accent/5 to-transparent shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
                <CardHeader className="pb-2">
                    <CardTitle className="font-headline text-base flex items-center gap-2 text-foreground">
                        <Crosshair className="h-5 w-5 text-accent animate-pulse" /> Sniper Setup
                    </CardTitle>
                    <CardDescription className="text-xs">High-precision intraday model.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                   {sniperEntry.tradeManagement?.entryPrice && (
                      <div className="p-3 bg-background/80 backdrop-blur border rounded-lg space-y-3 shadow-sm">
                          <div className="flex justify-between items-center border-b pb-2">
                             <span className="text-xs text-muted-foreground font-medium">ENTRY</span>
                             <span className="font-mono font-bold text-sm">{sniperEntry.tradeManagement.entryPrice}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-center">
                             <div>
                                <span className="text-[10px] text-red-500 font-bold block mb-1">STOP LOSS</span>
                                <span className="text-xs font-mono block bg-red-500/5 rounded py-1">{sniperEntry.tradeManagement.stopLossPrice}</span>
                             </div>
                             <div>
                                <span className="text-[10px] text-green-500 font-bold block mb-1">TAKE PROFIT</span>
                                <span className="text-xs font-mono block bg-green-500/5 rounded py-1">{sniperEntry.tradeManagement.takeProfitPrice}</span>
                             </div>
                          </div>
                      </div>
                   )}
                   
                   {/* Condensed Steps */}
                   <div className="space-y-2">
                      {sniperEntry.dailyBiasContext && (
                          <div className="text-xs text-muted-foreground">
                             <span className="font-bold text-foreground">HTF Context:</span> {sniperEntry.dailyBiasContext.fourHourAnalysis.substring(0, 80)}...
                          </div>
                      )}
                       {sniperEntry.entryMechanic && (
                          <div className="text-xs text-muted-foreground">
                             <span className="font-bold text-foreground">Trigger:</span> {sniperEntry.entryMechanic.fiveMinConfirmation.substring(0, 80)}...
                         </div>
                      )}
                   </div>
                </CardContent>
             </Card>
           )}

        </div>

      </div>
    </div>
  );
}
