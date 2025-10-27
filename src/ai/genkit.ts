
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Check for Google API Key for the googleAI plugin
if (!process.env.GOOGLE_API_KEY && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.warn(
    '\n🚨 GENKIT WARNING: GOOGLE_API_KEY or GOOGLE_APPLICATION_CREDENTIALS environment variable is not set. \n' +
    'The googleAI plugin (used for Gemini models) may not function correctly or might cause errors during initialization. \n' +
    'Please ensure GOOGLE_API_KEY is set in your .env.local file if you intend to use Google AI models via Genkit.\n'
  );
  // Depending on how strictly Genkit or its plugins handle missing keys during instantiation,
  // this could be a source of silent failure or crashes during server startup/compilation.
}

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash-latest',
});
