
'use server';
/**
 * @fileOverview Analyzes structured market data using ICT concepts,
 * potentially considering active trading sessions and selected timeframes, and provides conceptual guidance.
 *
 * - analyzeMarketData - A function that provides conceptual ICT analysis on market data.
 * - AnalyzeMarketDataInput - The input type for the analyzeMarketData function.
 * - AnalyzeMarketDataOutput - The return type for the analyzeMarketData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TradingSessionEnum = z.enum([
  "None/Overlap",
  "Asia",
  "London Open",
  "London Close",
  "New York AM",
  "New York PM"
]).optional();

const TimeframeEnum = z.enum([
  "1min", "5min", "15min", "30min", "1hr", "2hr", "4hr", "Daily", "Weekly"
]).optional();

const AnalyzeMarketDataInputSchema = z.object({
  assetSymbol: z.string().describe("The trading symbol, e.g., BTC/USD"),
  currentPrice: z.number().describe("The current price of the asset."),
  recentHigh: z.number().describe("The most recent significant high price."),
  recentLow: z.number().describe("The most recent significant low price."),
  marketTrendDescription: z.string().describe("A brief description of the current observed trend by the user, e.g., 'short-term uptrend, consolidating near highs', 'strong downtrend after breaking support'."),
  keyLevelsDescription: z.string().optional().describe("User's description of any nearby key support/resistance, order blocks or FVGs visually identified or known, eg., 'approaching daily order block at 50000', 'FVG present between 48000-48200'."),
  activeTradingSession: TradingSessionEnum.describe("The current active trading session as perceived by the user, e.g., 'London Open', 'New York AM'. This helps contextualize potential session-specific liquidity events or patterns like the Silver Bullet."),
  selectedTimeframe: TimeframeEnum.describe("The primary chart timeframe the user is analyzing, e.g., '15min', '1hr', 'Daily'. This guides the focus of the analysis.")
});
export type AnalyzeMarketDataInput = z.infer<typeof AnalyzeMarketDataInputSchema>;

const AnalyzeMarketDataOutputSchema = z.object({
  potentialBias: z.enum(["Bullish", "Bearish", "Neutral"]).describe("The AI's inferred short-term conceptual bias based on the provided context and ICT principles, relevant to the selected timeframe."),
  keyObservations: z.array(z.string()).describe("List of key conceptual observations based on ICT principles, e.g., 'Price approaching potential sell-side liquidity below recentLow on the 1hr chart', 'Possible manipulation above recentHigh if HTF trend is down.'"),
  suggestedFocusICT: z.string().describe("What an ICT trader might conceptually be looking for next, considering the selected timeframe, HTF context, and LTF entry possibilities, e.g., 'Look for CHoCH below recentLow on 15min if 4hr bias is bearish, then seek 1min/5min FVG for entry', 'Monitor for SMR at key resistance on selected timeframe if price sweeps recentHigh before continuing lower.'"),
  confidence: z.enum(["Low", "Medium", "High"]).describe("Confidence in this conceptual analysis."),
  
  suggestedActionDirection: z.enum(["Buy", "Sell", "Consider Holding/Neutral", "Avoid/Wait"]).describe("A general suggested action direction based on the analysis. This is conceptual and not financial advice."),
  potentialEntryZone: z.string().optional().describe("A conceptual price range or level for potential entry, e.g., 'around 49500-49800', or 'on a pullback to the support near 1.2345 on the 15min chart'. This is conceptual and not financial advice."),
  potentialTakeProfitZone: z.string().optional().describe("A conceptual price range for potential take profit, e.g., 'targeting the recent high around 52000 on the 1hr chart', or 'towards the next resistance at 1.2500'. This is conceptual and not financial advice."),
  potentialStopLossLevel: z.string().optional().describe("A conceptual price level for stop loss, e.g., 'below the recent low of 48000 on the 4hr chart', or 'just above the identified resistance at 1.2250'. This is conceptual and not financial advice."),
  conceptualTimeframe: z.string().optional().describe("A general conceptual timeframe for the idea, aligning with the user's selected timeframe, e.g., 'Intraday (within the day)', 'Short-term (few hours to a day)', 'Swing (few days)'. This is conceptual and not financial advice."),
  reasoningForNonICTUser: z.string().describe("A simplified explanation for the suggested action, avoiding complex ICT jargon, suitable for a beginner. This is conceptual and not financial advice.")
});
export type AnalyzeMarketDataOutput = z.infer<typeof AnalyzeMarketDataOutputSchema>;

export async function analyzeMarketData(input: AnalyzeMarketDataInput): Promise<AnalyzeMarketDataOutput> {
  return analyzeMarketDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMarketDataPrompt',
  input: {schema: AnalyzeMarketDataInputSchema}, 
  output: {schema: AnalyzeMarketDataOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert trading analyst. Your goal is to provide two types of analysis based on the provided market data for asset {{{assetSymbol}}}:
1.  **ICT-Specific Analysis**: For traders familiar with Inner Circle Trader (ICT) concepts.
2.  **Simplified Guidance**: For users less familiar with ICT, offering conceptual direction, potential price zones, and simplified reasoning.

**ALL OUTPUT IS FOR EDUCATIONAL AND CONCEPTUAL PURPOSES ONLY AND IS NOT FINANCIAL ADVICE.**

Market Data:
- Current Price: {{{currentPrice}}}
- Recent Significant High: {{{recentHigh}}}
- Recent Significant Low: {{{recentLow}}}
- User's Trend Description: "{{{marketTrendDescription}}}"
- User's Key Levels Description: "{{{keyLevelsDescription}}}"
{{#if activeTradingSession}}- User's Perceived Trading Session: **{{{activeTradingSession}}}**.{{/if}}
{{#if selectedTimeframe}}- User's Selected Chart Timeframe: **{{selectedTimeframe}}**. This is the primary timeframe for analysis.{{/if}}

**Part 1: ICT-Specific Analysis**
Based on core ICT principles (Liquidity Pools, Market Structure shifts (CHoCH/BOS), Order Blocks, Fair Value Gaps (FVG), Smart Money Reversals (SMR), MMXM, Power of 3 - AMD), {{#if selectedTimeframe}}considering the user's selected chart timeframe of **{{selectedTimeframe}}** as the primary focus{{else}}for general intraday to short-term analysis{{/if}}:
- Determine a conceptual short-term BIAS (Bullish, Bearish, Neutral) relevant to the {{#if selectedTimeframe}}'{{selectedTimeframe}}' timeframe{{else}}prevailing short-term conditions{{/if}}.
- Provide 2-3 KEY OBSERVATIONS from an ICT perspective relevant to the {{#if selectedTimeframe}}'{{selectedTimeframe}}' timeframe{{else}}current market structure{{/if}}.
  - Consider potential liquidity targets visible or likely influencing this timeframe.
  - How does current price relate to described key zones and recent highs/lows on this timeframe?
  {{#if activeTradingSession}}- If the session is 'London Open' or 'New York AM', briefly mention common liquidity phenomena (e.g., Judas swing) relevant to the {{#if selectedTimeframe}}'{{selectedTimeframe}}' timeframe{{else}}session context{{/if}} and session.{{/if}}
  {{#if selectedTimeframe}}- Conceptually align your observations with a plausible Higher Timeframe (HTF) narrative (e.g., if {{selectedTimeframe}} is 15min, is price reacting at a 1hr HTF Point of Interest (POI)? Is the HTF trend supporting or opposing moves on the {{selectedTimeframe}}?). If no strong HTF context is obvious from the data, you can state that.{{/if}}
- Suggest what an ICT trader might be looking for NEXT as a conceptual focus (suggestedFocusICT), especially on the {{#if selectedTimeframe}}'{{selectedTimeframe}}' timeframe{{else}}appropriate short-term timeframes{{/if}} or a Lower Timeframe (LTF) for entry/confirmation.
  {{#if selectedTimeframe}}- For LTF considerations, mention how one might refine entries based on {{selectedTimeframe}} structures (e.g., "if a bullish OB forms on {{selectedTimeframe}}, look for LTF confirmation like a 1min/5min CHoCH + FVG for entry").{{/if}}
  {{#if isNewYorkAMSession}}- Given New York AM, mention conceptual "Silver Bullet" considerations potentially aligning with the {{#if selectedTimeframe}}'{{selectedTimeframe}}' timeframe{{else}}current market phase{{/if}}: liquidity sweep, displacement creating FVG, retracement to FVG.{{/if}}
  {{#if isLondonOpenSession}}- Given London Open, mention conceptual Judas Swing from Asian range, then reversal/expansion, potential FVG entry, especially as it relates to the {{#if selectedTimefame}}'{{selectedTimeframe}}' timeframe's structures{{else}}session's typical price action{{/if}}.{{/if}}
- State your CONFIDENCE (Low, Medium, High) in this ICT-specific conceptual analysis for the given context.

**Part 2: Simplified Guidance (Conceptual & Educational - NOT FINANCIAL ADVICE)**
Based on the overall analysis (including your ICT insights, but explained simply):
- **suggestedActionDirection**: What general direction might be considered? (Buy, Sell, Consider Holding/Neutral, Avoid/Wait).
- **potentialEntryZone**: If action is Buy/Sell, what is a conceptual price area for entry? (e.g., "around current price if X happens", "on a pullback to X level {{#if selectedTimeframe}}on the {{selectedTimeframe}} chart{{/if}}"). If Neutral/Avoid, this might be N/A.
- **potentialTakeProfitZone**: If action is Buy/Sell, what is a conceptual target area? (e.g., "towards recent high Y", "near resistance Z {{#if selectedTimeframe}}on the {{selectedTimeframe}} chart{{/if}}"). If Neutral/Avoid, this might be N/A.
- **potentialStopLossLevel**: If action is Buy/Sell, what is a conceptual level for a stop loss? (e.g., "below recent low A {{#if selectedTimeframe}}on the {{selectedTimeframe}} chart{{/if}}", "above resistance B"). If Neutral/Avoid, this might be N/A.
- **conceptualTimeframe**: What's a general, conceptual timeframe for this idea? (e.g., "Intraday", "Short-term (few hours to a day)", "Swing (few days)"). {{#if selectedTimeframe}}This should align with or be slightly broader than the user's selected {{selectedTimeframe}}. For instance, a 15-minute selected timeframe might lead to an 'Intraday' or 'Short-term (few hours)' conceptual timeframe for an idea.{{else}}Base this on the overall market conditions described.{{/if}}
- **reasoningForNonICTUser**: Explain the suggestion in simple terms, avoiding ICT jargon. Focus on basic concepts like trend, support/resistance, and momentum if applicable. For example, "The trend appears to be upward on the selected timeframe, and the price is near a support level, suggesting a potential bounce." or "The price is at a strong resistance level on the chosen chart after a long upward move, suggesting caution or potential for a pullback."

**IMPORTANT**: Reiterate that all suggestions in Part 2 are conceptual, for educational understanding of market dynamics, and ARE NOT financial advice or direct trade signals. The user must do their own research and consider their risk tolerance.

Output MUST be in valid JSON.
`,
});

const analyzeMarketDataFlow = ai.defineFlow(
  {
    name: 'analyzeMarketDataFlow',
    inputSchema: AnalyzeMarketDataInputSchema,
    outputSchema: AnalyzeMarketDataOutputSchema,
  },
  async input => {
    const isNewYorkAMSession = input.activeTradingSession === "New York AM";
    const isLondonOpenSession = input.activeTradingSession === "London Open";

    const effectiveInput = {
      ...input,
      activeTradingSession: input.activeTradingSession === "None/Overlap" ? undefined : input.activeTradingSession,
      selectedTimeframe: input.selectedTimeframe || undefined, // Ensure undefined if not provided
      isNewYorkAMSession,
      isLondonOpenSession,
    };
    
    const {output} = await prompt(effectiveInput);
    return output!;
  }
);
