'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Card } from '@/components/shared/ui/card';
import { 
  Send, Bot, User, Loader2, Settings, Plus, 
  MessageSquare, Archive, Trash2, Edit2, Check, X, Menu
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { useChat } from '@/lib/hooks/use-chat';
import { useChatSession } from './hooks/use-chat-session';
import { cn } from '@/lib/utils';
import { formatTime, formatDate } from './utils/chat-helpers';

export default function ChatClient() {
  const { user } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const {
    sessions,
    currentSession,
    currentSessionId,
    isLoading: sessionsLoading,
    createSession,
    switchSession,
    deleteSession,
    toggleArchiveSession,
    renameSession,
    getCurrentMessages,
    addMessageToSession,
    fetchSessionMessages
  } = useChatSession();

  // Remove - we'll only use messages from use-chat hook
  // const currentMessages = getCurrentMessages();
  
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit: originalHandleSubmit, 
    isLoading, 
    setInput,
    setMessages 
  } = useChat({
    api: '/api/chat',
    onError: (error: Error) => {
      console.error('Chat error:', error);
    },
    onFinish: async (message: any) => {
      // Save assistant message to database after completion
      if (currentSessionId && message.content) {
        // Save messages to database for persistence
        // The UI will continue to use the messages from use-chat hook
        const userMsg = messages.find((m: any) => m.role === 'user' && !m.saved);
        if (userMsg) {
          await addMessageToSession(currentSessionId, {
            role: 'user',
            content: userMsg.content
          });
        }
        
        await addMessageToSession(currentSessionId, {
          role: 'assistant',
          content: message.content
        });
      }
    }
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    }
  }, [user, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sync messages from session when switching sessions only
  useEffect(() => {
    if (currentSessionId) {
      // Fetch messages for the current session
      fetchSessionMessages(currentSessionId).then(sessionMsgs => {
        if (sessionMsgs && sessionMsgs.length > 0) {
          const formattedMessages = sessionMsgs.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.created_at
          }));
          setMessages(formattedMessages as any);
        } else {
          setMessages([]);
        }
      });
    } else {
      setMessages([]);
    }
  }, [currentSessionId]); // Only trigger on session change, not on dependencies

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Create or ensure session exists
    let sessionId = currentSessionId;
    if (!sessionId) {
      const newSession = await createSession();
      if (!newSession) return;
      sessionId = newSession.id;
    }

    // Don't add message to session here - let use-chat handle it
    // This prevents duplicate messages
    
    // Call original submit with sessionId
    originalHandleSubmit(e, sessionId || undefined);
  };

  const handleNewChat = async () => {
    const newSession = await createSession();
    if (newSession) {
      setMessages([]);
    }
  };

  const handleEditSession = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle || '');
  };

  const handleSaveEdit = async () => {
    if (editingSessionId && editingTitle.trim()) {
      await renameSession(editingSessionId, editingTitle);
    }
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const activeSessions = sessions.filter(s => !s.is_archived);
  const archivedSessions = sessions.filter(s => s.is_archived);

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-full">
      {/* Sidebar */}
      <div className={cn(
        "border-r bg-muted/30 transition-all duration-300",
        sidebarOpen ? "w-80" : "w-0 overflow-hidden"
      )}>
        <div className="flex flex-col h-full">
          {/* New Chat Button */}
          <div className="p-4 border-b">
            <Button 
              onClick={handleNewChat}
              className="w-full justify-start gap-2"
              variant="default"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto">
            {sessionsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                {/* Active Sessions */}
                {activeSessions.length > 0 && (
                  <div className="p-4">
                    <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                      RECENT CHATS
                    </h3>
                    <div className="space-y-1">
                      {activeSessions.map(session => (
                        <div
                          key={session.id}
                          className={cn(
                            "group flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer",
                            currentSessionId === session.id && "bg-muted"
                          )}
                        >
                          {editingSessionId === session.id ? (
                            <div className="flex-1 flex items-center gap-1">
                              <Input
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                className="h-7 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit();
                                  if (e.key === 'Escape') handleCancelEdit();
                                }}
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={handleSaveEdit}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                              <div 
                                className="flex-1 min-w-0"
                                onClick={() => switchSession(session.id)}
                              >
                                <p className="text-sm truncate">
                                  {session.title || 'New Chat'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(session.updated_at)}
                                </p>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={() => handleEditSession(session.id, session.title || '')}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={() => toggleArchiveSession(session.id)}
                                >
                                  <Archive className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={() => deleteSession(session.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Archived Sessions */}
                {archivedSessions.length > 0 && (
                  <div className="p-4 border-t">
                    <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                      ARCHIVED
                    </h3>
                    <div className="space-y-1">
                      {archivedSessions.map(session => (
                        <div
                          key={session.id}
                          className="group flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer opacity-60"
                        >
                          <Archive className="h-4 w-4 text-muted-foreground" />
                          <div 
                            className="flex-1 min-w-0"
                            onClick={() => switchSession(session.id)}
                          >
                            <p className="text-sm truncate">
                              {session.title || 'New Chat'}
                            </p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => toggleArchiveSession(session.id)}
                            >
                              <Archive className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => deleteSession(session.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between bg-background">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Bot className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">
                {currentSession?.title || 'AI Assistant'}
              </h1>
              <p className="text-sm text-muted-foreground">
                Powered by Gemini 2.5 Flash
                {currentSession?.messages_since_summary !== undefined && currentSession.messages_since_summary >= 15 && (
                  <span className="ml-2 text-xs text-amber-600">
                    • {20 - currentSession.messages_since_summary} messages until summary
                  </span>
                )}
                {currentSession?.chat_history_summary && (
                  <span className="ml-2 text-xs text-green-600">
                    • Context preserved
                  </span>
                )}
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
                  Ask me anything! I can help with various tasks.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput('What can you help me with?');
                    const form = document.querySelector('form') as HTMLFormElement;
                    form?.requestSubmit();
                  }}
                >
                  What can you do?
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
                    setInput('Explain something to me');
                    const form = document.querySelector('form') as HTMLFormElement;
                    form?.requestSubmit();
                  }}
                >
                  Explain a concept
                </Button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message: any) => (
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
                        {formatTime(message.createdAt)}
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
          <form onSubmit={handleSubmit} className="flex gap-2">
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
    </div>
  );
}