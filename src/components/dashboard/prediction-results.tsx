
"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, CandlestickChart, BarChart2, Lightbulb, Zap, Workflow, Layers3, Info, ThumbsUp, ThumbsDown, Target, Activity, BookOpen, Compass } from "lucide-react";
import type { PredictionOutput, AnalysisOutput } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label"; // Import the Label component


interface PredictionResultsProps {
  prediction: PredictionOutput;
  analysis: AnalysisOutput;
  imagePreviewUrl?: string;
}

const MarketDirectionIcon = ({ direction }: { direction: PredictionOutput['marketDirection'] }) => {
  switch (direction) {
    case 'UP':
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    case 'DOWN':
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    case 'NEUTRAL':
      return <Minus className="h-5 w-5 text-yellow-500" />;
    default:
      return null;
  }
};

export function PredictionResults({ prediction, analysis, imagePreviewUrl }: PredictionResultsProps) {
  const { toast } = useToast();

  const handleFeedback = (feedbackType: 'positive' | 'negative') => {
    toast({
      title: "Feedback Received",
      description: "Thank you for your input!",
      duration: 3000, 
    });
  };

  const dailyBiasReasoning = analysis.dailyBiasReasoning;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {imagePreviewUrl && (
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <CandlestickChart className="text-accent" /> Analyzed Chart
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-6 bg-muted/20 rounded-b-lg">
            <Image
              src={imagePreviewUrl}
              alt="Analyzed candlestick chart"
              width={600}
              height={400}
              className="rounded-md object-contain max-h-[400px]"
              data-ai-hint="chart graph"
            />
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
             <BarChart2 className="text-accent"/> Market Prediction
          </CardTitle>
          <CardDescription>Generated insights based on the analysis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Market Direction</Label>
            <div className="flex items-center gap-2 mt-1">
              <MarketDirectionIcon direction={prediction.marketDirection} />
              <Badge variant={
                prediction.marketDirection === 'UP' ? 'default' : 
                prediction.marketDirection === 'DOWN' ? 'destructive' : 'secondary'
              } className={
                prediction.marketDirection === 'UP' ? 'bg-green-600 hover:bg-green-700' :
                prediction.marketDirection === 'DOWN' ? 'bg-red-600 hover:bg-red-600' :
                'bg-yellow-500 hover:bg-yellow-600'
              }>
                {prediction.marketDirection}
              </Badge>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Price Target</Label>
            <p className="text-lg font-semibold text-foreground">{prediction.priceTarget.toLocaleString()}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Stop-Loss Level</Label>
            <p className="text-lg font-semibold text-foreground">{prediction.stopLossLevel.toLocaleString()}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Confidence ({Math.round(prediction.confidenceLevel * 100)}%)</Label>
            <Progress value={prediction.confidenceLevel * 100} className="w-full mt-1 [&>div]:bg-accent" />
          </div>
           <div>
            <Label className="text-sm font-medium">Rationale</Label>
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{prediction.rationale}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <Lightbulb className="text-accent"/> Chart Analysis
          </CardTitle>
          <CardDescription>Key findings from the chart image.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Trend</Label>
            <p className="text-lg font-semibold text-foreground">{analysis.trend}</p>
          </div>

          {analysis.inferredDailyBias && (
            <div>
              <Label className="text-sm font-medium flex items-center gap-1"><Compass className="h-4 w-4 text-accent" /> Inferred Daily Bias</Label>
              <p className="text-lg font-semibold text-foreground">{analysis.inferredDailyBias}</p>
            </div>
          )}

          {(dailyBiasReasoning?.drawOnLiquidityAnalysis || dailyBiasReasoning?.timeBasedLiquidityAnalysis || dailyBiasReasoning?.ltfConfirmationOutlook || dailyBiasReasoning?.openingPriceConfluence) && (
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center gap-1"><BookOpen className="h-4 w-4 text-accent"/> Daily Bias Reasoning</Label>
              <Accordion type="single" collapsible className="w-full">
                {dailyBiasReasoning.drawOnLiquidityAnalysis && (
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xs hover:no-underline">
                      <div className="flex items-center gap-1"><Target className="h-3 w-3" /> Draw on Liquidity</div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs p-2 border-l-2 border-accent ml-2 pl-3">
                      {dailyBiasReasoning.drawOnLiquidityAnalysis}
                    </AccordionContent>
                  </AccordionItem>
                )}
                {dailyBiasReasoning.timeBasedLiquidityAnalysis && (
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-xs hover:no-underline">
                       <div className="flex items-center gap-1"><Activity className="h-3 w-3" /> Time-Based Liquidity</div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs p-2 border-l-2 border-accent ml-2 pl-3">
                      {dailyBiasReasoning.timeBasedLiquidityAnalysis}
                    </AccordionContent>
                  </AccordionItem>
                )}
                {dailyBiasReasoning.ltfConfirmationOutlook && (
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-xs hover:no-underline">
                       <div className="flex items-center gap-1"><Layers3 className="h-3 w-3" /> LTF Confirmation Outlook</div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs p-2 border-l-2 border-accent ml-2 pl-3">
                      {dailyBiasReasoning.ltfConfirmationOutlook}
                    </AccordionContent>
                  </AccordionItem>
                )}
                 {dailyBiasReasoning.openingPriceConfluence && (
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-xs hover:no-underline">
                       <div className="flex items-center gap-1"><Info className="h-3 w-3" /> Opening Price Confluence</div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs p-2 border-l-2 border-accent ml-2 pl-3">
                      {dailyBiasReasoning.openingPriceConfluence}
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">Patterns</Label>
            {analysis.patterns && analysis.patterns.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {analysis.patterns.map((pattern, index) => (
                  <Badge key={index} variant="secondary">{pattern}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">No patterns identified.</p>
            )}
          </div>
           {analysis.ictElements && analysis.ictElements.length > 0 && (
            <div>
              <Label className="text-sm font-medium flex items-center gap-1"><Zap className="h-4 w-4 text-accent" /> ICT Elements</Label>
              <ul className="mt-2 list-none space-y-2">
                {analysis.ictElements.map((element, index) => (
                  <li key={index} className="p-2 border rounded-md bg-muted/30 text-xs">
                    <strong className="text-accent">{element.type}:</strong>
                    <p className="text-muted-foreground mt-0.5">{element.location_description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {analysis.marketStructureAnalysis && (
            <div>
              <Label className="text-sm font-medium flex items-center gap-1"><Workflow className="h-4 w-4 text-accent" /> Market Structure</Label>
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap p-2 border rounded-md bg-muted/30">
                {analysis.marketStructureAnalysis}
              </p>
            </div>
          )}
          {analysis.potentialAMDCycle && (analysis.potentialAMDCycle.phase || analysis.potentialAMDCycle.reasoning) && (
            <div>
              <Label className="text-sm font-medium flex items-center gap-1">
                <Layers3 className="h-4 w-4 text-accent" /> AMD Cycle
              </Label>
              <div className="mt-1 p-3 border rounded-md bg-muted/30 space-y-1 text-xs">
                {analysis.potentialAMDCycle.phase && (
                    <p>
                        <strong className="text-foreground">Phase:</strong> {analysis.potentialAMDCycle.phase}
                    </p>
                )}
                {analysis.potentialAMDCycle.reasoning && (
                    <p className="text-muted-foreground">
                        <Info className="inline h-3 w-3 mr-1" /> {analysis.potentialAMDCycle.reasoning}
                    </p>
                )}
                {(analysis.potentialAMDCycle.phase === "Unclear" && !analysis.potentialAMDCycle.reasoning) && (
                    <p className="text-muted-foreground">No clear AMD cycle phase apparent.</p>
                )}
              </div>
            </div>
          )}
          <div>
            <Label className="text-sm font-medium">Summary</Label>
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{analysis.summary}</p>
          </div>
          <div className="mt-6 pt-4 border-t">
            <Label className="text-sm font-medium text-muted-foreground">Helpful?</Label>
            <div className="flex space-x-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => handleFeedback('positive')}>
                <ThumbsUp className="mr-2 h-4 w-4" /> Yes
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleFeedback('negative')}>
                <ThumbsDown className="mr-2 h-4 w-4" /> No
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
