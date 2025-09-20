
import { config } from 'dotenv';
config();

import '@/ai/flows/predict-market-movement.ts';
import '@/ai/flows/analyze-candlestick-chart.ts';
import '@/ai/flows/analyze-market-data-flow.ts'; // Added new flow
