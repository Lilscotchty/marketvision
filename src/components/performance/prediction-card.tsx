
"use client";

import React, { useRef } from 'react';
import styled from 'styled-components';
import type { HistoricalPrediction } from '@/types';
import { TrendingUp, TrendingDown, Minus, ThumbsUp, ThumbsDown, Trash2, Share2, MoreHorizontal, GalleryHorizontal, Lightbulb, Zap, Workflow, Layers3, Compass, BookOpen, Target, Activity, Info, ShieldCheck, Crosshair, PackageOpen } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { ScrollArea } from '../ui/scroll-area';
import html2canvas from 'html2canvas';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface PredictionCardProps {
  prediction: HistoricalPrediction;
  onFlag: (predictionId: string, flag: 'successful' | 'unsuccessful') => void;
  onDelete: (predictionId: string) => void;
}

const PredictionCard = ({ prediction, onFlag, onDelete }: PredictionCardProps) => {
  const { id, prediction: predData, analysis, asset, date, imagePreviewUrl, manualFlag } = prediction;
  const cardRef = useRef<HTMLDivElement>(null);

  const summaryText = analysis?.summary || 'No analysis summary available.';
  const marketDirection = predData?.marketDirection || 'NEUTRAL';

  const DirectionIcon = 
    marketDirection === 'UP' ? <TrendingUp className="h-6 w-6" /> :
    marketDirection === 'DOWN' ? <TrendingDown className="h-6 w-6" /> :
    <Minus className="h-6 w-6" />;
    
  const getBackgroundImage = () => {
    switch (marketDirection) {
      case 'UP':
        return 'https://i.ibb.co/TMBtJqwp/Bulish.jpg';
      case 'DOWN':
        return 'https://i.ibb.co/zHF6zFhf/Bearish.png';
      default:
        return imagePreviewUrl || 'https://placehold.co/190x254/151515/a8a8a8.png?text=Chart';
    }
  };

  const handleFlagClick = (e: React.MouseEvent, flag: 'successful' | 'unsuccessful') => {
    e.stopPropagation();
    e.preventDefault();
    onFlag(id, flag);
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onDelete(id);
  }

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, { 
        useCORS: true, 
        backgroundColor: null,
        onclone: (document) => {
          const clonedCard = document.querySelector('.card');
          if (clonedCard) {
            const actionButtons = clonedCard.querySelector('.action-buttons');
            if (actionButtons) {
                (actionButtons as HTMLElement).style.display = 'none';
            }
          }
        }
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `finsight-analysis-${asset}-${new Date(date).toLocaleDateString()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };
  
  const dailyBiasReasoning = analysis?.dailyBiasReasoning;
  const sniperEntry = analysis?.sniperEntrySetup;
  const displayImages = prediction.imagePreviewUrls?.filter(Boolean) as string[] || (prediction.imagePreviewUrl ? [prediction.imagePreviewUrl] : []);

  return (
    <StyledWrapper ref={cardRef}>
      <div className="card">
        <div className="content">
          <div className="back">
            <div className="back-content">
              {DirectionIcon}
              <strong>{marketDirection}</strong>
            </div>
          </div>
          <div className="front">
             <div className="img">
               <Image src={getBackgroundImage()} alt={asset || 'chart'} layout="fill" objectFit="cover" />
              <div className="circle"></div>
              <div className="circle" id="right"></div>
              <div className="circle" id="bottom"></div>
            </div>
            <div className="front-content">
              <div className="card-header">
                <small className="badge">{asset}</small>
                <div className="action-buttons">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" title="Share as Image" onClick={handleShareClick}><Share2 size={12} /></Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" title="More Details"><MoreHorizontal size={14} /></Button>
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
              </div>
              <div className="description">
                <div className="title">
                  <p className="title">
                    <strong>{new Date(date).toLocaleDateString()}</strong>
                  </p>
                </div>
                <p className="card-footer">
                  {summaryText.substring(0, 50)}{summaryText.length > 50 ? '...' : ''}
                </p>
                <div className="flag-buttons">
                  <button 
                    className="flag-btn successful" 
                    onClick={(e) => handleFlagClick(e, 'successful')}
                    title="Mark as Successful"
                  >
                    <ThumbsUp size={12} />
                  </button>
                  <button 
                    className="flag-btn unsuccessful" 
                    onClick={(e) => handleFlagClick(e, 'unsuccessful')}
                    title="Mark as Unsuccessful"
                  >
                    <ThumbsDown size={12} />
                  </button>
                   <button 
                    className="flag-btn delete" 
                    onClick={handleDeleteClick}
                    title="Delete Prediction"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                {manualFlag && (
                  <small className={`badge-sm ${manualFlag}`}>
                    {manualFlag}
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    overflow: visible;
    width: 190px;
    height: 254px;
  }

  .content {
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 300ms;
    box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-radius: var(--radius);
  }

  .front, .back {
    background-color: hsl(var(--card));
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: var(--radius);
    overflow: hidden;
  }

  .back {
    width: 100%;
    height: 100%;
    justify-content: center;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .back::before {
    position: absolute;
    content: ' ';
    display: block;
    width: 160px;
    height: 160%;
    background: linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(var(--primary)), hsl(var(--primary)), hsl(var(--primary)), transparent);
    animation: rotation_481 5000ms infinite linear;
  }

  .back-content {
    position: absolute;
    width: 99%;
    height: 99%;
    background-color: hsl(var(--card));
    border-radius: var(--radius);
    color: hsl(var(--card-foreground));
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 15px;
  }
  
  .card:hover .content {
    transform: rotateY(180deg);
  }

  @keyframes rotation_481 {
    0% {
      transform: rotateZ(0deg);
    }

    100% {
      transform: rotateZ(360deg);
    }
  }

  .front {
    transform: rotateY(180deg);
    color: hsl(var(--card));
  }

  .front .front-content {
    position: absolute;
    width: 100%;
    height: 100%;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .action-buttons {
    display: flex;
    gap: 4px;
  }
  
  .front-content .badge {
    background-color: hsla(var(--background) / 0.5);
    padding: 2px 10px;
    border-radius: 10px;
    backdrop-filter: blur(2px);
    width: fit-content;
    color: hsl(var(--card));
    border: 1px solid hsl(var(--border) / 0.5);
  }
  
  .badge-sm {
      background-color: hsla(var(--muted-foreground) / 0.7);
      padding: 2px 8px;
      border-radius: 10px;
      width: fit-content;
      color: hsl(var(--card));
      font-size: 9px;
      text-transform: capitalize;
      margin-top: 4px;
      align-self: center;
  }
  
  .badge-sm.successful {
      background-color: rgba(40, 167, 69, 0.7);
  }
  
  .badge-sm.unsuccessful {
      background-color: rgba(220, 53, 69, 0.7);
  }

  .description {
    box-shadow: 0px 0px 10px 5px hsla(var(--background) / 0.2);
    width: 100%;
    padding: 10px;
    background-color: hsla(var(--background) / 0.4);
    backdrop-filter: blur(5px);
    border-radius: 5px;
  }

  .title {
    font-size: 11px;
    max-width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .title p {
    width: 100%;
    color: hsl(var(--card));
  }

  .card-footer {
    color: hsla(var(--card), 0.8);
    margin-top: 5px;
    font-size: 8px;
    min-height: 24px;
  }

  .flag-buttons {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    justify-content: center;
  }

  .flag-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background-color: hsla(var(--muted-foreground) / 0.1);
    color: hsl(var(--muted-foreground));
    transition: all 0.2s ease;
  }

  .flag-btn:hover {
    transform: scale(1.1);
  }
  
  .flag-btn.successful:hover {
    background-color: rgba(40, 167, 69, 0.2);
    color: #28a745;
  }

  .flag-btn.unsuccessful:hover {
    background-color: rgba(220, 53, 69, 0.2);
     color: #dc3545;
  }
  
  .flag-btn.delete:hover {
    color: hsl(var(--destructive));
    background-color: hsla(var(--destructive) / 0.1);
  }

  .front .img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .circle {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background-color: hsl(var(--primary));
    position: relative;
    filter: blur(15px);
    animation: floating 2600ms infinite linear;
  }

  #bottom {
    background-color: hsl(var(--accent));
    left: 50px;
    top: 0px;
    width: 150px;
    height: 150px;
    animation-delay: -800ms;
  }

  #right {
    background-color: hsl(var(--destructive));
    left: 160px;
    top: -80px;
    width: 30px;
    height: 30px;
    animation-delay: -1800ms;
  }

  @keyframes floating {
    0% {
      transform: translateY(0px);
    }

    50% {
      transform: translateY(10px);
    }

    100% {
      transform: translateY(0px);
    }
  }
`;

export default PredictionCard;
