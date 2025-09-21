
'use server';

/**
 * @fileOverview Analyzes candlestick chart images to identify patterns, trends, basic ICT elements,
 * and apply a conceptual Daily Bias determination framework based on visual information.
 *
 * - analyzeCandlestickChart - A function that handles the candlestick chart analysis process.
 * - AnalyzeCandlestickChartInput - The input type for the analyzeCandlestickChart function.
 * - AnalyzeCandlestickChartOutput - The return type for the analyzeCandlestickChart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AnalyzeCandlestickChartInputSchema = z.object({
  chartDataUri: z
    .string()
    .describe(
      "A photo of a candlestick chart, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
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
  location_description: z.string().describe("A textual description of where this element is visually located on the chart, e.g., 'around the recent swing low', 'the large green candle near the top'.")
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
  prompt: `You are an expert financial analyst specializing in candlestick chart pattern recognition, Inner Circle Trader (ICT) concepts, and determining Daily Market Bias.

Analyze the provided candlestick chart image. Your goal is to perform a comprehensive analysis, including determining a conceptual Daily Bias.

**Analysis Steps:**

1.  **Standard Analysis:**
    *   **Overall Trend:** Determine the prevailing market trend visually (e.g., Uptrend, Downtrend, Sideways).
    *   **Candlestick Patterns:** Identify any significant candlestick patterns visible (e.g., Hammer, Engulfing, Doji). List them.
    *   **ICT Elements:** Visually identify and describe key ICT elements. Include Order Blocks, FVGs, and especially **Breaker Blocks (Bullish/Bearish)**.
    *   **Market Structure:** Briefly comment on any visible market structure features like a Break of Structure (BOS) or a Change of Character (CHoCH).
    *   **Potential AMD Cycle:** Suggest if the chart might be part of an Accumulation, Manipulation, or Distribution phase.
    *   **Daily Bias Determination (Conceptual):** Apply the visual framework (IRL/ERL draw, time-based liquidity) to infer the Daily Bias (Bullish, Bearish, Neutral, or Unclear) and provide reasoning.

2.  **Intraday Sniper Entry Strategy Analysis:**
    *   After your standard analysis, check if the chart visually presents a pattern that resembles the "Intraday Sniper Entry" strategy. The analysis must be conceptual as you only have one image.
    *   If a pattern is identified, populate the \`sniperEntrySetup\` object. If not, you may omit this field or indicate that no such setup is apparent.
    *   **Strategy Breakdown:**
        *   **Daily Bias Setup (HTF Filter):**
            *   **Step 1 (4H):** Conceptually describe if the chart shows a liquidity grab followed by a Market Structure Shift (MSS) on a higher timeframe (like 4H).
            *   **Step 1 (4H):** Identify if an untapped **Breaker Block (BB)** was formed after this conceptual MSS.
            *   **Step 2 (1H):** Confirm that the visible, more immediate price action aligns with the bias set by the 4H/1H structure, and state that the BB is the point of interest.
            *   Populate \`sniperEntrySetup.dailyBiasContext.fourHourAnalysis\` and \`sniperEntrySetup.dailyBiasContext.alignment\`.
        *   **Intraday Sniper Entry (LTF Mechanic):**
            *   **Step 3 (15M):** Describe if there's a visual sign of a liquidity grab wick into or near the identified BB (e.g., a long wick sweeping a prior short-term high/low).
            *   **Step 4 (5M):** Look for a lower-timeframe confirmation, such as a candle body close past a recent small swing high/low, indicating a lower-timeframe MSS.
            *   Populate \`sniperEntrySetup.entryMechanic.fifteenMinSetup\` and \`sniperEntrySetup.entryMechanic.fiveMinConfirmation\`.
        *   **Trade Management:**
            *   **Step 5 (Entry):** Describe the conceptual entry point (e.g., "Entry on retest of the 5M Breaker Block").
            *   **Step 5 (Stop Loss):** Describe the conceptual Stop Loss placement (e.g., "Stop just beyond the high/low of the 15M sweep wick").
            *   **Step 5 (Take Profit):** Describe the conceptual Take Profit target (e.g., "Targeting the most recent significant 15M swing high/low").
            *   Populate \`sniperEntrySetup.tradeManagement\` with entry, stopLoss, and takeProfit details.

3.  **Summary:** Provide a concise overall summary of your analysis, integrating findings from all the above points.

Analyze the following candlestick chart:
{{media url=chartDataUri}}

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
