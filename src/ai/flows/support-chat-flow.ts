
'use server';

/**
 * @fileOverview A support chatbot flow that uses Genkit tools to gather user information
 * and then summarizes the conversation.
 *
 * - supportChat - Handles the chat interaction and summarization.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  SupportChatInputSchema,
  type SupportChatInput,
  SupportChatOutputSchema,
  type SupportChatOutput,
  UserInfoSchema,
  type UserInfo,
} from '@/types';
import type { MessageData } from 'genkit';

// Define the tool for the AI to use to collect user information.
const gatherUserInfoTool = ai.defineTool(
  {
    name: 'gatherUserInfo',
    description: 'Use this tool to collect the user\'s name, email, and issue type.',
    inputSchema: UserInfoSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (info) => {
    // In a real app, you might save this to a database or create a support ticket.
    console.log('Tool executed with user info:', info);
    return { success: true };
  }
);

const summarizationPrompt = ai.definePrompt(
  {
      name: 'summarizationPrompt',
      input: { schema: z.object({ conversation: z.string(), userInfo: UserInfoSchema }) },
      output: { format: 'text' },
      prompt: `
          You are a helpful assistant. Based on the provided user information and conversation transcript,
          create a concise summary for a human support agent.

          **User Information:**
          - Name: {{userInfo.name}}
          - Email: {{userInfo.email}}
          - Issue Type: {{userInfo.issueType}}

          **Conversation Transcript:**
          {{conversation}}

          **Summary:**
      `,
  }
);


const supportChatFlow = ai.defineFlow(
  {
    name: 'supportChatFlow',
    inputSchema: SupportChatInputSchema,
    outputSchema: SupportChatOutputSchema,
  },
  async ({ history, message }) => {
    // The main prompt for the chatbot.
    const chatPrompt = ai.definePrompt({
      name: 'supportChatPrompt',
      tools: [gatherUserInfoTool],
      history: history,
      system: `You are a friendly and professional customer support agent for FinSight AI.
      Your goals are:
      1. Greet the user and understand their problem.
      2. Politely ask for their name, email, and the type of issue they are facing (General Inquiry, Technical Issue, Billing Question, or Feature Request).
      3. Use the 'gatherUserInfo' tool to collect this information once you have it. You must call this tool.
      4. After the tool is successfully called, provide a concluding message to the user, letting them know that an agent will follow up, and then stop the conversation. Do not ask for more information after the tool call.
      5. Keep your responses concise and to the point.
      `,
    });

    const llmResponse = await chatPrompt({ message });

    const toolCalls = llmResponse.toolCalls(gatherUserInfoTool.name);

    if (toolCalls.length > 0) {
      // The AI has decided to use the tool.
      const toolOutput = await gatherUserInfoTool(toolCalls[0].input);
      
      const finalResponse = await chatPrompt({
          message,
          toolResponse: {
            tool: gatherUserInfoTool.name,
            output: toolOutput
          }
      });
      
      const fullHistory = history.concat([
          { role: 'user', content: [{ text: message }] },
          finalResponse,
      ]);

      const conversationText = fullHistory.map(msg => `${msg.content[0].text ? `${msg.role}: ${msg.content[0].text}` : ''}`).join('\n');
      
      const summary = await summarizationPrompt({
          conversation: conversationText,
          userInfo: toolCalls[0].input,
      });

      return {
        response: finalResponse.text,
        summary: summary.text,
      };

    } else {
      // The AI is just having a regular conversation.
      return {
        response: llmResponse.text,
      };
    }
  }
);

/**
 * The main exported function that the client will call.
 */
export async function supportChat(input: SupportChatInput): Promise<SupportChatOutput> {
  return supportChatFlow(input);
}
