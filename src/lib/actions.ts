'use server';

import { z } from 'zod';
import { predictMarketMovement } from '@/ai/flows/predict-market-movement';
import { analyzeCandlestickChart, identifyAsset } from '@/ai/flows/analyze-candlestick-chart';
import { categorizeAsset } from '@/ai/flows/categorize-asset-flow';
import type {
  PredictionOutput,
  AnalysisOutput,
  AlphaVantageGlobalQuote,
  ApiMarketNewsItem,
  AssetCategory,
  AppNotification,
  NotificationType,
  Role, 
  NewsPost,
  NewsPostFormValues,
  HistoricalPrediction,
  AlertConfig
} from '@/types';
import { createSupabaseServerClient } from '@/lib/supabase/server'; 
import { revalidatePath } from 'next/cache'; 
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import yahooFinance from 'yahoo-finance2';

const BUCKET_NAME = 'chart_uploads';

// --- HELPER: Fetch Historical Data ---
async function fetchHistoricalDataForContext(symbol: string, timeframe: string): Promise<string> {
  try {
    const yahooSymbol = convertToYahooSymbol(symbol);
    
    // Map generic timeframes to Yahoo intervals
    let interval: "1m" | "2m" | "5m" | "15m" | "30m" | "60m" | "90m" | "1h" | "1d" | "5d" | "1wk" | "1mo" | "3mo" = "1d";
    let period1 = new Date(); // Start date
    
    const tf = timeframe.toLowerCase();
    
    // Simple logic to grab "relevant recent data" for the AI
    if (tf.includes('m')) {
        interval = "15m"; // Default to 15m for minute charts to get granular data
        period1.setDate(period1.getDate() - 5); // Last 5 days
    } else if (tf.includes('h')) {
        interval = "1h"; // Yahoo often supports 1h
        period1.setDate(period1.getDate() - 20); // Last 20 days
    } else {
        interval = "1d";
        period1.setDate(period1.getDate() - 90); // Last 3 months
    }

    // Suppress notices
    yahooFinance.suppressNotices(['yahooSurvey', 'cantCookie']);

    // FIX 1: Switched to .chart() to support intraday intervals like "15m" and "1h"
    const result = await yahooFinance.chart(yahooSymbol, {
      period1: period1.toISOString(),
      interval: interval,
    });

    // Validation: Ensure we have quotes
    if (!result || !result.quotes || result.quotes.length === 0) {
      return "";
    }

    // FIX 2: Access .quotes property (since .chart returns an object) and typed 'row' as any
    // Format as a simplified CSV-like string to save token space for the AI
    const dataString = result.quotes.reverse().slice(0, 30).map((row: any) => { 
      // Format: YYYY-MM-DD HH:mm | O: H: L: C: V:
      const dateStr = row.date instanceof Date ? row.date.toISOString() : new Date(row.date).toISOString();
      const simpleDate = dateStr.split('T')[0] + ' ' + dateStr.split('T')[1].substring(0,5);
      return `${simpleDate} | O:${row.open} H:${row.high} L:${row.low} C:${row.close} V:${row.volume}`;
    }).join('\n');

    return `Recent Market Data for ${yahooSymbol} (${interval}):\n${dataString}`;
  } catch (error) {
    console.error("Failed to fetch historical context:", error);
    return ""; // Return empty string on failure so analysis can proceed visually
  }
}

// --- CHART UPLOAD & ANALYSIS ---

export interface AnalysisResult {
  prediction?: PredictionOutput;
  analysis?: AnalysisOutput;
  error?: string;
  imagePreviewUrls?: (string | null)[];
}

export async function uploadChartImages(
  files: File[]
): Promise<{ publicUrl: string | null; error: any }[]> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient(cookieStore);

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Error getting session:', sessionError);
    return files.map(() => ({ publicUrl: null, error: 'Auth session error' }));
  }

  if (!session) {
    console.error('No active session found for upload.');
    return files.map(() => ({
      publicUrl: null,
      error: 'User not authenticated',
    }));
  }

  const userId = session.user.id;

  const uploadPromises = files.map(async (file) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${uuidv4()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      return { publicUrl: null, error };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    return { publicUrl, error: null };
  });

  return Promise.all(uploadPromises);
}

export async function handleImageAnalysisAction(
  chartUrls: string[]
): Promise<AnalysisResult> {
  if (!chartUrls || chartUrls.length === 0) {
    return { error: 'No chart images were provided.' };
  }

  try {
    // 1. Identify Asset First (Lightweight AI Call)
    let marketDataString = "";
    try {
        const identity = await identifyAsset({ chartImageUrl: chartUrls[0] });
        console.log("Identified Asset:", identity);
        
        if (identity.symbol && identity.symbol !== 'UNKNOWN') {
            // 2. Fetch Historical Data (Yahoo Finance)
            marketDataString = await fetchHistoricalDataForContext(identity.symbol, identity.timeframe);
        }
    } catch (e) {
        console.warn("Asset identification failed, proceeding with visual-only analysis.", e);
    }

    // 3. Prepare Inputs
    const predictionInput = {
      candlestickChartImageUrl: chartUrls[0],
    };

    const analysisInput = {
      chartImageUrls: chartUrls,
      marketDataContext: marketDataString // Pass the fetched data
    };

    // 4. Run Analysis (Parallel)
    const [predictionResult, analysisResult] = await Promise.all([
      predictMarketMovement(predictionInput),
      analyzeCandlestickChart(analysisInput),
    ]);

    if (
      analysisResult.asset === 'Unclear' &&
      analysisResult.summary === 'Timeframe not visible'
    ) {
      return {
        error:
          'Could not identify timeframes on the chart. Please use a screenshot of the chart window instead of a downloaded image.',
      };
    }

    if (
      analysisResult.timeframesDetected &&
      analysisResult.timeframesDetected.length > 1 &&
      new Set(analysisResult.timeframesDetected).size === 1
    ) {
      return {
        error: `All uploaded charts appear to be from the same timeframe (${analysisResult.timeframesDetected[0]}). For a comprehensive analysis, please upload charts from multiple timeframes (e.g., 4H, 1H, 15M).`,
      };
    }

    return {
      prediction: predictionResult.prediction,
      analysis: analysisResult,
      imagePreviewUrls: chartUrls,
    };
  } catch (error) {
    console.error('AI analysis failed:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred during AI analysis.',
    };
  }
}

// --- MARKET DATA FETCHING (YAHOO FINANCE) ---

function convertToYahooSymbol(symbol: string): string {
  let s = symbol.toUpperCase().trim();
  
  if (s.includes('PERP')) s = s.replace('PERP', '');

  if (s.includes('/') && (s.endsWith('USD') || s.endsWith('USDT'))) {
    return s.replace('/', '-');
  }
  if (!s.includes('-') && (s.endsWith('USD') || s.endsWith('USDT')) && s.length > 3) {
     if (s.endsWith('USD')) return s.replace('USD', '-USD');
     if (s.endsWith('USDT')) return s.replace('USDT', '-USDT');
  }

  // Basic forex heuristic if not already formatted
  if (!s.includes('=X') && s.length === 6 && !s.includes('-') && !['BTC', 'ETH', 'SOL'].some(c => s.startsWith(c))) {
      // Very basic Forex check list
      const commonForex = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF'];
      if(commonForex.includes(s)) return s + "=X";
  }
  
  if (s.includes('/') && s.length === 7) {
      return s.replace('/', '') + "=X";
  }
  
  return s;
}

export interface FetchMarketDataResult {
  data?: AlphaVantageGlobalQuote;
  error?: string;
  assetType?: 'stock' | 'forex' | 'crypto' | 'unknown';
}

export async function fetchMarketData(symbol: string): Promise<FetchMarketDataResult> {
  try {
    const yahooSymbol = convertToYahooSymbol(symbol);
    yahooFinance.suppressNotices(['yahooSurvey', 'cantCookie']); 
    
    const quote = await yahooFinance.quote(yahooSymbol);

    if (!quote) {
        return { error: `No data found for symbol: ${symbol}` };
    }

    const marketData: AlphaVantageGlobalQuote = {
        symbol: quote.symbol,
        open: quote.regularMarketOpen || 0,
        high: quote.regularMarketDayHigh || 0,
        low: quote.regularMarketDayLow || 0,
        price: quote.regularMarketPrice || 0,
        volume: quote.regularMarketVolume || 0,
        latestTradingDay: quote.regularMarketTime ? new Date(quote.regularMarketTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        previousClose: quote.regularMarketPreviousClose || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent ? quote.regularMarketChangePercent.toFixed(2) + '%' : '0%',
    };

    let assetType: 'stock' | 'forex' | 'crypto' | 'unknown' = 'stock';
    if (quote.quoteType === 'CRYPTOCURRENCY') assetType = 'crypto';
    else if (quote.quoteType === 'CURRENCY') assetType = 'forex';

    return { data: marketData, assetType };

  } catch (error) {
    console.error(`Failed to fetch market data for ${symbol}:`, error);
    return { error: `Failed to fetch data.` };
  }
}

export async function fetchMarketDataFromAV(
  symbol: string
): Promise<FetchMarketDataResult> {
    return fetchMarketData(symbol);
}

// --- NEWS FETCHING ---

export interface FetchNewsResult {
  data?: ApiMarketNewsItem[];
  error?: string;
}

export async function fetchMarketNews(): Promise<FetchNewsResult> {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY;
  if (!apiKey) {
    return { error: 'News service API key is not configured.' };
  }

  const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets&limit=50&apikey=${apiKey}`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); 
    if (!response.ok) {
      return { error: `News API request failed: ${response.statusText}` };
    }
    const data = await response.json();
    if (data['Error Message']) {
      return { error: `News service: ${data['Error Message']}` };
    }
    if (data['Note']) {
      console.warn('News service API Note:', data['Note']);
      if (data['Note'].includes('free tier')) {
        return {
          error: `Could not fetch news. The API limit for the free tier may have been reached.`,
        };
      }
    }

    const newsItems: ApiMarketNewsItem[] = data.feed || [];
    return { data: newsItems };
  } catch (error) {
    console.error(`Failed to fetch market news:`, error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while fetching news.',
    };
  }
}

export async function categorizeAssetAction(
  symbol: string
): Promise<
  { category: AssetCategory; error?: null } | { error: string; category?: null }
> {
  try {
    const result = await categorizeAsset({ symbol });
    return { category: result.category };
  } catch (error) {
    console.error('Asset categorization failed:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred during categorization.',
    };
  }
}

// --- USER & ROLE MANAGEMENT ---

type ActionResponse = {
  success: boolean;
  message: string;
};

export async function updateUserRoles(
  userIdToUpdate: string,
  newRoles: Role[]
): Promise<ActionResponse> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient(cookieStore);

  const {
    data: { user: adminUser },
  } = await supabase.auth.getUser();

  if (!adminUser) {
    return { success: false, message: 'Not authenticated.' };
  }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', adminUser.id)
    .single();

  const isOwner =
    adminUser.email === 'pb7552212@gmail.com' ||
    (adminProfile?.roles && adminProfile.roles.includes('Owner'));

  if (!isOwner) {
    return {
      success: false,
      message: 'Access Denied: You are not an Owner.',
    };
  }

  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('email, roles')
    .eq('id', userIdToUpdate)
    .single();

  if (!targetProfile) {
    return { success: false, message: 'Target user not found.' };
  }

  if (
    targetProfile.email === 'pb7552212@gmail.com' &&
    !newRoles.includes('Owner')
  ) {
    return {
      success: false,
      message: "Action Forbidden: The Owner's 'Owner' role cannot be removed.",
    };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ roles: newRoles })
    .eq('id', userIdToUpdate);

  if (error) {
    return { success: false, message: `Database error: ${error.message}` };
  }

  revalidatePath('/admin');
  return { success: true, message: 'Roles updated successfully.' };
}

// --- NEWS POST MANAGEMENT ---

export async function getNewsPosts(): Promise<{ data: NewsPost[] | null; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient(cookieStore);
  
  const { data, error } = await supabase
    .from('news_posts')
    .select(`
      id,
      created_at,
      title,
      content,
      banner_image_url,
      sentiment,
      author_id,
      profiles ( email, username )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching news posts:', error);
    return { data: null, error: error.message };
  }

  const remappedData = data.map((post: any) => {
    const profileData = post.profiles;
    
    const profile = Array.isArray(profileData) 
      ? (profileData.length > 0 ? profileData[0] : null)
      : profileData;

    let authorDisplay = 'Unknown Author';
    
    if (profile) {
        if (profile.username) {
            authorDisplay = profile.username;
        } else if (profile.email) {
            authorDisplay = profile.email;
        }
    }

    const { profiles, ...postWithoutProfiles } = post;

    return {
      ...postWithoutProfiles,
      author_email: authorDisplay 
    };
  });

  return { data: remappedData, error: null };
}

export async function upsertNewsPost(
  values: NewsPostFormValues,
  postId?: string
): Promise<ActionResponse & { postId?: string }> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Not authenticated.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!profile) {
    const userRoles: Role[] =
      user.email === 'pb7552212@gmail.com' ? ['Owner'] : ['User'];
      
    const usernameFromMeta = user.user_metadata?.username || user.user_metadata?.full_name || null;

    const { error: insertProfileError } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      username: usernameFromMeta,
      roles: userRoles,
      has_active_subscription: false,
      chart_analysis_trial_points: 5
    });

    if (insertProfileError) {
      console.error('Error creating fallback profile:', insertProfileError);
      return {
        success: false,
        message: `Failed to create user profile: ${insertProfileError.message}`,
      };
    }
  }

  const postData = {
    ...values,
    author_id: user.id,
  };

  if (postId) {
    const { error } = await supabase
      .from('news_posts')
      .update(postData)
      .eq('id', postId);
    if (error) {
      return {
        success: false,
        message: `Error updating post: ${error.message}`,
      };
    }
    revalidatePath('/admin');
    revalidatePath('/news');
    return { success: true, message: 'Post updated successfully.', postId };
  } else {
    const { data, error } = await supabase
      .from('news_posts')
      .insert(postData)
      .select()
      .single();
    if (error) {
      return {
        success: false,
        message: `Error creating post: ${error.message}`,
      };
    }
    revalidatePath('/admin');
    revalidatePath('/news');
    return { success: true, message: 'Post created successfully.', postId: data.id };
  }
}

export async function deleteNewsPost(postId: string): Promise<ActionResponse> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient(cookieStore);

  const { error } = await supabase.from('news_posts').delete().eq('id', postId);
  if (error) {
    return {
      success: false,
      message: `Error deleting post: ${error.message}`,
    };
  }
  revalidatePath('/admin');
  revalidatePath('/news');
  return { success: true, message: 'Post deleted successfully.' };
}

// --- CREDIT & SUBSCRIPTION MANAGEMENT ---

export async function consumeAnalysisCredit(): Promise<{ success: boolean; message?: string; remainingCredits?: number }> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Not authenticated' };

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('has_active_subscription, chart_analysis_trial_points')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { success: false, message: 'Profile not found' };
  }

  if (profile.has_active_subscription) {
    return { success: true, message: 'Subscription active' }; 
  }

  if ((profile.chart_analysis_trial_points || 0) > 0) {
    const newPoints = (profile.chart_analysis_trial_points || 0) - 1;
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ chart_analysis_trial_points: newPoints })
      .eq('id', user.id);

    if (updateError) {
      return { success: false, message: 'Failed to update credits' };
    }
    
    revalidatePath('/'); 
    return { success: true, remainingCredits: newPoints };
  }

  return { success: false, message: 'Insufficient credits' };
}

export async function adminAddCredits(userId: string, amount: number): Promise<ActionResponse> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Not authenticated' };
  
  const { data: adminProfile } = await supabase.from('profiles').select('roles').eq('id', user.id).single();
  const isAuthorized = adminProfile?.roles?.some((r: string) => ['Owner', 'Developer'].includes(r));
  
  if (!isAuthorized && user.email !== 'pb7552212@gmail.com') {
    return { success: false, message: 'Unauthorized' };
  }

  const { data: targetProfile } = await supabase.from('profiles').select('chart_analysis_trial_points').eq('id', userId).single();
  const currentPoints = targetProfile?.chart_analysis_trial_points || 0;
  
  const { error } = await supabase
    .from('profiles')
    .update({ chart_analysis_trial_points: currentPoints + amount })
    .eq('id', userId);

  if (error) return { success: false, message: error.message };
  
  revalidatePath('/admin');
  return { success: true, message: `Added ${amount} credits successfully.` };
}

export async function adminToggleSubscription(userId: string, status: boolean): Promise<ActionResponse> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient(cookieStore);

   const { data: { user } } = await supabase.auth.getUser();
   if (!user) return { success: false, message: 'Not authenticated' };
   
   const { data: adminProfile } = await supabase.from('profiles').select('roles').eq('id', user.id).single();
   const isAuthorized = adminProfile?.roles?.some((r: string) => ['Owner', 'Developer'].includes(r));
   
   if (!isAuthorized && user.email !== 'pb7552212@gmail.com') {
     return { success: false, message: 'Unauthorized' };
   }

  const { error } = await supabase
    .from('profiles')
    .update({ has_active_subscription: status })
    .eq('id', userId);

  if (error) return { success: false, message: error.message };

  revalidatePath('/admin');
  return { success: true, message: `Subscription set to ${status}` };
}

export async function simulateSubscriptionSuccess(): Promise<ActionResponse> {
    const cookieStore = await cookies();
    const supabase = await createSupabaseServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { success: false, message: "Not authenticated" };

    const { error } = await supabase
        .from('profiles')
        .update({ has_active_subscription: true })
        .eq('id', user.id);
    
    if(error) return { success: false, message: error.message };
    
    revalidatePath('/');
    return { success: true, message: "Subscription activated!" };
}

// --- ANALYSIS HISTORY ---

export async function saveAnalysisToHistory(
  analysis: AnalysisOutput,
  prediction: PredictionOutput,
  imageUrls: (string | null)[]
): Promise<ActionResponse> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Not authenticated' };

  const validImageUrls = imageUrls.filter((url): url is string => url !== null);

  const { error } = await supabase.from('analyses').insert({
    user_id: user.id,
    asset_symbol: analysis.asset || 'Unknown',
    prediction_data: prediction,
    analysis_data: analysis,
    image_urls: validImageUrls,
  });

  if (error) {
    console.error("Error saving analysis:", error);
    return { success: false, message: 'Failed to save analysis to history.' };
  }

  return { success: true, message: 'Analysis saved to database.' };
}
// ... existing imports ...

// ... [Keep all previous code unchanged up to getUserAnalyses] ...

export async function getUserAnalyses(): Promise<{ data: HistoricalPrediction[]; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient(cookieStore);
  
  // 1. Get the current authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: [], error: 'User not authenticated' };
  }

  // 2. Fetch data ONLY for this user_id
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', user.id) // <--- CRITICAL FIX: Filter by user_id
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: error.message };

  const history: HistoricalPrediction[] = data.map((item) => ({
    id: item.id,
    date: item.created_at,
    asset: item.asset_symbol,
    prediction: item.prediction_data,
    analysis: item.analysis_data,
    imagePreviewUrls: item.image_urls,
    imagePreviewUrl: item.image_urls?.[0] || '',
    manualFlag: item.manual_flag,
  }));

  return { data: history, error: null };
}

// ... [Keep the rest of the file unchanged] ...

export async function updateAnalysisFlag(analysisId: string, flag: 'successful' | 'unsuccessful'): Promise<ActionResponse> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient(cookieStore);

  const { error } = await supabase
    .from('analyses')
    .update({ manual_flag: flag })
    .eq('id', analysisId);

  if (error) return { success: false, message: error.message };
  revalidatePath('/performance');
  return { success: true, message: 'Flag updated.' };
}

export async function deleteAnalysisAction(analysisId: string): Promise<ActionResponse> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient(cookieStore);

  const { error } = await supabase
    .from('analyses')
    .delete()
    .eq('id', analysisId);

  if (error) return { success: false, message: error.message };
  revalidatePath('/performance');
  return { success: true, message: 'Analysis deleted.' };
}

// --- ALERT SYSTEM ACTIONS ---

export async function createAlertAction(alert: Omit<AlertConfig, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string; alert?: AlertConfig }> {
  try {
    const cookieStore = await cookies();
    const supabase = await createSupabaseServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Not authenticated' };

    const { data, error } = await supabase
      .from('alerts')
      .insert({
        user_id: user.id,
        name: alert.name,
        asset: alert.asset,
        condition_type: alert.conditionType,
        value: Number(alert.value), 
        notification_method: alert.notificationMethod,
        is_active: alert.isActive,
        original_price: alert.originalPrice,
        category: alert.category,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase Error:", error);
      return { success: false, message: `Database error: ${error.message}` };
    }

    const newAlert: AlertConfig = {
      id: data.id,
      createdAt: data.created_at,
      name: data.name,
      asset: data.asset,
      conditionType: data.condition_type,
      value: data.value,
      notificationMethod: data.notification_method,
      isActive: data.is_active,
      originalPrice: data.original_price,
      category: data.category,
    };

    try {
      revalidatePath('/alerts');
    } catch (e) {
      // Ignore
    }
    
    return { success: true, message: 'Alert created successfully', alert: newAlert };
  } catch (err) {
    console.error("Server Action Crash:", err);
    return { success: false, message: "An internal server error occurred." };
  }
}

export async function getAlertsAction(): Promise<{ data: AlertConfig[], error: string | null }> {
  try {
    const cookieStore = await cookies();
    const supabase = await createSupabaseServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: error.message };

    const alerts: AlertConfig[] = data.map((item: any) => ({
      id: item.id,
      createdAt: item.created_at,
      name: item.name,
      asset: item.asset,
      conditionType: item.condition_type,
      value: item.value,
      notificationMethod: item.notification_method,
      isActive: item.is_active,
      originalPrice: item.original_price,
      category: item.category,
    }));

    return { data: alerts, error: null };
  } catch (err) {
    console.error("Fetch Alerts Crash:", err);
    return { data: [], error: "Failed to load alerts." };
  }
}

export async function deleteAlertAction(alertId: string): Promise<{ success: boolean; message: string }> {
  try {
    const cookieStore = await cookies();
    const supabase = await createSupabaseServerClient(cookieStore);
    
    const { error } = await supabase.from('alerts').delete().eq('id', alertId);

    if (error) return { success: false, message: error.message };
    
    revalidatePath('/alerts');
    return { success: true, message: 'Alert deleted' };
  } catch (e) {
    return { success: false, message: "Server error" };
  }
}

export async function toggleAlertStatusAction(alertId: string, isActive: boolean): Promise<{ success: boolean; message: string }> {
  try {
    const cookieStore = await cookies();
    const supabase = await createSupabaseServerClient(cookieStore);
    
    const { error } = await supabase
      .from('alerts')
      .update({ is_active: isActive })
      .eq('id', alertId);

    if (error) return { success: false, message: error.message };
    
    revalidatePath('/alerts');
    return { success: true, message: 'Alert updated' };
  } catch (e) {
    return { success: false, message: "Server error" };
  }
}

// --- NOTIFICATION SYSTEM ACTIONS ---
export async function getNotificationsAction(): Promise<{ data: AppNotification[], error: string | null }> {
  try {
    const cookieStore = await cookies();
    const supabase = await createSupabaseServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { data: [], error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50); 

    if (error) return { data: [], error: error.message };

    const notifications: AppNotification[] = data.map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type as NotificationType,
      read: n.read,
      timestamp: n.created_at,
      relatedLink: n.related_link,
      iconName: n.icon_name,
    }));

    return { data: notifications, error: null };
  } catch (e) {
    return { data: [], error: "Failed to fetch notifications" };
  }
}

export async function createNotificationAction(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): Promise<void> {
  try {
    const cookieStore = await cookies();
    const supabase = await createSupabaseServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    await supabase.from('notifications').insert({
      user_id: user.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: false,
      related_link: notification.relatedLink,
      icon_name: notification.iconName,
    });
    
    revalidatePath('/notifications');
  } catch (e) {
    console.error("Failed to create notification:", e);
  }
}

export async function markNotificationReadAction(notificationId: string): Promise<void> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient(cookieStore);
  
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);
    
  revalidatePath('/notifications');
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if(!user) return;

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id);
    
  revalidatePath('/notifications');
}

export async function deleteNotificationAction(notificationId: string): Promise<void> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient(cookieStore);
  
  await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);
    
  revalidatePath('/notifications');
}

export async function clearAllNotificationsAction(): Promise<void> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if(!user) return;

  await supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.id);
    
  revalidatePath('/notifications');
}