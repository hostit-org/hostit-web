'use client';

import { useRef, useEffect } from 'react';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Card } from '@/components/shared/ui/card';
import { Send, Bot, User, Loader2, Settings, Plus } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { useChat, type Message } from '@/lib/hooks/use-chat';

export default function ChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: '/api/chat',
    onError: (error: Error) => {
      console.error('Chat error:', error);
    },
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    }
  }, [user, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSubmit(e);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between bg-background">
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">AI Assistant</h1>
              <p className="text-sm text-muted-foreground">
                Powered by Gemini 2.5 Flash with MCP Tools
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/mcp')}
              title="MCP Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.reload()}
              title="New Chat"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <Bot className="h-16 w-16 text-muted-foreground/50" />
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Start a conversation
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Ask me anything! I can help with various tasks using MCP tools
                  connected to your account.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput('What MCP tools are available?');
                    const form = document.querySelector('form') as HTMLFormElement;
                    form?.requestSubmit();
                  }}
                >
                  What tools are available?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput('Help me with a coding task');
                    const form = document.querySelector('form') as HTMLFormElement;
                    form?.requestSubmit();
                  }}
                >
                  Coding help
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput('Analyze some data for me');
                    const form = document.querySelector('form') as HTMLFormElement;
                    form?.requestSubmit();
                  }}
                >
                  Data analysis
                </Button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message: Message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    } rounded-lg px-4 py-3`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    {message.createdAt && (
                      <p
                        className={`text-xs mt-1 ${
                          message.role === 'user'
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {formatTime(new Date(message.createdAt))}
                      </p>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-4 bg-background">
          <form onSubmit={onSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>

      {/* Sidebar - Tool Status */}
      <div className="w-80 border-l bg-muted/30 p-4 hidden lg:block">
        <h3 className="font-semibold mb-4">MCP Tools Status</h3>
        <Card className="p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Connected Servers</span>
              <span className="text-sm font-medium">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Available Tools</span>
              <span className="text-sm font-medium">0</span>
            </div>
          </div>
        </Card>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => router.push('/mcp')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage MCP Servers
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => router.push('/tools')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Browse Tools
            </Button>
          </div>
        </div>

        <div className="mt-6 p-3 bg-background rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Tip:</strong> Connect MCP servers to enable powerful tools
            like GitHub integration, database queries, and more.
          </p>
        </div>
      </div>
    </div>
  );
}