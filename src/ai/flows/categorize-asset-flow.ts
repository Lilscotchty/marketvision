
'use server';

/**
 * @fileOverview Categorizes a financial asset symbol into a specific type using AI.
 *
 * - categorizeAsset - A function that identifies the category of a given asset symbol.
 * - CategorizeAssetInput - The input type for the categorizeAsset function.
 * - CategorizeAssetOutput - The return type for the categorizeAsset function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AssetCategoryEnum = z.enum(['Forex', 'Crypto', 'Stock', 'Index', 'Commodity', 'Unknown']);
export type AssetCategory = z.infer<typeof AssetCategoryEnum>;

const CategorizeAssetInputSchema = z.object({
  symbol: z.string().describe("The financial asset symbol to categorize, e.g., 'EURUSD', 'BTC/USD', 'AAPL', 'USO', 'SPX'."),
});
export type CategorizeAssetInput = z.infer<typeof CategorizeAssetInputSchema>;

const CategorizeAssetOutputSchema = z.object({
  category: AssetCategoryEnum.describe("The determined category of the asset."),
});
export type CategorizeAssetOutput = z.infer<typeof CategorizeAssetOutputSchema>;

export async function categorizeAsset(input: CategorizeAssetInput): Promise<CategorizeAssetOutput> {
  return categorizeAssetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeAssetPrompt',
  input: {schema: CategorizeAssetInputSchema},
  output: {schema: CategorizeAssetOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert financial asset classifier. Your task is to categorize the given symbol into one of the following types: Forex, Crypto, Stock, Index, Commodity, or Unknown.

- **Forex:** Currency pairs, e.g., EUR/USD, GBPJPY, EURUSD.
- **Crypto:** Cryptocurrencies, e.g., BTC/USD, ETH-USDT, SOL.
- **Stock:** Publicly traded company stocks, e.g., AAPL, TSLA, GOOGL.
- **Index:** Market indices, e.g., SPX, .DJI, NSDQ.
- **Commodity:** Raw materials or primary agricultural products, e.g., XAU/USD (Gold), USO (Oil ETF), CORN.
- **Unknown:** If the symbol does not fit any of the above categories or is ambiguous.

Analyze the following symbol: {{{symbol}}}

Output MUST be in JSON format according to the defined schema.
`,
});

const categorizeAssetFlow = ai.defineFlow(
  {
    name: 'categorizeAssetFlow',
    inputSchema: CategorizeAssetInputSchema,
    outputSchema: CategorizeAssetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
