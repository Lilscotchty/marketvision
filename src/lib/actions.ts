
'use server';

import { z } from 'zod';
import { predictMarketMovement } from '@/ai/flows/predict-market-movement';
import { analyzeCandlestickChart } from '@/ai/flows/analyze-candlestick-chart';
import { categorizeAsset } from '@/ai/flows/categorize-asset-flow';
import type {
  PredictionOutput,
  AnalysisOutput,
  AlphaVantageGlobalQuote,
  MarketNewsItem,
  AssetCategory,
  Role, // Added Role type
} from '@/types';
import { createSupabaseServerClient } from '@/lib/supabase/server'; // Added for Server Action
import { revalidatePath } from 'next/cache'; // Added for Server Action
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

const BUCKET_NAME = 'chart_uploads';

export interface AnalysisResult {
  prediction?: PredictionOutput;
  analysis?: AnalysisOutput;
  error?: string;
  imagePreviewUrls?: (string | null)[];
}

/**
 * Uploads an array of files to a user-specific folder in Supabase Storage.
 * This is a Server Action and must be called from a client component.
 * @param files - An array of File objects to upload.
 * @param userId - The ID of the user (can be used for folder path, though session ID is preferred).
 * @returns An array of objects, each containing either a `publicUrl` or an `error`.
 */
export async function uploadChartImages(
  files: File[],
  userId: string
): Promise<{ publicUrl: string | null; error: any }[]> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

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

  const sessionUserId = session.user.id;

  const uploadPromises = files.map(async (file) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${sessionUserId}/${uuidv4()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      return { publicUrl: null, error };
    }

    // Get the public URL for the newly uploaded file
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
    const predictionInput = {
      candlestickChartImageUrl: chartUrls[0],
    };

    const analysisInput = {
      chartImageUrls: chartUrls,
    };

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
          'Could not identify timeframes on the chart. Please use a screenshot of the chart window instead of a downloaded image, as it helps capture the timeframe.',
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

interface AssetInfo {
  type: 'stock' | 'forex' | 'crypto' | 'unknown';
  apiSymbol: string;
  fromCurrency?: string;
  toCurrency?: string;
  market?: string;
  originalSymbol: string;
}

function determineAssetType(symbol: string): AssetInfo {
  const upperSymbol = symbol.toUpperCase().trim();
  const originalSymbol = symbol;

  if (/^[A-Z]{6}$/.test(upperSymbol)) {
    return {
      type: 'forex',
      fromCurrency: upperSymbol.substring(0, 3),
      toCurrency: upperSymbol.substring(3),
      apiSymbol: '',
      originalSymbol: `${upperSymbol.substring(0, 3)}/${upperSymbol.substring(
        3
      )}`,
    };
  }

  if (upperSymbol.includes('/') && upperSymbol.length === 7) {
    const parts = upperSymbol.split('/');
    if (
      parts.length === 2 &&
      parts[0].length === 3 &&
      parts[1].length === 3 &&
      /^[A-Z]{3}$/.test(parts[0]) &&
      /^[A-Z]{3}$/.test(parts[1])
    ) {
      return {
        type: 'forex',
        fromCurrency: parts[0],
        toCurrency: parts[1],
        apiSymbol: '',
        originalSymbol: `${parts[0]}/${parts[1]}`,
      };
    }
  }

  const commonFiats = [
    'USD',
    'EUR',
    'GBP',
    'JPY',
    'CAD',
    'AUD',
    'CNY',
    'INR',
    'USDT',
    'USDC',
    'BUSD',
  ];
  let match;

  if (upperSymbol.includes('/')) {
    match = upperSymbol.match(/^([A-Z0-9]{2,5})\/([A-Z]{3,4})$/);
    if (match) {
      const crypto = match[1];
      const fiatMarket = match[2];
      if (commonFiats.includes(fiatMarket)) {
        return {
          type: 'crypto',
          apiSymbol: crypto,
          market: fiatMarket,
          originalSymbol: `${crypto}/${fiatMarket}`,
        };
      }
    }
  } else {
    if (upperSymbol.length > 3 && upperSymbol.length <= 8) {
      for (const fiat of commonFiats) {
        if (upperSymbol.endsWith(fiat)) {
          const crypto = upperSymbol.substring(
            0,
            upperSymbol.length - fiat.length
          );
          if (
            crypto.length >= 2 &&
            crypto.length <= 5 &&
            /^[A-Z0-9]+$/.test(crypto)
          ) {
            return {
              type: 'crypto',
              apiSymbol: crypto,
              market: fiat,
              originalSymbol: `${crypto}/${fiat}`,
            };
          }
        }
      }
    }
  }

  if (
    !upperSymbol.includes('/') &&
    upperSymbol.length <= 5 &&
    /^[A-Z0-9\.]+$/.test(upperSymbol) &&
    !commonFiats.includes(upperSymbol)
  ) {
    return {
      type: 'stock',
      apiSymbol: upperSymbol,
      originalSymbol: upperSymbol,
    };
  }

  return { type: 'unknown', apiSymbol: upperSymbol, originalSymbol: symbol };
}

export interface FetchMarketDataResult {
  data?: AlphaVantageGlobalQuote;
  error?: string;
  assetType?: 'stock' | 'forex' | 'crypto' | 'unknown';
}

export async function fetchMarketDataFromAV(
  symbol: string
): Promise<FetchMarketDataResult> {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY;
  if (!apiKey) {
    console.warn(
      'AlphaVantage API key is not configured. Live quote fetching is disabled.'
    );
    return { error: 'Quote service API key is not configured.' };
  }

  const assetInfo = determineAssetType(symbol);
  let url = '';

  if (assetInfo.type === 'unknown') {
    return {
      error: `Symbol format "${symbol}" not recognized. Try formats like AAPL, EUR/USD, or BTC/USD.`,
      assetType: 'unknown',
    };
  }

  try {
    if (assetInfo.type === 'stock') {
      url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${assetInfo.apiSymbol}&apikey=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) {
        return {
          error: `Stock API request failed: ${response.statusText}`,
          assetType: 'stock',
        };
      }
      const data = await response.json();

      if (data['Error Message']) {
        return {
          error: `Quote service (Stock): ${data['Error Message']}`,
          assetType: 'stock',
        };
      }
      if (data['Note']) {
        console.warn('Quote service API Note (Stock):', data['Note']);
      }

      const globalQuote = data['Global Quote'];
      if (!globalQuote || Object.keys(globalQuote).length === 0) {
        return {
          error: `No stock data for "${assetInfo.apiSymbol}". It may be unsupported or not a stock.`,
          assetType: 'stock',
        };
      }

      return {
        data: {
          symbol: globalQuote['01. symbol'] || assetInfo.originalSymbol,
          open: parseFloat(globalQuote['02. open']),
          high: parseFloat(globalQuote['03. high']),
          low: parseFloat(globalQuote['04. low']),
          price: parseFloat(globalQuote['05. price']),
          volume: parseInt(globalQuote['06. volume'], 10),
          latestTradingDay: globalQuote['07. latest trading day'],
          previousClose: parseFloat(globalQuote['08. previous close']),
          change: parseFloat(globalQuote['09. change']),
          changePercent: globalQuote['10. change percent'],
        },
        assetType: 'stock',
      };
    } else if (
      assetInfo.type === 'forex' &&
      assetInfo.fromCurrency &&
      assetInfo.toCurrency
    ) {
      // --- UPDATED FOREX BLOCK ---
      // Use FX_DAILY to get full OHLC data, not just a single rate
      url = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${assetInfo.fromCurrency}&to_symbol=${assetInfo.toCurrency}&apikey=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok)
        return {
          error: `Forex API request failed: ${response.statusText}`,
          assetType: 'forex',
        };

      const data = await response.json();

      if (data['Error Message']) {
        return { error: data['Error Message'], assetType: 'forex' };
      }
      if (data['Note']) {
        console.warn('Quote service API Note (Forex):', data['Note']);
      }

      const timeSeriesKey = 'Time Series FX (Daily)';
      const timeSeries = data[timeSeriesKey];

      if (!timeSeries) {
        return {
          error: `No Forex time series data for ${assetInfo.fromCurrency}/${assetInfo.toCurrency}.`,
          assetType: 'forex',
        };
      }

      const dates = Object.keys(timeSeries);
      if (dates.length < 2) {
        return {
          error: 'Not enough forex data to calculate change.',
          assetType: 'forex',
        };
      }

      const latestDate = dates[0];
      const previousDate = dates[1];

      const latestDayData = timeSeries[latestDate];
      const previousDayData = timeSeries[previousDate];

      const price = parseFloat(latestDayData['4. close']);
      const previousClose = parseFloat(previousDayData['4. close']);
      const change = price - previousClose;
      const changePercent = ((change / previousClose) * 100).toFixed(2) + '%';

      return {
        data: {
          symbol: assetInfo.originalSymbol,
          open: parseFloat(latestDayData['1. open']),
          high: parseFloat(latestDayData['2. high']),
          low: parseFloat(latestDayData['3. low']),
          price: price,
          volume: 0, // Forex doesn't typically provide volume
          latestTradingDay: latestDate,
          previousClose: previousClose,
          change: change,
          changePercent: changePercent,
        },
        assetType: 'forex',
      };
      // --- END UPDATED FOREX BLOCK ---
    } else if (
      assetInfo.type === 'crypto' &&
      assetInfo.apiSymbol &&
      assetInfo.market
    ) {
      url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${assetInfo.apiSymbol}&market=${assetInfo.market}&apikey=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok)
        return {
          error: `Crypto API request failed: ${response.statusText}`,
          assetType: 'crypto',
        };
      const data = await response.json();

      if (data['Error Message']) {
        return { error: data['Error Message'], assetType: 'crypto' };
      }
      if (data['Note']) {
        console.warn('Quote service API Note (Crypto):', data['Note']);
      }

      const timeSeriesKey = 'Time Series (Digital Currency Daily)';
      const timeSeries = data[timeSeriesKey];

      // --- UPDATED CRYPTO BLOCK ---
      if (!timeSeries) {
        return {
          error: `No Crypto time series data for ${assetInfo.apiSymbol}/${assetInfo.market}.`,
          assetType: 'crypto',
        };
      }

      const dates = Object.keys(timeSeries); // Get all available dates
      if (dates.length < 2) {
        return {
          error: 'Not enough crypto data to calculate change.',
          assetType: 'crypto',
        };
      }

      const latestDate = dates[0]; // Today (or latest)
      const previousDate = dates[1]; // Yesterday (or previous)

      const latestDayData = timeSeries[latestDate];
      const previousDayData = timeSeries[previousDate];

      const openKey = `1a. open (${assetInfo.market})`;
      const highKey = `2a. high (${assetInfo.market})`;
      const lowKey = `3a. low (${assetInfo.market})`;
      const closeKey = `4. close`; // AlphaVantage changed this
      const volumeKey = `5. volume`;

      const altOpenKey = `1. open`;
      const altHighKey = `2. high`;
      const altLowKey = `3. low`;
      const altCloseKey = `4. close`;

      // Handle both new (e.g., '4. close') and old (e.g., '4a. close (USD)') keys
      const getSafeValue = (dayData: any, primaryKey: string, fallbackKey: string) => {
        return parseFloat(dayData[primaryKey] || dayData[fallbackKey]);
      };

      const price = getSafeValue(latestDayData, closeKey, altCloseKey);
      const previousClose = getSafeValue(
        previousDayData,
        closeKey,
        altCloseKey
      );
      const change = price - previousClose;
      const changePercent = ((change / previousClose) * 100).toFixed(2) + '%';

      return {
        data: {
          symbol: assetInfo.originalSymbol,
          open: getSafeValue(latestDayData, openKey, altOpenKey),
          high: getSafeValue(latestDayData, highKey, altHighKey),
          low: getSafeValue(latestDayData, lowKey, altLowKey),
          price: price,
          volume: parseFloat(latestDayData[volumeKey]),
          latestTradingDay: latestDate,
          previousClose: previousClose,
          change: change,
          changePercent: changePercent,
        },
        assetType: 'crypto',
      };
      // --- END UPDATED CRYPTO BLOCK ---
    } else {
      return {
        error: `Unsupported asset type or format for fetching: ${symbol}`,
        assetType: assetInfo.type,
      };
    }
  } catch (error) {
    console.error(
      `Failed to fetch market data for symbol "${symbol}" (type: ${assetInfo.type}):`,
      error
    );
    return {
      error:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while fetching data.',
      assetType: assetInfo.type,
    };
  }
}

export interface FetchNewsResult {
  data?: MarketNewsItem[];
  error?: string;
}

export async function fetchMarketNews(): Promise<FetchNewsResult> {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY;
  if (!apiKey) {
    return { error: 'News service API key is not configured.' };
  }

  const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets&limit=50&apikey=${apiKey}`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
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

    const newsItems: MarketNewsItem[] = data.feed || [];
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

// ------------------------------------------------------------------
// --- NEW FUNCTION ADDED BELOW ---
// ------------------------------------------------------------------

// This is the type for the function's response
type ActionResponse = {
  success: boolean;
  message: string;
};

// Make sure the "export" keyword is here
export async function updateUserRoles(
  userIdToUpdate: string,
  newRoles: Role[]
): Promise<ActionResponse> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  // 1. Get the *current* admin user making this request
  const {
    data: { user: adminUser },
  } = await supabase.auth.getUser();

  if (!adminUser) {
    return { success: false, message: 'Not authenticated.' };
  }

  // 2. Check if the *current* admin is an 'Owner'
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', adminUser.id)
    .single();

  if (adminProfile?.role !== 'Owner') {
    return { success: false, message: 'Access Denied: You are not an Owner.' };
  }

  // 3. Get the profile of the user to be updated
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('email, role')
    .eq('id', userIdToUpdate)
    .single();

  if (!targetProfile) {
    return { success: false, message: 'Target user not found.' };
  }

  // 4. Protect the hardcoded owner
  if (
    targetProfile.email === 'pb7552212@gmail.com' &&
    !newRoles.includes('Owner')
  ) {
    return {
      success: false,
      message: "Action Forbidden: The Owner's 'Owner' role cannot be removed.",
    };
  }

  // 5. Update the user's role in the database
  //    (This assumes a single 'role' text column)
  const newRole = newRoles.includes('Owner')
    ? 'Owner'
    : newRoles.includes('Developer')
    ? 'Developer'
    : 'User';

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userIdToUpdate);

  if (error) {
    return { success: false, message: `Database error: ${error.message}` };
  }

  // 6. Revalidate the path to refresh the data on the admin page
  revalidatePath('/admin');
  return { success: true, message: 'Roles updated successfully.' };
}
