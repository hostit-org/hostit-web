'use client';

import { useState, useCallback, useRef, FormEvent, ChangeEvent } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date | string;
}

export interface UseChatOptions {
  api?: string;
  onError?: (error: Error) => void;
  onFinish?: (message: Message) => void;
}

export function useChat({ api = '/api/chat', onError, onFinish }: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    console.log('=== CHAT SUBMIT ===');
    console.log('Input:', input);
    console.log('Loading:', isLoading);
    
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date(),
    };

    console.log('User message:', userMessage);

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Create new message for assistant
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      abortControllerRef.current = new AbortController();
      
      const requestBody = {
        messages: [...messages, userMessage],
      };
      
      console.log('Sending request to:', api);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let accumulatedContent = '';
      console.log('Starting to read stream...');

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('Stream ended');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.log('Raw chunk received:', chunk);
        
        // The response is coming as plain text, not Vercel AI SDK format
        // Just accumulate the text directly
        accumulatedContent += chunk;
        
        // Update the assistant message with accumulated content
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
            // Create a new message object to trigger re-render
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              content: accumulatedContent
            };
            console.log('Updated message content:', accumulatedContent.length, 'chars');
          }
          return newMessages;
        });
      }

      // Call onFinish if provided
      if (onFinish) {
        const finalMessage = {
          ...assistantMessage,
          content: accumulatedContent,
        };
        onFinish(finalMessage);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error('Error in chat:', error);
        
        // Remove the empty assistant message
        setMessages(prev => prev.slice(0, -1));
        
        if (onError && error instanceof Error) {
          onError(error);
        }
        
        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          createdAt: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, isLoading, messages, api, onError, onFinish]);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
    setMessages,
    stop,
  };
}