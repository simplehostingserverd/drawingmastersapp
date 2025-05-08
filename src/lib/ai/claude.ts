'use client';

import Anthropic from '@anthropic-ai/sdk';

// Define message types
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Define Claude API client
class ClaudeClient {
  private client: Anthropic | null = null;
  private apiKey: string | null = null;

  constructor() {
    // Initialize with environment variable if available
    if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      this.apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
      this.initClient();
    }
  }

  // Initialize the Anthropic client
  private initClient(): void {
    if (!this.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    this.client = new Anthropic({
      apiKey: this.apiKey,
    });
  }

  // Set API key
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.initClient();
  }

  // Get API key
  getApiKey(): string | null {
    return this.apiKey;
  }

  // Check if client is initialized
  isInitialized(): boolean {
    return this.client !== null;
  }

  // Send a message to Claude
  async sendMessage(
    messages: Message[],
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      topP?: number;
      topK?: number;
      stream?: boolean;
      onStreamMessage?: (content: string) => void;
    } = {}
  ): Promise<Message> {
    if (!this.client) {
      throw new Error('Claude client is not initialized');
    }

    const {
      model = 'claude-3-opus-20240229',
      maxTokens = 1024,
      temperature = 0.7,
      topP = 0.9,
      topK = 40,
      stream = false,
      onStreamMessage,
    } = options;

    try {
      // Format messages for Anthropic API
      const formattedMessages = messages.map((message) => ({
        role: message.role,
        content: message.content,
      }));

      if (stream && onStreamMessage) {
        // Handle streaming response
        const stream = await this.client.messages.create({
          model,
          max_tokens: maxTokens,
          temperature,
          top_p: topP,
          top_k: topK,
          messages: formattedMessages,
          stream: true,
        });

        let fullContent = '';

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.text) {
            fullContent += chunk.delta.text;
            onStreamMessage(fullContent);
          }
        }

        return {
          role: 'assistant',
          content: fullContent,
        };
      } else {
        // Handle non-streaming response
        const response = await this.client.messages.create({
          model,
          max_tokens: maxTokens,
          temperature,
          top_p: topP,
          top_k: topK,
          messages: formattedMessages,
        });

        return {
          role: 'assistant',
          content: response.content[0].text,
        };
      }
    } catch (error) {
      console.error('Error sending message to Claude:', error);
      throw error;
    }
  }

  // Generate drawing suggestions
  async generateDrawingSuggestions(prompt: string): Promise<string[]> {
    const message = await this.sendMessage([
      {
        role: 'user',
        content: `Generate 5 creative drawing ideas based on this prompt: "${prompt}". 
        Please provide specific, detailed suggestions that would make interesting drawings.
        Format your response as a list of 5 numbered items.`,
      },
    ]);

    // Parse the response to extract suggestions
    const suggestions = message.content
      .split('\n')
      .filter((line) => /^\d+\./.test(line))
      .map((line) => line.replace(/^\d+\.\s*/, '').trim());

    return suggestions.length > 0 ? suggestions : [message.content];
  }

  // Provide drawing feedback
  async provideDrawingFeedback(imageUrl: string): Promise<string> {
    const message = await this.sendMessage([
      {
        role: 'user',
        content: `I've created a drawing. Please provide constructive feedback and suggestions for improvement.
        Here's the image: ${imageUrl}
        Focus on composition, technique, use of color, and overall impact. Be specific but encouraging.`,
      },
    ]);

    return message.content;
  }

  // Generate art tutorial
  async generateArtTutorial(topic: string): Promise<string> {
    const message = await this.sendMessage([
      {
        role: 'user',
        content: `Create a step-by-step tutorial on how to draw/paint ${topic}.
        Include specific techniques, tips for beginners, and common mistakes to avoid.
        Format as a clear, numbered list of steps with explanations.`,
      },
    ]);

    return message.content;
  }
}

// Create a singleton instance
export const claudeClient = new ClaudeClient();

export default claudeClient;