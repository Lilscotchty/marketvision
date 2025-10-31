
'use server';

/**
 * @fileOverview Predicts market movement based on candlestick chart analysis.
 *
 * - predictMarketMovement - Predicts market movements from candlestick chart images.
 * - PredictMarketMovementInput - Input type for the predictMarketMovement function.
 * - PredictMarketMovementOutput - Return type for the predictMarketMovement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictMarketMovementInputSchema = z.object({
  candlestickChartDataUri: z
    .string()
    .describe(
      "A photo of a candlestick chart, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PredictMarketMovementInput = z.infer<typeof PredictMarketMovementInputSchema>;

const PredictMarketMovementOutputSchema = z.object({
  prediction: z.object({
    priceTarget: z.number().describe('The predicted price target, derived from a visible resistance or support level.'),
    stopLossLevel: z.number().describe('The recommended stop-loss level, placed logically beyond a key support or resistance point.'),
    confidenceLevel: z
      .number()
      .describe('The confidence level of the prediction (0-1).'),
    marketDirection: z
      .enum(['UP', 'DOWN', 'NEUTRAL'])
      .describe('Predicted direction of market movement'),
    rationale: z.string().describe('Explanation of why the model made this prediction, including which specific chart features were used to determine the price target and stop-loss.'),
  }),
});
export type PredictMarketMovementOutput = z.infer<typeof PredictMarketMovementOutputSchema>;

export async function predictMarketMovement(
  input: PredictMarketMovementInput
): Promise<PredictMarketMovementOutput> {
  return predictMarketMovementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictMarketMovementPrompt',
  input: {schema: PredictMarketMovementInputSchema},
  output: {schema: PredictMarketMovementOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert financial analyst and trader specializing in technical analysis from candlestick charts. Your task is to analyze the provided chart image and generate a conceptual trade idea based on market structure and liquidity.

**Analysis Steps:**

1.  **Determine Market Direction:** Analyze the chart to predict the most likely short-term market direction (UP, DOWN, or NEUTRAL). Consider the overall trend, recent momentum, and any structural shifts (like a Break of Structure or Change of Character).

2.  **Identify Key Structural and Liquidity Levels:**
    *   **Protective Level:** Identify the most significant, recent structural level that would invalidate a trade in your predicted direction.
        *   For an UP prediction, this is a key **support** level (e.g., a recent swing low, a clear bullish order block).
        *   For a DOWN prediction, this is a key **resistance** level (e.g., a recent swing high, a clear bearish order block).
    *   **Liquidity Target:** Identify the most logical, recent price level where liquidity might be resting, which would serve as a natural take-profit zone.
        *   For an UP prediction, this is typically a recent **swing high** or a significant area of resistance.
        *   For a DOWN prediction, this is typically a recent **swing low** or a significant area of support.

3.  **Set Price Target and Stop-Loss:**
    *   **If predicting UP:**
        *   Set the \`priceTarget\` to the identified **liquidity target** (the swing high/resistance).
        *   Set the \`stopLossLevel\` to a value just **below** the identified **protective level** (the swing low/support).
    *   **If predicting DOWN:**
        *   Set the \`priceTarget\` to the identified **liquidity target** (the swing low/support).
        *   Set the \`stopLossLevel\` to a value just **above** the identified **protective level** (the swing high/resistance).
    *   **If predicting NEUTRAL:** Set both \`priceTarget\` and \`stopLossLevel\` to 0.
    *   **CRITICAL RULE:** The \`priceTarget\` and \`stopLossLevel\` must NOT be the same value unless the direction is NEUTRAL.

4.  **Determine Confidence:** Based on the clarity of the market structure and the quality of the identified levels, assign a \`confidenceLevel\` between 0 and 1.

5.  **Write Rationale:** In the \`rationale\` field, clearly explain your reasoning. You MUST state which specific visual feature you used for the price target (e.g., "Price target is set at the recent swing high around [price] which is a key liquidity zone.") and which feature you used for the stop-loss (e.g., "Stop-loss is placed just below the bullish order block at [price] to protect the position.").

**Analyze the following candlestick chart:**

Candlestick Chart: {{media url=candlestickChartDataUri}}

Output MUST be in valid JSON format according to the defined schema.
`,
});

const predictMarketMovementFlow = ai.defineFlow(
  {
    name: 'predictMarketMovementFlow',
    inputSchema: PredictMarketMovementInputSchema,
    outputSchema: PredictMarketMovementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
