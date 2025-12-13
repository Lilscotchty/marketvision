'use server';

/**
 * @fileOverview Analyzes candlestick chart images to identify patterns, trends, basic ICT elements,
 * and apply a conceptual Daily Bias determination framework based on visual information from multiple timeframes.
 * It also auto-detects the asset symbol from the chart.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// --- 1. NEW: Asset Identification Schema & Flow ---

const IdentifyAssetInputSchema = z.object({
  chartImageUrl: z.string().url().describe("The URL of the chart image to identify.")
});

const IdentifyAssetOutputSchema = z.object({
  symbol: z.string().describe("The asset symbol identified (e.g., BTC-USD, AAPL, EURUSD). Return 'UNKNOWN' if not visible."),
  timeframe: z.string().describe("The timeframe identified (e.g., 15m, 1h, 4h, 1d). Return '1d' as default if not visible."),
});

export const identifyAssetPrompt = ai.definePrompt({
  name: 'identifyAssetPrompt',
  input: { schema: IdentifyAssetInputSchema },
  output: { schema: IdentifyAssetOutputSchema },
  model: 'googleai/gemini-2.5-flash',
  prompt: `Look at the following chart image and identify the Asset Symbol and the Timeframe.
  
  Chart: {{media url=chartImageUrl}}
  
  - For Crypto, format as SYMBOL-USD (e.g., BTC-USD).
  - For Forex, format as SYMBOL=X (e.g., EURUSD=X) if possible, otherwise standard.
  - For Stocks, use the ticker (e.g., NVDA).
  
  If unsure, return 'UNKNOWN'.`
});

export const identifyAsset = ai.defineFlow(
  {
    name: 'identifyAssetFlow',
    inputSchema: IdentifyAssetInputSchema,
    outputSchema: IdentifyAssetOutputSchema,
  },
  async (input) => {
    const { output } = await identifyAssetPrompt(input);
    return output!;
  }
);

// --- 2. UPDATED: Main Analysis Schema to accept Market Data ---

const AnalyzeCandlestickChartInputSchema = z.object({
  chartImageUrls: z.array(z.string().url()).describe(
    "An array of public URLs of candlestick chart images. The AI should analyze them cohesively."
  ),
  marketDataContext: z.string().optional().describe(
    "Raw CSV-style or JSON string of recent historical OHLCV market data for this asset to assist analysis."
  )
});
export type AnalyzeCandlestickChartInput = z.infer<typeof AnalyzeCandlestickChartInputSchema>;

const ICTElementSchema = z.object({
  type: z.enum([
    "Order Block (Bullish)", 
    "Order Block (Bearish)", 
    "Fair Value Gap (Bullish)", 
    "Fair Value Gap (Bearish)", 
    "Liquidity Pool (Buy-side)", 
    "Liquidity Pool (Sell-side)",
    "Breaker Block (Bullish)",
    "Breaker Block (Bearish)"
  ]).describe("The type of ICT element identified."),
  location_description: z.string().describe("A textual description of where this element is visually located on the chart, referencing the timestamp or date from the chart's x-axis if visible.")
});

const DailyBiasReasoningSchema = z.object({
  drawOnLiquidityAnalysis: z.string().optional().describe("Visual interpretation of the current draw on liquidity (IRL to ERL or ERL to IRL). Example: 'Chart suggests price tapped an internal FVG (IRL) and may now be seeking external range liquidity like the visible swing high.'"),
  timeBasedLiquidityAnalysis: z.string().optional().describe("Visual observations regarding previous significant candle highs/lows. Example: 'Price shows displacement above what appears to be the previous major daily candle's high, suggesting continuation.' or 'A sweep above the prior candle's high without displacement, potential reversal.'"),
  ltfConfirmationOutlook: z.string().optional().describe("Conceptual LTF structure to look for that would align with the inferred daily bias. Example: 'If bias is bullish, look for LTF accumulation patterns or a break of structure upwards after a pullback.'"),
  openingPriceConfluence: z.string().optional().describe("Observations about how price is reacting relative to visually apparent opening price levels (if discernible). Example: 'Price is currently trading below what might be the weekly open, aligning with a bullish bias if entries are sought at a discount.'"),
});

const SniperEntrySetupSchema = z.object({
  dailyBiasContext: z.object({
    fourHourAnalysis: z.string().describe("Step 1 & 2: Conceptual analysis of the 4H/1H structure, identifying the likely daily bias, the key MSS, and the untapped Breaker Block that sets the stage."),
    alignment: z.string().describe("Confirmation that the 1H structure aligns with the 4H bias and the BB is the focus.")
  }).optional(),
  entryMechanic: z.object({
    fifteenMinSetup: z.string().describe("Step 3: Description of the 15M liquidity grab (wick sweep) into or near the Breaker Block."),
    fiveMinConfirmation: z.string().describe("Step 4: Description of the 5M MSS confirmation after the liquidity grab, specifically highlighting the creation of a new Fair Value Gap (FVG) or Breaker Block that can be used for entry.")
  }).optional(),
  tradeManagement: z.object({
    entryPrice: z.number().describe("Step 5 (Entry): The PRECISE, NUMERIC entry price based on the verified market data and visual FVG/Breaker."),
    stopLossPrice: z.number().describe("Step 5 (Stop Loss): The precise, numeric stop loss price placed logically just beyond the liquidity grab wick."),
    takeProfitPrice: z.number().describe("Step 5 (Take Profit): The precise, numeric take profit price targeting the most recent logical swing high/low.")
  }).optional()
}).optional().describe("A conceptual trade setup based on the 'Intraday Sniper Entry' strategy if a similar pattern is visually identifiable on the chart.");


const AnalyzeCandlestickChartOutputSchema = z.object({
  asset: z.string().describe("The asset symbol identified from the chart, e.g., 'BTC/USD', 'EUR/USD', 'AAPL'. If timeframes are not visible, return 'Unclear'."),
  timeframesDetected: z.array(z.string()).optional().describe("An array of the timeframes identified from each chart, e.g., ['4H', '15M', '5M']."),
  trend: z.string().describe('The identified trend in the candlestick chart.'),
  patterns: z.array(z.string()).describe('The candlestick patterns identified in the chart.'),
  summary: z.string().describe('A summary of the analysis of the candlestick chart, incorporating daily bias insights and market data confirmation.'),
  ictElements: z.array(ICTElementSchema).optional().describe("Key ICT elements identified visually on the chart, such as Order Blocks or Fair Value Gaps."),
  marketStructureAnalysis: z.string().optional().describe("Observations on market structure like Break of Structure (BOS) or Change of Character (CHoCH), if visually discernible."),
  potentialAMDCycle: z.object({
    phase: z.enum(["Accumulation", "Manipulation", "Distribution (Markup)", "Distribution (Markdown)", "Unclear"]).optional().describe("The potential AMD phase observed or suggested by the chart."),
    reasoning: z.string().optional().describe("Brief reasoning for the potential AMD phase identification.")
  }).optional().describe("A conceptual observation about a potential Accumulation, Manipulation, Distribution (AMD) cycle phase suggested by the chart's price action."),
  inferredDailyBias: z.enum(["Bullish", "Bearish", "Neutral", "Unclear"]).optional().describe("The overall daily bias inferred from the visual analysis using the structured Daily Bias Determination framework."),
  dailyBiasReasoning: DailyBiasReasoningSchema.optional().describe("Detailed reasoning for the inferred daily bias based on visual interpretation of the chart according to the Daily Bias Determination steps."),
  sniperEntrySetup: SniperEntrySetupSchema.describe("A conceptual trade setup based on the 'Intraday Sniper Entry' strategy if a similar pattern is visually identifiable on the chart.")
});
export type AnalyzeCandlestickChartOutput = z.infer<typeof AnalyzeCandlestickChartOutputSchema>;

export async function analyzeCandlestickChart(input: AnalyzeCandlestickChartInput): Promise<AnalyzeCandlestickChartOutput> {
  return analyzeCandlestickChartFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCandlestickChartPrompt',
  input: {schema: AnalyzeCandlestickChartInputSchema},
  output: {schema: AnalyzeCandlestickChartOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert financial analyst specializing in multi-timeframe candlestick chart pattern recognition, Inner Circle Trader (ICT) concepts, and determining Daily Market Bias.

You have been provided with:
1. **Visual Charts:** One or more candlestick chart images.
2. **Market Data Context (Optional):** Recent historical OHLCV data for the asset identified in the chart.

**CRITICAL INSTRUCTION: Data Cross-Referencing**
If 'Market Data Context' is provided, you **MUST** use it to validate your visual observations.
* **Trend Confirmation:** Compare visual trend with the numerical Close prices.
* **Precision:** When identifying entry, stop-loss, or take-profit levels (especially in the Sniper Entry section), **use the specific High/Low/Close values from the market data** that correspond to the visual candles (e.g., the liquidity sweep candle). Do not rely solely on pixel estimation if data is available.

**Analysis Steps:**

1.  **Standard Analysis (Multi-Timeframe Context):**
    * **Identify Asset & Timeframes:** First, identify the asset symbol and timeframe.
    * **Overall Trend:** Determine the prevailing market trend.
    * **Candlestick Patterns:** Identify any significant candlestick patterns.
    * **ICT Elements:** Visually identify key ICT elements (Order Blocks, FVGs, Breaker Blocks). **For each element's location, reference the specific date and time from the chart's x-axis.**
    * **Market Structure:** Comment on BOS/CHoCH.
    * **Potential AMD Cycle:** Suggest if the charts indicate Accumulation, Manipulation, or Distribution.
    * **Daily Bias:** Apply the visual framework to infer the Daily Bias.

2.  **Intraday Sniper Entry Strategy Analysis:**
    * **CONDITION:** ONLY if multiple charts are provided.
    * **Strategy:** Map the visual charts to the 4H/1H Bias -> 15M Sweep -> 5M Entry model.
    * **Trade Management (USE DATA):**
        * **Entry:** Determine price for optimal entry (e.g., retest of FVG/Breaker).
        * **Stop Loss:** Determine price just beyond the 15M liquidity grab wick (using High/Low from data).
        * **Take Profit:** Determine price of the most logical recent swing high/low (using High/Low from data).

3.  **Summary:** Concise summary.

Analyze the following:
{{#if marketDataContext}}
**MARKET DATA CONTEXT:**
{{marketDataContext}}
{{/if}}

{{#each chartImageUrls}}
Chart: {{media url=this}}
{{/each}}

Output MUST be in JSON format.
`,
});

const analyzeCandlestickChartFlow = ai.defineFlow(
  {
    name: 'analyzeCandlestickChartFlow',
    inputSchema: AnalyzeCandlestickChartInputSchema,
    outputSchema: AnalyzeCandlestickChartOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);