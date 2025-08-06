'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import chatService, { ChatSession, ChatMessage } from '../services/chat-service';

export function useChatSession() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessionMessages, setSessionMessages] = useState<Record<string, ChatMessage[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모든 세션 불러오기
  const fetchSessions = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const fetchedSessions = await chatService.getSessions(user.id);
      setSessions(fetchedSessions);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load chat sessions');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 세션의 메시지 불러오기
  const fetchSessionMessages = useCallback(async (sessionId: string) => {
    if (!user) return [];

    try {
      const messages = await chatService.getMessages(sessionId);
      setSessionMessages(prev => ({
        ...prev,
        [sessionId]: messages
      }));
      return messages;
    } catch (err) {
      console.error('Error fetching messages:', err);
      return [];
    }
  }, [user]);

  // 새 세션 생성
  const createSession = useCallback(async (title?: string) => {
    if (!user) return null;

    try {
      const newSession = await chatService.createSession({ title });
      if (newSession) {
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        setCurrentSession(newSession);
        setSessionMessages(prev => ({ ...prev, [newSession.id]: [] }));
      }
      return newSession;
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create new chat session');
      return null;
    }
  }, [user]);

  // 세션 전환
  const switchSession = useCallback(async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    setCurrentSessionId(sessionId);
    setCurrentSession(session);

    // 메시지가 로드되지 않았다면 불러오기
    if (!sessionMessages[sessionId]) {
      await fetchSessionMessages(sessionId);
    }
  }, [sessions, sessionMessages, fetchSessionMessages]);

  // 세션 삭제
  const deleteSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      const success = await chatService.deleteSession(sessionId);
      if (success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        setSessionMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[sessionId];
          return newMessages;
        });
        
        // 현재 세션이 삭제되면 초기화
        if (currentSessionId === sessionId) {
          setCurrentSessionId(null);
          setCurrentSession(null);
        }
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      setError('Failed to delete chat session');
    }
  }, [user, currentSessionId]);

  // 세션 아카이브 토글
  const toggleArchiveSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    try {
      const updatedSession = await chatService.toggleArchiveSession(sessionId, !session.is_archived);
      if (updatedSession) {
        setSessions(prev => prev.map(s => 
          s.id === sessionId ? updatedSession : s
        ));
        
        if (currentSessionId === sessionId) {
          setCurrentSession(updatedSession);
        }
      }
    } catch (err) {
      console.error('Error updating session:', err);
      setError('Failed to update chat session');
    }
  }, [user, sessions, currentSessionId]);

  // 세션 이름 변경
  const renameSession = useCallback(async (sessionId: string, title: string) => {
    if (!user) return;

    try {
      const updatedSession = await chatService.renameSession(sessionId, title);
      if (updatedSession) {
        setSessions(prev => prev.map(s => 
          s.id === sessionId ? updatedSession : s
        ));
        
        if (currentSessionId === sessionId) {
          setCurrentSession(updatedSession);
        }
      }
    } catch (err) {
      console.error('Error renaming session:', err);
      setError('Failed to rename chat session');
    }
  }, [user, currentSessionId]);

  // 메시지 추가 (Optimistic update)
  const addMessageToSession = useCallback(async (sessionId: string, message: Partial<ChatMessage>) => {
    if (!user) return null;

    // Optimistic update
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      session_id: sessionId,
      user_id: user.id,
      role: message.role || 'user',
      content: message.content || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...message
    } as ChatMessage;

    setSessionMessages(prev => ({
      ...prev,
      [sessionId]: [...(prev[sessionId] || []), tempMessage]
    }));

    // 실제 DB에 저장
    try {
      const savedMessage = await chatService.createMessage({
        session_id: sessionId,
        role: message.role || 'user',
        content: message.content || '',
        model: message.model,
        tokens_used: message.tokens_used,
        tool_calls: message.tool_calls,
        metadata: message.metadata
      });

      if (savedMessage) {
        // 임시 메시지를 실제 메시지로 교체
        setSessionMessages(prev => ({
          ...prev,
          [sessionId]: prev[sessionId].map(m => 
            m.id === tempMessage.id ? savedMessage : m
          )
        }));
        return savedMessage;
      }
    } catch (err) {
      console.error('Error saving message:', err);
      // 실패시 임시 메시지 제거
      setSessionMessages(prev => ({
        ...prev,
        [sessionId]: prev[sessionId].filter(m => m.id !== tempMessage.id)
      }));
    }

    return null;
  }, [user]);

  // 현재 세션의 메시지 가져오기
  const getCurrentMessages = useCallback(() => {
    if (!currentSessionId) return [];
    return sessionMessages[currentSessionId] || [];
  }, [currentSessionId, sessionMessages]);

  // 실시간 구독 설정
  useEffect(() => {
    if (!user) return;

    // 세션 변경사항 구독
    const sessionSubscription = chatService.subscribeToSessions(user.id, (payload) => {
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
    });

    // 메시지 변경사항 구독
    let messageSubscription: any;
    if (currentSessionId) {
      messageSubscription = chatService.subscribeToMessages(currentSessionId, (payload) => {
        console.log('New message:', payload);
        if (payload.eventType === 'INSERT') {
          setSessionMessages(prev => ({
            ...prev,
            [currentSessionId]: [...(prev[currentSessionId] || []), payload.new as ChatMessage]
          }));
        }
      });
    }

    return () => {
      chatService.unsubscribe(sessionSubscription);
      if (messageSubscription) {
        chatService.unsubscribe(messageSubscription);
      }
    };
  }, [user, currentSessionId]);

  // 초기 세션 로드
  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, fetchSessions]);

  return {
    // 상태
    sessions,
    currentSession,
    currentSessionId,
    sessionMessages,
    isLoading,
    error,
    
    // 세션 관리
    createSession,
    switchSession,
    deleteSession,
    toggleArchiveSession,
    renameSession,
    
    // 메시지 관리
    fetchSessionMessages,
    addMessageToSession,
    getCurrentMessages,
    
    // 기타
    refreshSessions: fetchSessions,
    
    // 서비스 직접 접근 (필요시)
    chatService
  };
}