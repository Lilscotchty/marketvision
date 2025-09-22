
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { HistoricalPrediction } from "@/types";
import { ThumbsUp, ThumbsDown, HelpCircle, Trash2 } from "lucide-react";
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
import { PredictionResults } from "@/components/dashboard/prediction-results"; // Re-use for detailed view
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
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chart</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.slice(0, displayCount).map((pred) => (
                <TableRow key={pred.id}>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                         <Image
                          src={pred.imagePreviewUrl || "https://placehold.co/80x60.png"}
                          alt="Chart thumbnail"
                          width={80}
                          height={60}
                          className="rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                          data-ai-hint="chart finance"
                        />
                      </DialogTrigger>
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
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                     <div className="flex justify-end items-center space-x-1">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onFlagTrade(pred.id, 'successful')} 
                            title="Flag as Successful"
                            className={cn(pred.manualFlag === 'successful' && 'bg-green-500/20 hover:bg-green-500/30')}
                        >
                          <ThumbsUp className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onFlagTrade(pred.id, 'unsuccessful')} 
                            title="Flag as Unsuccessful"
                            className={cn(pred.manualFlag === 'unsuccessful' && 'bg-red-500/20 hover:bg-red-500/30')}
                        >
                          <ThumbsDown className="h-4 w-4 text-red-500" />
                        </Button>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Delete" className="text-destructive/70 hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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

