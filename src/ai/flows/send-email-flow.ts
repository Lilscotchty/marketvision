
'use server';

/**
 * @fileOverview A flow to simulate sending an email notification.
 *
 * - sendEmailNotification - Simulates sending an email.
 * - SendEmailInput - The input type for the sendEmailNotification function.
 * - SendEmailOutput - The return type for the sendEmailNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SendEmailInputSchema = z.object({
  to: z.string().email().describe('The email address of the recipient.'),
  subject: z.string().describe('The subject of the email.'),
  body: z.string().describe('The HTML body of the email.'),
});
export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

export const SendEmailOutputSchema = z.object({
  success: z.boolean().describe('Whether the email was sent successfully.'),
  message: z.string().describe('A confirmation message.'),
});
export type SendEmailOutput = z.infer<typeof SendEmailOutputSchema>;

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
