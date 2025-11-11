// src/types/index.ts

import type { AnalyzeCandlestickChartOutput, PredictMarketMovementOutput } from '@/ai/flows/predict-market-movement';
import type { CategorizeAssetOutput } from '@/ai/flows/categorize-asset-flow';
import type { 
  AnalyzeMarketDataInput as FlowAnalyzeMarketDataInput, 
  AnalyzeMarketDataOutput as FlowAnalyzeMarketDataOutput 
} from '@/ai/flows/analyze-market-data-flow';
import { z } from 'zod';
import type { MessageData } from 'genkit';

export type AssetCategory = CategorizeAssetOutput['category'];

export interface UploadedImageAnalysis {
  id: string;
  imageName: string;
  imageUrl: string; 
  analysisResult?: AnalysisOutput;
  predictionResult?: PredictionOutput;
  timestamp: Date;
  flaggedStatus?: 'successful' | 'unsuccessful' | null;
}

export interface AlertConfig {
  id: string;
  name: string;
  asset: string; 
  conditionType: 'price_target' | 'confidence_change' | 'pattern_detected';
  value: string | number; 
  notificationMethod: 'email' | 'sms' | 'in-app'; 
  isActive: boolean;
  createdAt: string;
  originalPrice?: number;
  category?: AssetCategory;
}

export type PredictionOutput = PredictMarketMovementOutput['prediction'];
export type AnalysisOutput = AnalyzeCandlestickChartOutput;

export interface HistoricalPrediction {
  id: string;
  imagePreviewUrl: string;
  imagePreviewUrls?: (string | null)[];
  date: string;
  asset?: string; 
  prediction: PredictionOutput;
  analysis?: AnalysisOutput; 
  manualFlag?: 'successful' | 'unsuccessful';
}

export type AnalyzeMarketDataInput = FlowAnalyzeMarketDataInput;
export type AnalyzeMarketDataOutput = FlowAnalyzeMarketDataOutput;

export interface AlphaVantageGlobalQuote {
  symbol: string;
  open: number;
  high: number;
  low: number;
  price: number;
  volume: number;
  latestTradingDay: string;
  previousClose: number;
  change: number;
  changePercent: string;
}

export type TradingSession = AnalyzeMarketDataInput['activeTradingSession'];

export const availableTimeframes = ["1min", "5min", "15min", "30min", "1hr", "2hr", "4hr", "Daily", "Weekly"] as const;
export type Timeframe = typeof availableTimeframes[number];

export type NotificationType = 'alert_trigger' | 'site_message' | 'system_update' | 'info';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
  relatedLink?: string;
  iconName?: string;
}

export type Role = 'User' | 'Developer' | 'Owner';

export const availableRoles: Role[] = ['User', 'Developer', 'Owner'];

export interface UserAppData {
  userId: string;
  email: string;
  chartAnalysisTrialPoints: number;
  hasActiveSubscription: boolean;
  roles: Role[];
}

export interface UserManagementProfile {
  userId: string;
  email: string;
  roles: Role[];
  hasActiveSubscription: boolean;
  chartAnalysisTrialPoints: number;
  lastLogin?: string;
}

export const SendEmailInputSchema = z.object({
  to: z.string().email().describe('The email address of the recipient.'),
  subject: z.string().describe('The subject of the email.'),
  body: z.string().describe('The HTML body of the email.'),
});
export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

export const SendEmailOutputSchema = z.object({
  success: z.boolean().describe('Whether the email was sent successfully.'),
  message: z.string().describe('A confirmation message.'),
});
export type SendEmailOutput = z.infer<typeof SendEmailOutputSchema>;

export interface MarketNewsItem {
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  banner_image: string;
  source: string;
  category_within_source: string;
  source_domain: string;
  topics: { topic: string; relevance_score: string }[];
  overall_sentiment_score: number;
  overall_sentiment_label: string;
  ticker_sentiment: {
    ticker: string;
    relevance_score: string;
    ticker_sentiment_score: string;
    ticker_sentiment_label: string;
  }[];
}
