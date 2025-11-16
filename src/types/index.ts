// src/types/index.ts

import type { AnalyzeCandlestickChartOutput } from '@/ai/flows/analyze-candlestick-chart';
import type { PredictMarketMovementOutput } from '@/ai/flows/predict-market-movement';
import type { CategorizeAssetOutput } from '@/ai/flows/categorize-asset-flow';

// Import the TYPES directly from the flow file, not the schema objects
import type { 
  AnalyzeMarketDataInput as FlowAnalyzeMarketDataInput, 
  AnalyzeMarketDataOutput as FlowAnalyzeMarketDataOutput 
} from '@/ai/flows/analyze-market-data-flow';
import { z } from 'zod';
import type { MessageData } from 'genkit';

// --- NEW SCHEMAS ---
// These schemas are based on the ones in your AI flow,
// but defining them here makes them re-usable in the frontend.

export const ICTElementSchema = z.object({
  type: z.string().describe("The type of ICT element (e.g., 'Fair Value Gap (FVG)', 'Order Block (OB)', 'Breaker Block', 'Liquidity Pool')."),
  location_description: z.string().describe("A brief description of where this element is located on the chart."),
});
export type ICTElement = z.infer<typeof ICTElementSchema>;
// --- END NEW SCHEMAS ---


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
  createdAt: string; // ISO string for when the alert was created
  originalPrice?: number; // The price of the asset when the alert was created
  category?: AssetCategory; // Optional: To store the category
}

export type PredictionOutput = PredictMarketMovementOutput['prediction'];
export type AnalysisOutput = AnalyzeCandlestickChartOutput;

export interface HistoricalPrediction {
  id: string;
  imagePreviewUrl: string; // Legacy for single image display
  imagePreviewUrls?: (string | null)[]; // For multi-image display
  date: string;
  asset?: string; 
  prediction: PredictionOutput;
  analysis?: AnalysisOutput; 
  manualFlag?: 'successful' | 'unsuccessful';
}

// Use the imported types
export type AnalyzeMarketDataInput = FlowAnalyzeMarketDataInput;
export type AnalyzeMarketDataOutput = FlowAnalyzeMarketDataOutput;


// For the quote service (our data provider) Global Quote
export interface AlphaVantageGlobalQuote { // Keeping name generic as it's a structure
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

// Ensure TradingSession is derived correctly from the (now correctly imported) AnalyzeMarketDataInput type
export type TradingSession = AnalyzeMarketDataInput['activeTradingSession'];

// Define available timeframes
export const availableTimeframes = ["1min", "5min", "15min", "30min", "1hr", "2hr", "4hr", "Daily", "Weekly"] as const;
export type Timeframe = typeof availableTimeframes[number];

// --- New Notification Type ---
export type NotificationType = 'alert_trigger' | 'site_message' | 'system_update' | 'info';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  type: NotificationType;
  relatedLink?: string; // e.g., link to the specific alert or asset
  iconName?: string; // Optional: Lucide icon name for visual cue e.g. "BellRing", "Info"
}

// --- Roles and User Data ---
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

// --- Email Flow Types ---
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

// News types
export interface ApiMarketNewsItem {
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

export const sentimentOptions = ["Bullish", "Bearish", "Neutral"] as const;
export type Sentiment = typeof sentimentOptions[number];

export interface NewsPost {
  id: string;
  created_at: string;
  title: string;
  content: string;
  banner_image_url?: string | null;
  sentiment: Sentiment;
  author_id: string;
  author_email?: string; // For display purposes
}

export const NewsPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  content: z.string().min(50, 'Content must be at least 50 characters long.'),
  banner_image_url: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  sentiment: z.enum(sentimentOptions),
});

export type NewsPostFormValues = z.infer<typeof NewsPostSchema>;
