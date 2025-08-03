declare module 'ai/react' {
  import { ChangeEvent, FormEvent } from 'react';

  export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt?: Date | string;
  }

  export interface UseChatOptions {
    api?: string;
    id?: string;
    initialMessages?: Message[];
    onError?: (error: Error) => void;
    onFinish?: (message: Message) => void;
    onResponse?: (response: Response) => void | Promise<void>;
    headers?: Record<string, string> | Headers;
    body?: any;
    credentials?: RequestCredentials;
  }

  export interface UseChatHelpers {
    messages: Message[];
    input: string;
    handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
    error: Error | undefined;
    append: (message: Message | { role: 'user' | 'assistant'; content: string }) => void;
    reload: () => void;
    stop: () => void;
    setInput: (input: string) => void;
    setMessages: (messages: Message[]) => void;
  }

  export function useChat(options?: UseChatOptions): UseChatHelpers;
}

declare module 'ai' {
  import { ReadableStream } from 'stream/web';
  
  export interface StreamTextResult {
    toDataStreamResponse(): Response;
    toTextStreamResponse(): Response;
    toAIStream(): ReadableStream;
    pipeTextStreamToResponse(response: Response): void;
  }

  export interface StreamTextOptions {
    model: any;
    messages: any[];
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
    system?: string;
    onFinish?: (result: { text: string; usage: any }) => void | Promise<void>;
  }

  export function streamText(options: StreamTextOptions): Promise<StreamTextResult>;
}