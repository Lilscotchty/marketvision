
import type { AnalyzeCandlestickChartOutput } from '@/ai/flows/analyze-candlestick-chart';
import type { PredictMarketMovementOutput } from '@/ai/flows/predict-market-movement';
// Import the TYPES directly from the flow file, not the schema objects
import type { 
  AnalyzeMarketDataInput as FlowAnalyzeMarketDataInput, 
  AnalyzeMarketDataOutput as FlowAnalyzeMarketDataOutput 
} from '@/ai/flows/analyze-market-data-flow';
import { z } from 'zod';


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

// User-specific application data, managed by AuthContext
export interface UserAppData {
  userId: string;
  email: string;
  chartAnalysisTrialPoints: number;
  hasActiveSubscription: boolean;
  // Future: notificationPreferences, etc.
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
