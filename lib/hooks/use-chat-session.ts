'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/components/auth/auth-provider';

export interface ChatSession {
  id: string;
  user_id: string;
  title: string | null;
  model: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  message_count: number;
  total_tokens: number;
  is_archived: boolean;
  metadata: any;
  chat_history_summary: string | null;
  summary_updated_at: string | null;
  messages_since_summary: number;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  model?: string;
  tokens_used?: number;
  tool_calls?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export function useChatSession() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessionMessages, setSessionMessages] = useState<Record<string, ChatMessage[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch all sessions for the user
  const fetchSessions = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat/sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load chat sessions');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch messages for a specific session
  const fetchSessionMessages = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      setSessionMessages(prev => ({
        ...prev,
        [sessionId]: data.messages || []
      }));
      return data.messages || [];
    } catch (err) {
      console.error('Error fetching messages:', err);
      return [];
    }
  }, [user]);

  // Create a new session
  const createSession = useCallback(async (title?: string) => {
    if (!user) return null;

    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      
      if (!response.ok) throw new Error('Failed to create session');
      
      const data = await response.json();
      const newSession = data.session;
      
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setCurrentSession(newSession);
      setSessionMessages(prev => ({ ...prev, [newSession.id]: [] }));
      
      return newSession;
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create new chat session');
      return null;
    }
  }, [user]);

  // Switch to a different session
  const switchSession = useCallback(async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    setCurrentSessionId(sessionId);
    setCurrentSession(session);

    // Fetch messages if not already loaded
    if (!sessionMessages[sessionId]) {
      await fetchSessionMessages(sessionId);
    }
  }, [sessions, sessionMessages, fetchSessionMessages]);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/chat/sessions?sessionId=${sessionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete session');
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setSessionMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[sessionId];
        return newMessages;
      });
      
      // If deleting current session, clear it
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setCurrentSession(null);
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      setError('Failed to delete chat session');
    }
  }, [user, currentSessionId]);

  // Archive/unarchive a session
  const toggleArchiveSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          is_archived: !session.is_archived
        })
      });
      
      if (!response.ok) throw new Error('Failed to update session');
      
      const data = await response.json();
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? data.session : s
      ));
      
      if (currentSessionId === sessionId) {
        setCurrentSession(data.session);
      }
    } catch (err) {
      console.error('Error updating session:', err);
      setError('Failed to update chat session');
    }
  }, [user, sessions, currentSessionId]);

  // Rename a session
  const renameSession = useCallback(async (sessionId: string, title: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, title })
      });
      
      if (!response.ok) throw new Error('Failed to rename session');
      
      const data = await response.json();
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? data.session : s
      ));
      
      if (currentSessionId === sessionId) {
        setCurrentSession(data.session);
      }
    } catch (err) {
      console.error('Error renaming session:', err);
      setError('Failed to rename chat session');
    }
  }, [user, currentSessionId]);

  // Add a message to the current session (optimistic update)
  const addMessageToSession = useCallback((sessionId: string, message: Partial<ChatMessage>) => {
    if (!user) return;

    const newMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      session_id: sessionId,
      user_id: user.id,
      role: message.role || 'user',
      content: message.content || '',
      model: message.model,
      tokens_used: message.tokens_used,
      tool_calls: message.tool_calls,
      metadata: message.metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...message
    };

    setSessionMessages(prev => ({
      ...prev,
      [sessionId]: [...(prev[sessionId] || []), newMessage]
    }));
  }, [user]);

  // Get messages for current session
  const getCurrentMessages = useCallback(() => {
    if (!currentSessionId) return [];
    return sessionMessages[currentSessionId] || [];
  }, [currentSessionId, sessionMessages]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    // Subscribe to session updates
    const sessionSubscription = supabase
      .channel('chat_sessions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_sessions',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Session change:', payload);
        
        if (payload.eventType === 'INSERT') {
          setSessions(prev => [payload.new as ChatSession, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setSessions(prev => prev.map(s => 
            s.id === payload.new.id ? payload.new as ChatSession : s
          ));
          if (currentSessionId === payload.new.id) {
            setCurrentSession(payload.new as ChatSession);
          }
        } else if (payload.eventType === 'DELETE') {
          setSessions(prev => prev.filter(s => s.id !== payload.old.id));
          if (currentSessionId === payload.old.id) {
            setCurrentSessionId(null);
            setCurrentSession(null);
          }
        }
      })
      .subscribe();

    // Subscribe to message updates for current session
    let messageSubscription: any;
    if (currentSessionId) {
      messageSubscription = supabase
        .channel(`chat_messages:${currentSessionId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${currentSessionId}`
        }, (payload) => {
          console.log('New message:', payload);
          setSessionMessages(prev => ({
            ...prev,
            [currentSessionId]: [...(prev[currentSessionId] || []), payload.new as ChatMessage]
          }));
        })
        .subscribe();
    }

    return () => {
      sessionSubscription.unsubscribe();
      if (messageSubscription) {
        messageSubscription.unsubscribe();
      }
    };
  }, [user, currentSessionId, supabase]);

  // Load sessions on mount
  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, fetchSessions]);

  return {
    sessions,
    currentSession,
    currentSessionId,
    sessionMessages,
    isLoading,
    error,
    createSession,
    switchSession,
    deleteSession,
    toggleArchiveSession,
    renameSession,
    fetchSessionMessages,
    addMessageToSession,
    getCurrentMessages,
    refreshSessions: fetchSessions
  };
}