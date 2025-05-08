'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AnimatedPanel, AnimatedButton } from '@/components/ui/AnimatedComponents';
import claudeClient, { Message } from '@/lib/ai/claude';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your drawing assistant. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!claudeClient.isInitialized());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle API key submission
  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      claudeClient.setApiKey(apiKey.trim());
      setShowApiKeyInput(false);
    }
  };

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Check if Claude client is initialized
    if (!claudeClient.isInitialized()) {
      setShowApiKeyInput(true);
      return;
    }
    
    const userMessage: Message = {
      role: 'user',
      content: input,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send message to Claude
      const assistantMessage = await claudeClient.sendMessage([
        ...messages,
        userMessage,
      ]);
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message to Claude:', error);
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again later.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate drawing suggestions
  const handleGenerateSuggestions = async () => {
    if (isLoading || !claudeClient.isInitialized()) return;
    
    setIsLoading(true);
    
    try {
      const suggestions = await claudeClient.generateDrawingSuggestions('creative drawing ideas');
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: 'Can you suggest some creative drawing ideas?',
        },
        {
          role: 'assistant',
          content: 'Here are some creative drawing ideas:\n\n' + suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n\n'),
        },
      ]);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: 'Can you suggest some creative drawing ideas?',
        },
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error generating suggestions. Please try again later.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate art tutorial
  const handleGenerateTutorial = async () => {
    if (isLoading || !claudeClient.isInitialized()) return;
    
    setIsLoading(true);
    
    try {
      const tutorial = await claudeClient.generateArtTutorial('basic portrait');
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: 'Can you provide a tutorial on drawing basic portraits?',
        },
        {
          role: 'assistant',
          content: tutorial,
        },
      ]);
    } catch (error) {
      console.error('Error generating tutorial:', error);
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: 'Can you provide a tutorial on drawing basic portraits?',
        },
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error generating the tutorial. Please try again later.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPanel isOpen={isOpen} onClose={onClose} direction="right" className="w-80 h-full p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">AI Drawing Assistant</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-200"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {showApiKeyInput ? (
        <div className="bg-yellow-50 p-4 rounded-lg mb-4">
          <h3 className="font-medium text-yellow-800 mb-2">API Key Required</h3>
          <p className="text-sm text-yellow-700 mb-3">
            Please enter your Anthropic API key to use the AI assistant.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Anthropic API key"
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
          <AnimatedButton onClick={handleApiKeySubmit} variant="primary" size="sm">
            Submit API Key
          </AnimatedButton>
        </div>
      ) : (
        <>
          <div className="flex space-x-2 mb-4">
            <AnimatedButton
              onClick={handleGenerateSuggestions}
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={isLoading}
            >
              Drawing Ideas
            </AnimatedButton>
            <AnimatedButton
              onClick={handleGenerateTutorial}
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={isLoading}
            >
              Art Tutorial
            </AnimatedButton>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-lg p-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-3 p-3 rounded-lg ${
                  message.role === 'assistant'
                    ? 'bg-blue-50 text-blue-800'
                    : 'bg-gray-200 text-gray-800 ml-4'
                }`}
              >
                <div className="text-xs font-medium mb-1">
                  {message.role === 'assistant' ? 'Assistant' : 'You'}
                </div>
                <div className="whitespace-pre-line text-sm">{message.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="mb-3 p-3 rounded-lg bg-blue-50 text-blue-800">
                <div className="text-xs font-medium mb-1">Assistant</div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 p-2 border border-gray-300 rounded"
              disabled={isLoading}
            />
            <AnimatedButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading || !input.trim()}
            >
              Send
            </AnimatedButton>
          </form>
        </>
      )}
    </AnimatedPanel>
  );
};

export default AIAssistant;