
"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import type { HistoricalPrediction, AnalysisOutput } from '@/types';
import { ThumbsUp, ThumbsDown, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '../ui/label';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { GalleryHorizontal, Lightbulb, Zap, Workflow, Layers3, Compass, BookOpen, Target, Activity, Info, ShieldCheck, Crosshair, PackageOpen } from "lucide-react";


interface SimplePredictionCardProps {
  prediction: HistoricalPrediction;
  onFlag: (predictionId: string, flag: 'successful' | 'unsuccessful') => void;
  onDelete: (predictionId: string) => void;
}

const SimplePredictionCard = ({ prediction, onFlag, onDelete }: SimplePredictionCardProps) => {
  const { id, asset, date, manualFlag, analysis } = prediction;
  const [open, setOpen] = useState(false);
  
  const dailyBiasReasoning = analysis?.dailyBiasReasoning;
  const sniperEntry = analysis?.sniperEntrySetup;
  const displayImages = prediction.imagePreviewUrls?.filter(Boolean) as string[] || (prediction.imagePreviewUrl ? [prediction.imagePreviewUrl] : []);


  return (
    <StyledWrapper>
      <div className="card">
        <div className="text">
          <span>{asset}</span>
          <p className="subtitle">{format(new Date(date), 'MMM dd, yyyy, hh:mm a')}</p>
          {manualFlag && (
            <span className={`manual-flag ${manualFlag}`}>
              {manualFlag}
            </span>
          )}
        </div>
        <div className="icons">
          <button className="btn" onClick={() => onFlag(id, 'successful')} title="Flag as Successful">
            <ThumbsUp className="svg-icon" />
          </button>
          <button className="btn" onClick={() => onFlag(id, 'unsuccessful')} title="Flag as Unsuccessful">
            <ThumbsDown className="svg-icon" />
          </button>
          <button className="btn" onClick={() => onDelete(id)} title="Delete">
            <Trash2 className="svg-icon" />
          </button>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="details-btn">
                    <Eye size={16} />
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Analysis for {asset} - {new Date(date).toLocaleString()}</DialogTitle>
                    <DialogDescription>Full AI-generated analysis details.</DialogDescription>
                </DialogHeader>
                 <ScrollArea className="h-[70vh] pr-4">
                    <div className="space-y-6 py-4">
                        {analysis ? (
                             <>
                               {displayImages.length > 0 && (
                                  <Card>
                                    <CardHeader>
                                      <Label className="font-headline text-md flex items-center gap-2">
                                        <GalleryHorizontal className="text-accent" /> Analyzed Charts
                                      </Label>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-b-lg">
                                      {displayImages.map((url, index) => (
                                        <div key={index} className="relative aspect-[4/3] rounded-md overflow-hidden border">
                                          <Image src={url} alt={`Analyzed chart ${index + 1}`} fill className="object-contain" />
                                        </div>
                                      ))}
                                    </CardContent>
                                  </Card>
                                )}
                              <Card>
                                <CardHeader>
                                    <Label className="font-headline text-md flex items-center gap-2">
                                        <Lightbulb className="text-accent"/> Chart Analysis
                                    </Label>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div><Label>Trend</Label><p className="text-md font-semibold">{analysis.trend}</p></div>
                                    {analysis.inferredDailyBias && (<div><Label className="flex items-center gap-1"><Compass className="h-4 w-4 text-accent" />Inferred Daily Bias</Label><p className="text-md font-semibold">{analysis.inferredDailyBias}</p></div>)}
                                    
                                     {(dailyBiasReasoning?.drawOnLiquidityAnalysis || dailyBiasReasoning?.timeBasedLiquidityAnalysis || dailyBiasReasoning?.ltfConfirmationOutlook || dailyBiasReasoning?.openingPriceConfluence) && (
                                        <div>
                                        <Label className="text-sm font-medium mb-2 flex items-center gap-1"><BookOpen className="h-4 w-4 text-accent"/> Daily Bias Reasoning</Label>
                                        <Accordion type="single" collapsible className="w-full">
                                            {dailyBiasReasoning.drawOnLiquidityAnalysis && (<AccordionItem value="item-1"><AccordionTrigger className="text-xs hover:no-underline"><div className="flex items-center gap-1"><Target className="h-3 w-3" /> Draw on Liquidity</div></AccordionTrigger><AccordionContent className="text-xs p-2 border-l-2 border-accent ml-2 pl-3">{dailyBiasReasoning.drawOnLiquidityAnalysis}</AccordionContent></AccordionItem>)}
                                            {dailyBiasReasoning.timeBasedLiquidityAnalysis && (<AccordionItem value="item-2"><AccordionTrigger className="text-xs hover:no-underline"><div className="flex items-center gap-1"><Activity className="h-3 w-3" /> Time-Based Liquidity</div></AccordionTrigger><AccordionContent className="text-xs p-2 border-l-2 border-accent ml-2 pl-3">{dailyBiasReasoning.timeBasedLiquidityAnalysis}</AccordionContent></AccordionItem>)}
                                            {dailyBiasReasoning.ltfConfirmationOutlook && (<AccordionItem value="item-3"><AccordionTrigger className="text-xs hover:no-underline"><div className="flex items-center gap-1"><Layers3 className="h-3 w-3" /> LTF Confirmation Outlook</div></AccordionTrigger><AccordionContent className="text-xs p-2 border-l-2 border-accent ml-2 pl-3">{dailyBiasReasoning.ltfConfirmationOutlook}</AccordionContent></AccordionItem>)}
                                            {dailyBiasReasoning.openingPriceConfluence && (<AccordionItem value="item-4"><AccordionTrigger className="text-xs hover:no-underline"><div className="flex items-center gap-1"><Info className="h-3 w-3" /> Opening Price Confluence</div></AccordionTrigger><AccordionContent className="text-xs p-2 border-l-2 border-accent ml-2 pl-3">{dailyBiasReasoning.openingPriceConfluence}</AccordionContent></AccordionItem>)}
                                        </Accordion>
                                        </div>
                                    )}

                                    <div>
                                      <Label>Patterns</Label>
                                      {analysis.patterns && analysis.patterns.length > 0 ? (<div className="flex flex-wrap gap-2 mt-1">{analysis.patterns.map((p, i) => (<Badge key={i} variant="secondary">{p}</Badge>))}</div>) : (<p className="text-sm text-muted-foreground mt-1">None identified.</p>)}
                                    </div>

                                    {analysis.ictElements && analysis.ictElements.length > 0 && (
                                        <div>
                                        <Label className="flex items-center gap-1"><Zap className="h-4 w-4 text-accent" /> ICT Elements</Label>
                                        <ul className="mt-2 list-none space-y-2">{analysis.ictElements.map((el, i) => (<li key={i} className="p-2 border rounded-md bg-muted/30 text-xs"><strong className="text-accent">{el.type}:</strong><p className="text-muted-foreground mt-0.5">{el.location_description}</p></li>))}</ul>
                                        </div>
                                    )}
                                     {analysis.marketStructureAnalysis && (<div><Label className="flex items-center gap-1"><Workflow className="h-4 w-4 text-accent" /> Market Structure</Label><p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap p-2 border rounded-md bg-muted/30">{analysis.marketStructureAnalysis}</p></div>)}
                                      {analysis.potentialAMDCycle && (analysis.potentialAMDCycle.phase || analysis.potentialAMDCycle.reasoning) && (<div><Label className="flex items-center gap-1"><Layers3 className="h-4 w-4 text-accent" /> AMD Cycle</Label><div className="mt-1 p-3 border rounded-md bg-muted/30 space-y-1 text-xs">{analysis.potentialAMDCycle.phase && (<p><strong className="text-foreground">Phase:</strong> {analysis.potentialAMDCycle.phase}</p>)}{analysis.potentialAMDCycle.reasoning && (<p className="text-muted-foreground"><Info className="inline h-3 w-3 mr-1" /> {analysis.potentialAMDCycle.reasoning}</p>)}{(analysis.potentialAMDCycle.phase === "Unclear" && !analysis.potentialAMDCycle.reasoning) && (<p className="text-muted-foreground">No clear AMD cycle phase apparent.</p>)}</div></div>)}
                                    
                                    <div><Label>Summary</Label><p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{analysis.summary}</p></div>
                                </CardContent>
                              </Card>
                              {sniperEntry && (sniperEntry.dailyBiasContext || sniperEntry.entryMechanic || sniperEntry.tradeManagement) && (
                                <Card className="border-accent/50">
                                  <CardHeader>
                                    <Label className="font-headline text-md flex items-center gap-2">
                                      <Crosshair className="text-accent"/> Sniper Entry Analysis
                                    </Label>
                                    <DialogDescription>A model based on the Intraday Sniper Entry strategy. This is a conceptual example, not a trade signal.</DialogDescription>
                                  </CardHeader>
                                  <CardContent className="space-y-6">
                                    {sniperEntry.dailyBiasContext && (<div className="space-y-3"><h4 className="font-semibold flex items-center gap-2 text-sm"><Compass className="h-4 w-4 text-accent"/>Daily Bias Setup (HTF)</h4><div className="p-3 border rounded-md bg-muted/40 space-y-2 text-xs"><p className="text-muted-foreground"><strong className="font-medium text-foreground">4H/1H Analysis:</strong> {sniperEntry.dailyBiasContext.fourHourAnalysis}</p><p className="text-muted-foreground"><strong className="font-medium text-foreground">Alignment:</strong> {sniperEntry.dailyBiasContext.alignment}</p></div></div>)}
                                    {sniperEntry.entryMechanic && (<div className="space-y-3"><h4 className="font-semibold flex items-center gap-2 text-sm"><PackageOpen className="h-4 w-4 text-accent"/>Entry Mechanic (LTF)</h4><div className="p-3 border rounded-md bg-muted/40 space-y-2 text-xs"><p className="text-muted-foreground"><strong className="font-medium text-foreground">15M Setup:</strong> {sniperEntry.entryMechanic.fifteenMinSetup}</p><p className="text-muted-foreground"><strong className="font-medium text-foreground">5M Confirmation:</strong> {sniperEntry.entryMechanic.fiveMinConfirmation}</p></div></div>)}
                                    {sniperEntry.tradeManagement && (sniperEntry.tradeManagement.entryPrice || sniperEntry.tradeManagement.stopLossPrice || sniperEntry.tradeManagement.takeProfitPrice) && (<div className="space-y-3"><h4 className="font-semibold flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-accent"/>Precise Trade Management</h4><div className="p-4 border rounded-lg bg-muted/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center"><div><Label className="text-xs text-muted-foreground">Entry Price</Label><p className="text-lg font-bold text-foreground">{sniperEntry.tradeManagement.entryPrice.toLocaleString()}</p></div><div><Label className="text-xs text-red-500">Stop Loss</Label><p className="text-lg font-bold text-foreground">{sniperEntry.tradeManagement.stopLossPrice.toLocaleString()}</p></div><div><Label className="text-xs text-green-500">Take Profit</Label><p className="text-lg font-bold text-foreground">{sniperEntry.tradeManagement.takeProfitPrice.toLocaleString()}</p></div></div></div>)}
                                  </CardContent>
                                </Card>
                              )}
                            </>
                        ) : (
                          <p className="text-center text-muted-foreground py-8">No detailed analysis available for this prediction.</p>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
    height: 180px;
    border-radius: var(--radius);
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }

  .card::before {
    content: "";
    height: 100px;
    width: 100px;
    position: absolute;
    top: -40%;
    left: -20%;
    border-radius: 50%;
    border: 35px solid hsla(var(--primary) / 0.1);
    transition: all .8s ease;
    filter: blur(.5rem);
  }

  .text {
    flex-grow: 1;
    padding: 15px;
    display: flex;
    flex-direction: column;
    color: hsl(var(--card-foreground));
    font-weight: 900;
    font-size: 1.1em;
  }

  .subtitle {
    font-size: .7em;
    font-weight: 400;
    color: hsl(var(--muted-foreground));
  }

  .manual-flag {
    margin-top: auto;
    font-size: 0.6rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 99px;
    align-self: flex-start;
    text-transform: capitalize;
  }

  .manual-flag.successful {
    background-color: hsl(var(--primary) / 0.2);
    color: hsl(var(--primary));
  }

  .manual-flag.unsuccessful {
    background-color: hsl(var(--destructive) / 0.2);
    color: hsl(var(--destructive));
  }

  .icons {
    display: flex;
    justify-items: center;
    align-items: center;
    width: 100%;
    border-top: 1px solid hsl(var(--border));
  }

  .btn {
    border: none;
    flex-grow: 1;
    height: 35px;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .btn:not(:last-child) {
    border-right: 1px solid hsl(var(--border));
  }

  .svg-icon {
    width: 18px;
    height: 18px;
    stroke: hsl(var(--muted-foreground));
    stroke-width: 2;
  }

  .btn:hover {
    background-color: hsl(var(--muted));
  }
  
  .btn:hover .svg-icon {
      stroke: hsl(var(--foreground));
  }
  
  .btn:first-child:hover .svg-icon {
      stroke: #28a745;
  }
  .btn:nth-child(2):hover .svg-icon {
      stroke: #dc3545;
  }

  .card:hover::before {
    width: 140px;
    height: 140px;
    top: -30%;
    left: 50%;
    transform: translateX(-50%);
    filter: blur(0rem);
  }
  
  .details-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: none;
    background-color: hsl(var(--background) / 0.7);
    backdrop-filter: blur(2px);
    color: hsl(var(--foreground));
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transform: scale(0.8);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .card:hover .details-btn {
    opacity: 1;
    transform: scale(1);
  }
`;

export default SimplePredictionCard;

    