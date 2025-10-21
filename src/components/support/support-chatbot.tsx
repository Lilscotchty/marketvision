
'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { MessageData } from 'genkit';
import { supportChat, type SupportChatOutput } from '@/ai/flows/support-chat-flow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, Bot, Loader2, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function SupportChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm the FinSight AI assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    // Convert our simplified message format to Genkit's MessageData
    const history: MessageData[] = messages.map((msg) => ({
      role: msg.role,
      content: [{ text: msg.content }],
    }));

    try {
      const result: SupportChatOutput = await supportChat({ history, message: input });

      const modelMessage: Message = { role: 'model', content: result.response };
      setMessages((prev) => [...prev, modelMessage]);

      if (result.summary) {
        setSummary(result.summary);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'model',
        content: 'Sorry, I encountered an error. Please try again later.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      toast({
        title: 'Summary Copied!',
        description: 'The support summary has been copied to your clipboard.',
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'model' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <Bot size={20} />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[75%] rounded-lg px-4 py-2 text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {message.content}
              </div>
              {message.role === 'user' && (
                 <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <User size={20} />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
               <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <Bot size={20} />
              </div>
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {summary && (
        <div className="p-4 border-t">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ClipboardCheck className="text-accent" /> Support Summary
              </CardTitle>
              <CardDescription>
                This summary will be sent to our support team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">{summary}</p>
              <Button onClick={handleCopySummary} size="sm" variant="outline" className="mt-4">
                Copy Summary
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {!summary && (
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your issue..."
              autoComplete="off"
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
