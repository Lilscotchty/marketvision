
'use server';

/**
 * @fileOverview A flow to simulate sending an email notification.
 *
 * - sendEmailNotification - Simulates sending an email.
 */

import {ai} from '@/ai/genkit';
import type { SendEmailInput, SendEmailOutput } from '@/types';
import { SendEmailInputSchema, SendEmailOutputSchema } from '@/types';


export async function sendEmailNotification(
  input: SendEmailInput
): Promise<SendEmailOutput> {
  return sendEmailNotificationFlow(input);
}

const sendEmailNotificationFlow = ai.defineFlow(
  {
    name: 'sendEmailNotificationFlow',
    inputSchema: SendEmailInputSchema,
    outputSchema: SendEmailOutputSchema,
  },
  async (input) => {
    // In a real application, you would integrate with an email service like SendGrid, AWS SES, etc.
    // For this simulation, we'll just log the action to the console.
    console.log('--- SIMULATING EMAIL ---');
    console.log(`From: pb7552212@gmail.com (Admin)`);
    console.log(`To: ${input.to}`);
    console.log(`Subject: ${input.subject}`);
    console.log(`Body: ${input.body}`);
    console.log('------------------------');

    // Simulate a successful response.
    return {
      success: true,
      message: `Email successfully simulated for delivery to ${input.to}.`,
    };
  }
);
