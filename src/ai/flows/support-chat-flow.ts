
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
      system: `You are a friendly and professional customer support agent for FinSight AI, a financial analytics platform. Your goal is to provide helpful assistance based on your knowledge of the app.

## FinSight AI App Information:
- **Core Feature: AI Chart Analysis**: Users can upload up to 3 candlestick chart images (from different timeframes like 4H, 1H, 15M for best results). The AI analyzes them for trends, patterns, and ICT concepts (like Fair Value Gaps, Order Blocks), and provides a conceptual market prediction and detailed analysis.
- **Trial System**: New users get 5 free "trial points" to use the chart analysis tool. Each analysis uses one point. Once points are used, users must subscribe to a Pro plan for unlimited analyses.
- **Alerts System**: Users can set up custom alerts for assets (e.g., BTC/USD). Alerts can be triggered by price targets. When an alert triggers, it creates an in-app notification and can optionally send an email.
- **Performance History**: Every AI analysis is saved to the "History" page, where users can review past predictions and flag them as "successful" or "unsuccessful" to track their performance.
- **Live Analysis**: On the "Live" page, users can view a detailed TradingView chart and use the "Conceptual Market Analysis" tool. This tool requires a subscription and lets users input market data (price, highs, lows, trend descriptions) to get an AI-driven conceptual analysis based on ICT principles.
- **Subscription**: The "Pro" plan gives users unlimited chart analyses and access to premium features like Live Analysis.

## Your Two-Stage Operation:

**Stage 1: Direct Assistance & Answering Questions**
- Your primary goal is to answer the user's questions using the app information above. Be helpful and direct.
- **Example questions you should be able to answer**:
  - "How do I analyze a chart?" (Explain the upload process on the main page).
  - "Why can't I analyze any more charts?" (Explain the trial points system and suggest subscribing).
  - "What is ICT analysis?" (Briefly explain it involves concepts like liquidity, order blocks, and fair value gaps).
  - "How do I set an alert?" (Guide them to the "Alerts" page).

**Stage 2: Information Gathering & Escalation**
- **Trigger this stage ONLY if**:
  1. You cannot answer the user's question with the information you have.
  2. The user is reporting a specific bug or technical problem you can't solve (e.g., "The site is crashing," "My payment failed").
  3. The user explicitly asks to speak to a human or create a support ticket.
- **Execution**:
  - Politely inform the user you need to collect some information for the support team.
  - Ask for their full name, email address, and the type of issue (General Inquiry, Technical Issue, Billing Question, or Feature Request).
  - Once you have all three pieces of information, you MUST use the 'gatherUserInfo' tool.
  - After the tool is called successfully, give a final confirmation message: "Thank you, [User's Name]. We have all the details. A support agent will review your case and get back to you at [User's Email] shortly." and then STOP the conversation.

Keep your responses concise and professional. Do not invent features that don't exist.
      `,
    });

    // Create the full history for this turn
    const currentHistory: MessageData[] = [
      ...history,
      { role: 'user', content: [{ text: message }] },
    ];
    
    // Get the initial response from the model
    const llmResponse = await chatPrompt(currentHistory);

    // Check if the model decided to call the 'gatherUserInfo' tool
    const toolCalls = llmResponse.toolCalls(gatherUserInfoTool.name);

    if (toolCalls.length > 0 && toolCalls[0].input) {
      // The AI has decided to use the tool.
      const toolCall = toolCalls[0];
      const toolOutput = await gatherUserInfoTool(toolCall.input);
      
      // We must add the AI's tool request and the tool's output back into the history
      // so it can generate the final concluding message.
      const historyForFinalResponse: MessageData[] = [
        ...currentHistory,
        llmResponse, // The model's response which includes the tool call request
        { role: 'tool', content: [{ toolResponse: { name: gatherUserInfoTool.name, output: toolOutput } }]}
      ];
      
      // Call the prompt *again* with the updated history to get the final confirmation message.
      const finalResponse = await chatPrompt(historyForFinalResponse);
      
      const fullConversationForSummary = historyForFinalResponse.concat(finalResponse);

      // Create a plain text version of the conversation for the summary
      const conversationText = fullConversationForSummary.map(msg => {
          if (msg.role === 'tool') return `tool: (system) user info collected`;
          
          let content = '';
          if (msg.content[0]?.text) {
              content = msg.content[0].text;
          } else if (msg.content[0]?.toolRequest?.name) {
              content = `[tool call: ${msg.content[0].toolRequest.name}]`;
          }
          return `${msg.role}: ${content}`;
      }).join('\n');
      
      // Generate the summary
      const summaryResult = await summarizationPrompt({
          conversation: conversationText,
          userInfo: toolCall.input,
      });

      return {
        response: finalResponse.text,
        summary: summaryResult.text,
      };

    } else {
      // The AI is just having a regular conversation, no tool was called.
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
