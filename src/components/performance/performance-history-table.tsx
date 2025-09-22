
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { HistoricalPrediction } from "@/types";
import { ThumbsUp, ThumbsDown, HelpCircle, Trash2, LineChart, MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PredictionResults } from "@/components/dashboard/prediction-results";
import { cn } from "@/lib/utils";

const INITIAL_DISPLAY_COUNT = 5;

interface PerformanceHistoryTableProps {
  predictions: HistoricalPrediction[];
  onFlagTrade: (predictionId: string, flag: 'successful' | 'unsuccessful') => void;
  onDeletePrediction: (predictionId: string) => void;
}

export function PerformanceHistoryTable({ predictions, onFlagTrade, onDeletePrediction }: PerformanceHistoryTableProps) {
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);

  const handleViewMore = () => {
    setDisplayCount(predictions.length);
  };
  
  if (predictions.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Prediction History</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="flex flex-col items-center justify-center py-12 text-center">
            <HelpCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">No Prediction History</h3>
            <p className="text-muted-foreground">Your analyzed predictions will appear here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Detailed Prediction History</CardTitle>
        <CardDescription>Review past predictions and flag their outcomes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {predictions.slice(0, displayCount).map((pred) => (
          <Dialog key={pred.id}>
            <div className="group relative bg-muted/30 hover:bg-muted/50 transition-colors rounded-lg flex items-center pr-2">
              <DialogTrigger asChild>
                <button className="flex-1 text-left p-4 rounded-lg flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <LineChart className="h-10 w-10 text-primary" />
                  </div>
                  <div className="flex-1">
                      <p className="font-bold text-base">{pred.asset || 'Analysis'}</p>
                      <p className="text-xs text-muted-foreground">{new Date(pred.date).toLocaleDateString()}</p>
                  </div>
                </button>
              </DialogTrigger>

               <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <DropdownMenuItem 
                          onClick={() => onFlagTrade(pred.id, 'successful')}
                          className={cn(pred.manualFlag === 'successful' && 'bg-green-500/10 text-green-700')}
                        >
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          <span>Successful</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onFlagTrade(pred.id, 'unsuccessful')}
                          className={cn(pred.manualFlag === 'unsuccessful' && 'bg-red-500/10 text-red-700')}
                        >
                           <ThumbsDown className="mr-2 h-4 w-4" />
                           <span>Unsuccessful</span>
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                               <Trash2 className="mr-2 h-4 w-4" />
                               <span>Delete</span>
                             </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this analysis result.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDeletePrediction(pred.id)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
               </div>
            </div>
            
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Prediction Details</DialogTitle>
                <DialogDescription>
                  Analysis from {new Date(pred.date).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 max-h-[80vh] overflow-y-auto pr-4">
                {pred.analysis ? (
                   <PredictionResults prediction={pred.prediction} analysis={pred.analysis} imagePreviewUrls={pred.imagePreviewUrls} />
                ) : (
                  <p>Full analysis details not available.</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
         {predictions.length > displayCount && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={handleViewMore}>
              View All ({predictions.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
