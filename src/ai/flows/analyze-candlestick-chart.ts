
'use server';

/**
 * @fileOverview Analyzes candlestick chart images to identify patterns, trends, basic ICT elements,
 * and apply a conceptual Daily Bias determination framework based on visual information from multiple timeframes.
 *
 * - analyzeCandlestickChart - A function that handles the candlestick chart analysis process.
 * - AnalyzeCandlestickChartInput - The input type for the analyzeCandlestickChart function.
 * - AnalyzeCandlestickChartOutput - The return type for the analyzeCandlestickChart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AnalyzeCandlestickChartInputSchema = z.object({
  chartDataUri1: z
    .string()
    .describe(
      "A photo of a candlestick chart (e.g., Higher Timeframe like 4H or Daily), as a data URI."
    ),
  chartDataUri2: z
    .string()
    .optional()
    .describe(
      "An optional photo of a candlestick chart from a Medium Timeframe (e.g., 1H or 15M), as a data URI."
    ),
    chartDataUri3: z
    .string()
    .optional()
    .describe(
      "An optional photo of a candlestick chart from a Lower Timeframe (e.g., 5M or 1M), as a data URI."
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

Analyze the provided candlestick chart images. The user has provided up to three images, likely representing Higher (HTF), Medium (MTF), and Lower (LTF) timeframes of the same asset. If only one image is provided, treat it as the primary timeframe and infer where possible. Use all available images to perform a cohesive, multi-timeframe analysis.

**Analysis Steps:**

1.  **Standard Analysis (Multi-Timeframe Context):**
    *   **Overall Trend:** Determine the prevailing market trend by synthesizing information from all provided charts (e.g., HTF shows uptrend, MTF is pulling back).
    *   **Candlestick Patterns:** Identify any significant candlestick patterns visible on any of the charts. Note which timeframe they appear on if relevant.
    *   **ICT Elements:** Visually identify key ICT elements. **Crucially, for each element's location, you must reference the specific date and time from the chart's x-axis if it is visible.** For example: 'Bullish order block located at the swing low on June 5th around 14:30.' Describe how elements on different timeframes interact (e.g., "LTF FVG is forming inside an HTF Order Block"). Include Order Blocks, FVGs, and especially **Breaker Blocks (Bullish/Bearish)**.
    *   **Market Structure:** Comment on visible market structure (BOS, CHoCH) on each timeframe and describe the overall structural narrative.
    *   **Potential AMD Cycle:** Suggest if the charts collectively indicate a phase of Accumulation, Manipulation, or Distribution.
    *   **Daily Bias Determination (Conceptual):** Apply the visual framework using all charts to infer the Daily Bias (Bullish, Bearish, Neutral, or Unclear) and provide reasoning.

2.  **Intraday Sniper Entry Strategy Analysis (Multi-Timeframe):**
    *   After your standard analysis, check if the charts visually present a pattern that resembles the "Intraday Sniper Entry" strategy, using the different images as proxies for the different timeframes mentioned in the strategy.
    *   If a pattern is identified, populate the \`sniperEntrySetup\` object. If not, you may omit this field.
    *   **Strategy Breakdown:**
        *   **Daily Bias Setup (HTF Filter - using Image 1):**
            *   **Step 1 (4H):** Use the first image (assumed HTF) to conceptually describe if it shows a liquidity grab and a Market Structure Shift (MSS).
            *   **Step 1 (4H):** Identify if an untapped **Breaker Block (BB)** was formed after this MSS on the HTF chart.
            *   **Step 2 (1H):** Use the second image (assumed MTF) to confirm alignment with the HTF bias and to visually verify the Breaker Block as the point of interest.
            *   Populate \`sniperEntrySetup.dailyBiasContext.fourHourAnalysis\` and \`sniperEntrySetup.dailyBiasContext.alignment\`.
        *   **Intraday Sniper Entry (LTF Mechanic - using Image 2 & 3):**
            *   **Step 3 (15M):** Use the second/third image to describe if there's a visual sign of a liquidity grab wick into the identified BB.
            *   **Step 4 (5M):** Use the third image (assumed LTF) to look for a lower-timeframe MSS confirmation.
            *   Populate \`sniperEntrySetup.entryMechanic.fifteenMinSetup\` and \`sniperEntrySetup.entryMechanic.fiveMinConfirmation\`.
        *   **Trade Management:**
            *   **Step 5 (Entry, SL, TP):** Based on the visual patterns, describe the conceptual entry, stop loss, and take profit points.
            *   Populate \`sniperEntrySetup.tradeManagement\` with these details.

3.  **Summary:** Provide a concise overall summary of your multi-timeframe analysis, integrating findings from all the above points.

Analyze the following candlestick charts:
{{#if chartDataUri1}}HTF Chart: {{media url=chartDataUri1}}{{/if}}
{{#if chartDataUri2}}MTF Chart: {{media url=chartDataUri2}}{{/if}}
{{#if chartDataUri3}}LTF Chart: {{media url=chartDataUri3}}{{/if}}

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

    
