'use client';

import { useState, useCallback } from 'react';
import claudeClient, { Message } from '@/lib/ai/claude';

interface UseAIAssistantProps {
  initialMessages?: Message[];
  onMessageSent?: (message: Message) => void;
  onResponseReceived?: (message: Message) => void;
  onError?: (error: Error) => void;
}

export const useAIAssistant = ({
  initialMessages = [],
  onMessageSent,
  onResponseReceived,
  onError,
}: UseAIAssistantProps = {}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Check if client is initialized
  const isInitialized = useCallback(() => {
    return claudeClient.isInitialized();
  }, []);

  // Set API key
  const setApiKey = useCallback((apiKey: string) => {
    claudeClient.setApiKey(apiKey);
  }, []);

  // Send a message
  const sendMessage = useCallback(async (
    content: string,
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      stream?: boolean;
      onStreamMessage?: (content: string) => void;
    } = {}
  ) => {
    if (!claudeClient.isInitialized()) {
      const error = new Error('Claude client is not initialized');
      setError(error);
      if (onError) onError(error);
      return null;
    }

    const userMessage: Message = {
      role: 'user',
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (onMessageSent) onMessageSent(userMessage);

    setIsLoading(true);
    setError(null);

    try {
      const assistantMessage = await claudeClient.sendMessage(
        [...messages, userMessage],
        options
      );

      setMessages((prev) => [...prev, assistantMessage]);
      if (onResponseReceived) onResponseReceived(assistantMessage);

      return assistantMessage;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (onError) onError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [messages, onMessageSent, onResponseReceived, onError]);

  // Generate drawing suggestions
  const generateDrawingSuggestions = useCallback(async (prompt: string) => {
    if (!claudeClient.isInitialized()) {
      const error = new Error('Claude client is not initialized');
      setError(error);
      if (onError) onError(error);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const suggestions = await claudeClient.generateDrawingSuggestions(prompt);

      const userMessage: Message = {
        role: 'user',
        content: `Can you suggest some drawing ideas related to: ${prompt}?`,
      };

      const assistantMessage: Message = {
        role: 'assistant',
        content: 'Here are some drawing ideas:\n\n' + suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n\n'),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      if (onMessageSent) onMessageSent(userMessage);
      if (onResponseReceived) onResponseReceived(assistantMessage);

      return suggestions;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (onError) onError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [onMessageSent, onResponseReceived, onError]);

  // Generate art tutorial
  const generateArtTutorial = useCallback(async (topic: string) => {
    if (!claudeClient.isInitialized()) {
      const error = new Error('Claude client is not initialized');
      setError(error);
      if (onError) onError(error);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tutorial = await claudeClient.generateArtTutorial(topic);

      const userMessage: Message = {
        role: 'user',
        content: `Can you provide a tutorial on how to draw/paint ${topic}?`,
      };

      const assistantMessage: Message = {
        role: 'assistant',
        content: tutorial,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      if (onMessageSent) onMessageSent(userMessage);
      if (onResponseReceived) onResponseReceived(assistantMessage);

      return tutorial;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (onError) onError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onMessageSent, onResponseReceived, onError]);

  // Provide drawing feedback
  const provideDrawingFeedback = useCallback(async (imageUrl: string) => {
    if (!claudeClient.isInitialized()) {
      const error = new Error('Claude client is not initialized');
      setError(error);
      if (onError) onError(error);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const feedback = await claudeClient.provideDrawingFeedback(imageUrl);

      const userMessage: Message = {
        role: 'user',
        content: 'Can you provide feedback on my drawing?',
      };

      const assistantMessage: Message = {
        role: 'assistant',
        content: feedback,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      if (onMessageSent) onMessageSent(userMessage);
      if (onResponseReceived) onResponseReceived(assistantMessage);

      return feedback;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (onError) onError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onMessageSent, onResponseReceived, onError]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    isInitialized,
    setApiKey,
    sendMessage,
    generateDrawingSuggestions,
    generateArtTutorial,
    provideDrawingFeedback,
    clearMessages,
  };
};

export default useAIAssistant;