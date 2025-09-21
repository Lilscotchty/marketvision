
'use server';

import { z } from 'zod';
import { predictMarketMovement } from '@/ai/flows/predict-market-movement';
import { analyzeCandlestickChart } from '@/ai/flows/analyze-candlestick-chart';
import type { PredictionOutput, AnalysisOutput, AlphaVantageGlobalQuote } from '@/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
  .refine(
    (file) => ALLOWED_FILE_TYPES.includes(file.type),
    'Only .jpg, .jpeg, .png, .webp, and .gif formats are supported.'
  );

const formSchema = z.object({
  chartImage1: fileSchema.optional(),
  chartImage2: fileSchema.optional(),
  chartImage3: fileSchema.optional(),
}).refine(data => data.chartImage1 || data.chartImage2 || data.chartImage3, {
  message: "Please upload at least one chart image.",
  path: ["chartImage1"], // Arbitrarily assign error to the first field
});


export interface AnalysisResult {
  prediction?: PredictionOutput;
  analysis?: AnalysisOutput;
  error?: string;
  imagePreviewUrl?: string; // Legacy support for single image
  imagePreviewUrls?: (string | null)[]; // New multi-image support
}

async function fileToDataUri(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function handleImageAnalysisAction(
  prevState: AnalysisResult | undefined,
  formData: FormData
): Promise<AnalysisResult> {
  const validatedFields = formSchema.safeParse({
    chartImage1: formData.get('chartImage1'),
    chartImage2: formData.get('chartImage2'),
    chartImage3: formData.get('chartImage3'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.chartImage1?.join(', ') || "Invalid input.",
    };
  }

  const { chartImage1, chartImage2, chartImage3 } = validatedFields.data;
  const files = [chartImage1, chartImage2, chartImage3].filter(Boolean) as File[];

  if (files.length === 0) {
      return { error: "Please upload at least one chart image." };
  }

  try {
    const dataUris = await Promise.all(files.map(fileToDataUri));
    
    const analysisInput = {
        chartDataUri1: dataUris[0],
        chartDataUri2: dataUris[1],
        chartDataUri3: dataUris[2],
    };

    // The prediction flow still only takes one image, so we'll use the first one (HTF)
    const predictionInput = {
        candlestickChartDataUri: dataUris[0]
    };
    
    // Run AI flows in parallel
    const [predictionResult, analysisResult] = await Promise.all([
      predictMarketMovement(predictionInput),
      analyzeCandlestickChart(analysisInput)
    ]);
    
    const allImageUrls = await Promise.all(
        [chartImage1, chartImage2, chartImage3].map(file => file ? fileToDataUri(file) : Promise.resolve(null))
    );

    return {
      prediction: predictionResult.prediction,
      analysis: analysisResult,
      imagePreviewUrls: allImageUrls,
    };
  } catch (error) {
    console.error('AI analysis failed:', error);
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred during AI analysis.',
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

  if (upperSymbol.includes('/') && upperSymbol.length === 7) {
    const parts = upperSymbol.split('/');
    if (parts.length === 2 && parts[0].length === 3 && parts[1].length === 3 && /^[A-Z]{3}$/.test(parts[0]) && /^[A-Z]{3}$/.test(parts[1])) {
      return { type: 'forex', fromCurrency: parts[0], toCurrency: parts[1], apiSymbol: '', originalSymbol: `${parts[0]}/${parts[1]}` };
    }
  } else if (upperSymbol.length === 6 && !upperSymbol.includes('/') && /^[A-Z]{6}$/.test(upperSymbol)) {
    const from = upperSymbol.substring(0, 3);
    const to = upperSymbol.substring(3, 6);
    return { type: 'forex', fromCurrency: from, toCurrency: to, apiSymbol: '', originalSymbol: `${from}/${to}` };
  }

  const commonFiats = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'USDT', 'USDC', 'BUSD'];
  let match;

  if (upperSymbol.includes('/')) {
      match = upperSymbol.match(/^([A-Z0-9]{2,5})\/([A-Z]{3,4})$/);
      if (match) {
          const crypto = match[1];
          const fiatMarket = match[2];
           if (commonFiats.includes(fiatMarket)) {
            return { type: 'crypto', apiSymbol: crypto, market: fiatMarket, originalSymbol: `${crypto}/${fiatMarket}` };
          }
      }
  } else {
      if (upperSymbol.length > 3 && upperSymbol.length <= 8) {
        for (const fiat of commonFiats) {
            if (upperSymbol.endsWith(fiat)) {
                const crypto = upperSymbol.substring(0, upperSymbol.length - fiat.length);
                if (crypto.length >= 2 && crypto.length <=5 && /^[A-Z0-9]+$/.test(crypto)) {
                     return { type: 'crypto', apiSymbol: crypto, market: fiat, originalSymbol: `${crypto}/${fiat}` };
                }
            }
        }
      }
  }
  
  if (!upperSymbol.includes('/') && upperSymbol.length <= 5 && /^[A-Z0-9\.]+$/.test(upperSymbol) && !commonFiats.includes(upperSymbol)) {
     return { type: 'stock', apiSymbol: upperSymbol, originalSymbol: upperSymbol };
  }

  return { type: 'unknown', apiSymbol: upperSymbol, originalSymbol: symbol };
}


export interface FetchMarketDataResult {
  data?: AlphaVantageGlobalQuote;
  error?: string;
  assetType?: 'stock' | 'forex' | 'crypto' | 'unknown';
}

export async function fetchMarketDataFromAV(symbol: string): Promise<FetchMarketDataResult> {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY;
  if (!apiKey) {
    console.warn("AlphaVantage API key is not configured. Live quote fetching is disabled.");
    return { error: 'Quote service API key is not configured.' };
  }

  const assetInfo = determineAssetType(symbol);
  let url = '';

  if (assetInfo.type === 'unknown') {
    return { error: `Symbol format "${symbol}" not recognized. Try formats like AAPL, EUR/USD, or BTC/USD.`, assetType: 'unknown' };
  }
  
  try {
    if (assetInfo.type === 'stock') {
      url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${assetInfo.apiSymbol}&apikey=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) {
        return { error: `Stock API request failed: ${response.statusText}`, assetType: 'stock' };
      }
      const data = await response.json();
      
      if (data['Error Message']) {
        return { error: `Quote service (Stock): ${data['Error Message']}`, assetType: 'stock' };
      }
      if (data['Note']) {
          console.warn('Quote service API Note (Stock):', data['Note']);
      }
      
      const globalQuote = data['Global Quote'];
      if (!globalQuote || Object.keys(globalQuote).length === 0) {
          return { error: `No stock data for "${assetInfo.apiSymbol}". It may be unsupported or not a stock.`, assetType: 'stock' };
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
    } else if (assetInfo.type === 'forex' && assetInfo.fromCurrency && assetInfo.toCurrency) {
      url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${assetInfo.fromCurrency}&to_currency=${assetInfo.toCurrency}&apikey=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) return { error: `Forex API request failed: ${response.statusText}`, assetType: 'forex' };
      const data = await response.json();
      const exchangeRateData = data['Realtime Currency Exchange Rate'];
      
      if (data['Error Message'] || !exchangeRateData) {
        return { error: data['Error Message'] || `No Forex data for ${assetInfo.fromCurrency}/${assetInfo.toCurrency}.`, assetType: 'forex' };
      }
      if (data['Note']) {
        console.warn('Quote service API Note (Forex):', data['Note']);
      }

      const rate = parseFloat(exchangeRateData['5. Exchange Rate']);
      const lastRefreshed = exchangeRateData['6. Last Refreshed']?.split(' ')[0] || new Date().toISOString().split('T')[0];
      
      return {
        data: {
          symbol: assetInfo.originalSymbol,
          open: rate, 
          high: rate,
          low: rate,
          price: rate,
          volume: 0, 
          latestTradingDay: lastRefreshed,
          previousClose: 0, 
          change: 0, 
          changePercent: '0%', 
        },
        assetType: 'forex',
      };
    } else if (assetInfo.type === 'crypto' && assetInfo.apiSymbol && assetInfo.market) {
      url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${assetInfo.apiSymbol}&market=${assetInfo.market}&apikey=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) return { error: `Crypto API request failed: ${response.statusText}`, assetType: 'crypto' };
      const data = await response.json();
      
      if (data['Error Message']) {
        return { error: data['Error Message'], assetType: 'crypto'};
      }
      if (data['Note']) {
        console.warn('Quote service API Note (Crypto):', data['Note']);
      }

      const timeSeriesKey = 'Time Series (Digital Currency Daily)';
      const timeSeries = data[timeSeriesKey];

      if (!timeSeries) {
        return { error: `No Crypto time series data for ${assetInfo.apiSymbol}/${assetInfo.market}.`, assetType: 'crypto' };
      }
      const latestDate = Object.keys(timeSeries)[0]; 
      if (!latestDate) return { error: 'No latest date in crypto time series.', assetType: 'crypto' };
      
      const latestDayData = timeSeries[latestDate];
      const openKey = `1a. open (${assetInfo.market})`;
      const highKey = `2a. high (${assetInfo.market})`;
      const lowKey = `3a. low (${assetInfo.market})`;
      const closeKey = `4a. close (${assetInfo.market})`;
      const volumeKey = `5. volume`;
      
      const altOpenKey = `1. open`;
      const altHighKey = `2. high`;
      const altLowKey = `3. low`;
      const altCloseKey = `4. close`;

      return {
        data: {
          symbol: assetInfo.originalSymbol,
          open: parseFloat(latestDayData[openKey] || latestDayData[altOpenKey]),
          high: parseFloat(latestDayData[highKey] || latestDayData[altHighKey]),
          low: parseFloat(latestDayData[lowKey] || latestDayData[altLowKey]),
          price: parseFloat(latestDayData[closeKey] || latestDayData[altCloseKey]),
          volume: parseFloat(latestDayData[volumeKey]),
          latestTradingDay: latestDate,
          previousClose: 0, 
          change: 0, 
          changePercent: '0%',
        },
        assetType: 'crypto',
      };
    } else {
      return { error: `Unsupported asset type or format for fetching: ${symbol}`, assetType: assetInfo.type };
    }

  } catch (error) {
    console.error(`Failed to fetch market data for symbol "${symbol}" (type: ${assetInfo.type}):`, error);
    return { 
        error: error instanceof Error ? error.message : 'An unexpected error occurred while fetching data.',
        assetType: assetInfo.type
    };
  }
}
