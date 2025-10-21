
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
} from '@/types';
import type { MessageData } from 'genkit';

// Define the tool for the AI to use to collect user information.
const gatherUserInfoTool = ai.defineTool(
  {
    name: 'gatherUserInfo',
    description: "Use this tool to collect the user's name, email, and the type of issue they are facing (e.g., 'Technical Issue') before ending the conversation. Only use this tool after you have determined you cannot solve the user's problem yourself.",
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
          You are a helpful assistant. Your task is to create a concise summary for a human support agent based on the provided user information and the full conversation transcript. The summary should be clear and directly actionable for the agent.

          **User Information:**
          - Name: {{userInfo.name}}
          - Email: {{userInfo.email}}
          - Issue Type: {{userInfo.issueType}}

          **Conversation Transcript:**
          {{{conversation}}}

          **Concise Summary for Support Agent:**
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
      system: `You are a friendly and professional customer support agent for FinSight AI, a financial analytics platform. Your goal is to provide helpful assistance.

Your operation has two stages:

**Stage 1: Direct Assistance**
- First, try your best to answer the user's questions directly. The platform features include AI chart analysis, real-time alerts, performance tracking, and live market data.
- If the user's question is about something you can answer (e.g., "How do I set an alert?", "What is ICT analysis?"), provide a helpful and direct response.

**Stage 2: Information Gathering & Escalation**
- If you cannot answer the question, if the user is reporting a specific problem you can't solve, or if the user explicitly asks to speak to a human, you MUST transition to this stage.
- Inform the user that you will need to collect some information to pass on to the support team.
- Politely ask for their full name, email address, and the type of issue they are facing (General Inquiry, Technical Issue, Billing Question, or Feature Request).
- Once you have gathered all three pieces of information, you MUST use the 'gatherUserInfo' tool to submit them.
- After the 'gatherUserInfo' tool has been called successfully, provide a concluding message to the user, like "Thank you, [User's Name]. We have all the details we need. A support agent will review your case and get back to you at [User's Email] shortly." Then, stop the conversation. Do not ask for more information after the tool call.

Keep your responses concise and professional.
      `,
    });

    const llmResponse = await chatPrompt({
      history: history,
      message: message,
    });

    const toolCalls = llmResponse.toolCalls(gatherUserInfoTool.name);

    if (toolCalls.length > 0 && toolCalls[0].input) {
      // The AI has decided to use the tool.
      const toolCall = toolCalls[0];
      const toolOutput = await gatherUserInfoTool(toolCall.input);
      
      // We need to add the AI's tool request and the tool's output back into the history
      // so it can generate the final concluding message.
      const newHistory: MessageData[] = [
        ...history,
        { role: 'user', content: [{ text: message }] },
        llmResponse, // The model's response which includes the tool call request
        { role: 'tool', content: [{tool, output: toolOutput}]}
      ];

      const finalResponse = await chatPrompt({
          history: newHistory,
          message: "The user's information has been collected. Please provide a concluding message." // A simple prompt to get the final message
      });
      
      const fullHistory = newHistory.concat(finalResponse);

      const conversationText = fullHistory.map(msg => {
          if (msg.role === 'tool') return `tool: (system) user info collected`;
          return `${msg.role}: ${msg.content[0]?.text || ''}`;
      }).join('\n');
      
      const summaryResult = await summarizationPrompt({
          conversation: conversationText,
          userInfo: toolCall.input,
      });

      return {
        response: finalResponse.text,
        summary: summaryResult.text,
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
