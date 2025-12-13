"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import type { HistoricalPrediction } from '@/types';
import { ThumbsUp, ThumbsDown, Trash2, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PredictionResults } from '@/components/dashboard/prediction-results';

interface SimplePredictionCardProps {
  prediction: HistoricalPrediction;
  onFlag: (predictionId: string, flag: 'successful' | 'unsuccessful') => void;
  onDelete: (predictionId: string) => void;
}

const SimplePredictionCard = ({ prediction, onFlag, onDelete }: SimplePredictionCardProps) => {
  const { id, asset, date, manualFlag, analysis, prediction: predData } = prediction;
  const [open, setOpen] = useState(false);
  
  const displayImages = prediction.imagePreviewUrls?.filter(Boolean) as string[] || (prediction.imagePreviewUrl ? [prediction.imagePreviewUrl] : []);

  return (
    <StyledWrapper $manualFlag={manualFlag} direction={predData?.marketDirection}>
      <div className="card">
        <div className="hover-background"></div>
        <div className="hover-arrow">
          {predData?.marketDirection === 'UP' ? <ArrowUpRight /> : <ArrowDownRight />}
        </div>
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
            <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 bg-background/95 backdrop-blur-xl flex flex-col">
                <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
                    <DialogTitle>Historical Analysis: {asset}</DialogTitle>
                    <DialogDescription>{format(new Date(date), 'PP p')}</DialogDescription>
                </DialogHeader>
                 <ScrollArea className="flex-1">
                    <div className="p-4 md:p-6">
                        {analysis && predData ? (
                             <PredictionResults 
                                prediction={predData}
                                analysis={analysis}
                                imagePreviewUrls={displayImages}
                             />
                        ) : (
                          <p className="text-center text-muted-foreground py-8">Analysis data unavailable.</p>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
      </div>
    </StyledWrapper>
  );
}

// Re-using the same style wrapper to maintain the card's look
const StyledWrapper = styled.div<{ $manualFlag?: 'successful' | 'unsuccessful', direction?: 'UP' | 'DOWN' | 'NEUTRAL' }>`
  .card {
    width: 100%;
    /* Mobile specific adjustment: allow full width if container permits */
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
    transition: transform 0.3s ease;
  }

  .hover-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: transparent;
    opacity: 0;
    transition: opacity 0.4s ease, background 0.4s ease;
    z-index: 0;
  }

  .hover-arrow {
    position: absolute;
    top: 1rem;
    right: 1rem;
    color: white;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.4s ease;
    z-index: 2;
    & > svg {
      width: 2rem;
      height: 2rem;
    }
  }

  .card:hover {
    transform: translateY(-5px);
    .hover-arrow {
      opacity: 0.8;
      transform: scale(1);
    }
    .hover-background {
      opacity: 1;
      background: ${({ direction }) =>
        direction === 'UP'
          ? `linear-gradient(to bottom, hsla(var(--primary) / 0.6), transparent)`
          : direction === 'DOWN'
          ? `linear-gradient(to bottom, hsla(var(--destructive) / 0.6), transparent)`
          : 'transparent'};
    }
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
    z-index: 1;
  }

  .text {
    flex-grow: 1;
    padding: 15px;
    display: flex;
    flex-direction: column;
    color: hsl(var(--card-foreground));
    font-weight: 900;
    font-size: 1.1em;
    position: relative;
    z-index: 1;
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
    position: relative;
    z-index: 1;
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
    z-index: 2;
  }

  .card:hover .details-btn {
    opacity: 1;
    transform: scale(1);
  }
`;

export default SimplePredictionCard;
