
"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HistoricalPrediction } from "@/types";
import { TrendingUp, TrendingDown, Minus, ThumbsUp, ThumbsDown, HelpCircle, Eye, Trash2 } from "lucide-react";
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


interface PerformanceHistoryTableProps {
  predictions: HistoricalPrediction[];
  onFlagTrade: (predictionId: string, flag: 'successful' | 'unsuccessful') => void;
  onDeletePrediction: (predictionId: string) => void;
}

const MarketDirectionIcon = ({ direction }: { direction: HistoricalPrediction['prediction']['marketDirection'] }) => {
  switch (direction) {
    case 'UP':
      return <TrendingUp className="h-4 w-4 text-green-500 mr-1" />;
    case 'DOWN':
      return <TrendingDown className="h-4 w-4 text-red-500 mr-1" />;
    case 'NEUTRAL':
      return <Minus className="h-4 w-4 text-yellow-500 mr-1" />;
    default:
      return null;
  }
};


export function PerformanceHistoryTable({ predictions, onFlagTrade, onDeletePrediction }: PerformanceHistoryTableProps) {
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Chart</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {predictions.map((pred) => (
              <TableRow key={pred.id}>
                <TableCell>{new Date(pred.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                       <Image
                        src={pred.imagePreviewUrl || pred.imagePreviewUrls?.[0] || "https://placehold.co/60x40.png"}
                        alt="Chart thumbnail"
                        width={60}
                        height={40}
                        className="rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
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
                <TableCell>{pred.asset || 'N/A'}</TableCell>
                <TableCell className="flex items-center">
                  <MarketDirectionIcon direction={pred.prediction.marketDirection} />
                  {pred.prediction.marketDirection}
                </TableCell>
                <TableCell>
                  {pred.manualFlag ? (
                    <Badge variant={pred.manualFlag === 'successful' ? 'default' : 'destructive'} className={pred.manualFlag === 'successful' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
                      {pred.manualFlag === 'successful' ? <ThumbsUp className="h-3 w-3 mr-1" /> : <ThumbsDown className="h-3 w-3 mr-1" />}
                      {pred.manualFlag.charAt(0).toUpperCase() + pred.manualFlag.slice(1)}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Unflagged</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => onFlagTrade(pred.id, 'successful')} title="Flag as Successful">
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onFlagTrade(pred.id, 'unsuccessful')} title="Flag as Unsuccessful">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
