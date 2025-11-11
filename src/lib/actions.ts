
'use server';

import { z } from 'zod';
import { predictMarketMovement } from '@/ai/flows/predict-market-movement';
import { analyzeCandlestickChart } from '@/ai/flows/analyze-candlestick-chart';
import { categorizeAsset } from '@/ai/flows/categorize-asset-flow';
import type { PredictionOutput, AnalysisOutput, AlphaVantageGlobalQuote, MarketNewsItem, AssetCategory } from '@/types';

export interface AnalysisResult {
  prediction?: PredictionOutput;
  analysis?: AnalysisOutput;
  error?: string;
  imagePreviewUrls?: (string | null)[];
}

export async function handleImageAnalysisAction(
  chartUrls: string[]
): Promise<AnalysisResult> {

  if (!chartUrls || chartUrls.length === 0) {
    return { error: "No chart images were provided." };
  }

  try {
    const predictionInput = {
        candlestickChartImageUrl: chartUrls[0]
    };
    
    const analysisInput = {
        chartImageUrls: chartUrls
    };
    
    const [predictionResult, analysisResult] = await Promise.all([
      predictMarketMovement(predictionInput),
      analyzeCandlestickChart(analysisInput)
    ]);
    
    if (analysisResult.asset === 'Unclear' && analysisResult.summary === "Timeframe not visible") {
      return {
        error: 'Could not identify timeframes on the chart. Please use a screenshot of the chart window instead of a downloaded image, as it helps capture the timeframe.'
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

  if (/^[A-Z]{6}$/.test(upperSymbol)) {
      return { type: 'forex', fromCurrency: upperSymbol.substring(0, 3), toCurrency: upperSymbol.substring(3), apiSymbol: '', originalSymbol: `${upperSymbol.substring(0, 3)}/${upperSymbol.substring(3)}` };
  }
  
  if (upperSymbol.includes('/') && upperSymbol.length === 7) {
    const parts = upperSymbol.split('/');
    if (parts.length === 2 && parts[0].length === 3 && parts[1].length === 3 && /^[A-Z]{3}$/.test(parts[0]) && /^[A-Z]{3}$/.test(parts[1])) {
      return { type: 'forex', fromCurrency: parts[0], toCurrency: parts[1], apiSymbol: '', originalSymbol: `${parts[0]}/${parts[1]}` };
    }
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
            return { error: `Could not fetch news. The API limit for the free tier may have been reached.` };
        }
    }

    const newsItems: MarketNewsItem[] = data.feed || [];
    return { data: newsItems };
  } catch (error) {
    console.error(`Failed to fetch market news:`, error);
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred while fetching news.' };
  }
}


export async function categorizeAssetAction(symbol: string): Promise<{ category: AssetCategory; error?: null } | { error: string; category?: null }> {
  try {
    const result = await categorizeAsset({ symbol });
    return { category: result.category };
  } catch (error) {
    console.error('Asset categorization failed:', error);
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred during categorization.',
    };
  }
}
