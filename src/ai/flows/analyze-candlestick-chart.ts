
'use server';

/**
 * @fileOverview Analyzes candlestick chart images to identify patterns, trends, basic ICT elements,
 * and apply a conceptual Daily Bias determination framework based on visual information from multiple timeframes.
 * It also auto-detects the asset symbol from the chart.
 *
 * - analyzeCandlestickChart - A function that handles the candlestick chart analysis process.
 * - AnalyzeCandlestickChartInput - The input type for the analyzeCandlestickChart function.
 * - AnalyzeCandlestickChartOutput - The return type for the analyzeCandlestickChart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AnalyzeCandlestickChartInputSchema = z.object({
  chartDataUris: z.array(z.string()).describe(
    "An array of candlestick chart images, as data URIs. The AI should analyze them cohesively, inferring timeframes from the context of the charts themselves."
  ),
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
  location_description: z.string().describe("A textual description of where this element is visually located on the chart, referencing the timestamp or date from the chart's x-axis if visible. e.g., 'around the swing low on June 5th at 14:00', 'the large green candle near the top'.")
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
    fiveMinConfirmation: z.string().describe("Step 4: Description of the 5M MSS confirmation after the liquidity grab.")
  }).optional(),
  tradeManagement: z.object({
    entry: z.string().describe("Step 5 (Entry): The ideal entry point, described conceptually (e.g., 'Entry at the retest of the 5M Breaker Block')."),
    stopLoss: z.string().describe("Step 5 (Stop Loss): The recommended stop loss placement (e.g., 'Stop loss just beyond the 15M wick high/low')."),
    takeProfit: z.string().describe("Step 5 (Take Profit): The logical take profit target (e.g., 'Targeting the most recent 15M swing high/low for profit-taking').")
  }).optional()
}).optional().describe("A conceptual trade setup based on the 'Intraday Sniper Entry' strategy if a similar pattern is visually identifiable on the chart.");


const AnalyzeCandlestickChartOutputSchema = z.object({
  asset: z.string().describe("The asset symbol identified from the chart, e.g., 'BTC/USD', 'EUR/USD', 'AAPL'. If timeframes are not visible, return 'Unclear'."),
  trend: z.string().describe('The identified trend in the candlestick chart.'),
  patterns: z.array(z.string()).describe('The candlestick patterns identified in the chart.'),
  summary: z.string().describe('A summary of the analysis of the candlestick chart, incorporating daily bias insights.'),
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
  prompt: `You are an expert financial analyst specializing in multi-timeframe candlestick chart pattern recognition, Inner Circle Trader (ICT) concepts, and determining Daily Market Bias.

You have been provided with up to three candlestick chart images. Your primary goal is to perform a cohesive, multi-timeframe analysis.

**CRITICAL FIRST STEP: Timeframe and Asset Identification**

1.  **Identify Asset:** First, try to identify the asset symbol from the chart images (e.g., BTC/USD, EUR/USD, TSLA).
2.  **Infer Timeframes:** For each image, you MUST identify its timeframe (e.g., 4-hour, 1-hour, 15-minute, 5-minute). This is often visible in a corner of the chart.

**IMPORTANT RULE:** If you CANNOT CLEARLY identify the timeframe on AT LEAST ONE of the provided charts, you MUST STOP. In this case, set the 'asset' field to "Unclear", set the 'summary' to "Timeframe not visible", and leave all other fields empty or with default values. Do not attempt any further analysis.

**If and only if timeframes are identifiable, proceed with the full analysis:**

**Analysis Steps:**

1.  **Standard Analysis (Multi-Timeframe Context):**
    *   **Overall Trend:** Determine the prevailing market trend by synthesizing information from all provided charts (e.g., "The 4H chart shows an uptrend, while the 15M chart is in a pullback.").
    *   **Candlestick Patterns:** Identify any significant candlestick patterns visible on any of the charts. Note which timeframe they appear on if relevant.
    *   **ICT Elements:** Visually identify key ICT elements on all charts. **For each element's location, you must reference the specific date and time from the chart's x-axis if visible.** For example: 'Bullish order block on the 1H chart located at the swing low on June 5th around 14:30.' Describe how elements on different timeframes interact (e.g., "LTF FVG is forming inside an HTF Order Block"). Include Order Blocks, FVGs, and especially **Breaker Blocks (Bullish/Bearish)**.
    *   **Market Structure:** Comment on visible market structure (BOS, CHoCH) on each timeframe and describe the overall structural narrative.
    *   **Potential AMD Cycle:** Suggest if the charts collectively indicate a phase of Accumulation, Manipulation, or Distribution.
    *   **Daily Bias Determination (Conceptual):** Apply the visual framework using all charts to infer the Daily Bias (Bullish, Bearish, Neutral, or Unclear) and provide reasoning.

2.  **Intraday Sniper Entry Strategy Analysis (Multi-Timeframe):**
    *   After your standard analysis, check if the charts visually present a pattern that resembles the "Intraday Sniper Entry" strategy. **Use your inferred timeframes to map the provided charts to the strategy's steps.**
    *   If a pattern is identified, populate the \`sniperEntrySetup\` object. If not, you may omit this field.
    *   **Strategy Breakdown:**
        *   **Daily Bias Setup (HTF Filter):**
            *   **Step 1 (4H):** Use the chart you've identified as the highest timeframe (ideally 4H or 1H) to conceptually describe if it shows a liquidity grab and a Market Structure Shift (MSS).
            *   **Step 1 (4H):** Identify if an untapped **Breaker Block (BB)** was formed after this MSS on that higher timeframe chart.
            *   **Step 2 (1H):** Use a medium timeframe chart (like 1H or 30M) to confirm alignment with the HTF bias and to visually verify the Breaker Block as the point of interest.
            *   Populate \`sniperEntrySetup.dailyBiasContext.fourHourAnalysis\` and \`sniperEntrySetup.dailyBiasContext.alignment\` based on these higher timeframe charts.
        *   **Intraday Sniper Entry (LTF Mechanic):**
            *   **Step 3 (15M):** Use a lower timeframe chart (like 15M or 5M) to describe if there's a visual sign of a liquidity grab wick into the identified Breaker Block.
            *   **Step 4 (5M):** Use the chart you've identified as the lowest timeframe (ideally 5M or 1M) to look for a lower-timeframe MSS confirmation after the liquidity grab.
            *   Populate \`sniperEntrySetup.entryMechanic.fifteenMinSetup\` and \`sniperEntrySetup.entryMechanic.fiveMinConfirmation\` based on these lower timeframe charts.
        *   **Trade Management:**
            *   **Step 5 (Entry, SL, TP):** Based on the visual patterns from the LTF charts, describe the conceptual entry, stop loss, and take profit points.
            *   Populate \`sniperEntrySetup.tradeManagement\` with these details.

3.  **Summary:** Provide a concise overall summary of your multi-timeframe analysis, integrating findings from all the above points.

Analyze the following candlestick charts:
{{#each chartDataUris}}
Chart: {{media url=this}}
{{/each}}

Output MUST be in JSON format according to the defined output schema. If specific elements are not clearly discernible, you may omit those fields, return empty arrays/strings, or state "Unclear" or "Not visually apparent".
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

    