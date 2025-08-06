'use client';

import { createClient } from '@/utils/supabase/client';

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

export interface CreateSessionParams {
  title?: string;
  model?: string;
  metadata?: any;
}

export interface UpdateSessionParams {
  title?: string;
  is_archived?: boolean;
  metadata?: any;
  chat_history_summary?: string;
  messages_since_summary?: number;
}

export interface CreateMessageParams {
  session_id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  model?: string;
  tokens_used?: number;
  tool_calls?: any;
  metadata?: any;
}

class ChatService {
  private supabase = createClient();

  // ========== Session 관련 메서드 ==========
  
  /**
   * 모든 채팅 세션 조회
   */
  async getSessions(userId: string): Promise<ChatSession[]> {
    try {
      const response = await fetch('/api/chat/sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      
      const data = await response.json();
      return data.sessions || [];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  /**
   * 특정 세션 조회
   */
  async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  }

  /**
   * 새 세션 생성
   */
  async createSession(params: CreateSessionParams = {}): Promise<ChatSession | null> {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) throw new Error('Failed to create session');
      
      const data = await response.json();
      return data.session;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  }

  /**
   * 세션 업데이트
   */
  async updateSession(sessionId: string, params: UpdateSessionParams): Promise<ChatSession | null> {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...params })
      });
      
      if (!response.ok) throw new Error('Failed to update session');
      
      const data = await response.json();
      return data.session;
    } catch (error) {
      console.error('Error updating session:', error);
      return null;
    }
  }

  /**
   * 세션 삭제
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/chat/sessions?sessionId=${sessionId}`, {
        method: 'DELETE'
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  /**
   * 세션 아카이브/언아카이브
   */
  async toggleArchiveSession(sessionId: string, isArchived: boolean): Promise<ChatSession | null> {
    return this.updateSession(sessionId, { is_archived: isArchived });
  }

  /**
   * 세션 제목 변경
   */
  async renameSession(sessionId: string, title: string): Promise<ChatSession | null> {
    return this.updateSession(sessionId, { title });
  }

  // ========== Message 관련 메서드 ==========

  /**
   * 세션의 모든 메시지 조회
   */
  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  /**
   * 새 메시지 저장
   */
  async createMessage(params: CreateMessageParams): Promise<ChatMessage | null> {
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: params.session_id,
          role: params.role,
          content: params.content,
          model: params.model,
          tokens_used: params.tokens_used,
          tool_calls: params.tool_calls,
          metadata: params.metadata
        })
      });
      
      if (!response.ok) throw new Error('Failed to create message');
      
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error creating message:', error);
      return null;
    }
  }

  /**
   * 메시지 삭제
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  /**
   * 세션의 모든 메시지 삭제
   */
  async clearSessionMessages(sessionId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing messages:', error);
      return false;
    }
  }

  // ========== 실시간 구독 관련 메서드 ==========

  /**
   * 세션 변경사항 구독
   */
  subscribeToSessions(userId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel('chat_sessions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_sessions',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }

  /**
   * 메시지 변경사항 구독
   */
  subscribeToMessages(sessionId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`chat_messages:${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_id=eq.${sessionId}`
      }, callback)
      .subscribe();
  }

  /**
   * 구독 해제
   */
  unsubscribe(subscription: any) {
    if (subscription) {
      subscription.unsubscribe();
    }
  }

  // ========== 유틸리티 메서드 ==========

  /**
   * 세션 요약 생성
   */
  async createSessionSummary(sessionId: string): Promise<string | null> {
    try {
      const response = await fetch('/api/chat/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      
      if (!response.ok) throw new Error('Failed to create summary');
      
      const data = await response.json();
      return data.summary;
    } catch (error) {
      console.error('Error creating summary:', error);
      return null;
    }
  }

  /**
   * 채팅 내보내기
   */
  async exportChat(sessionId: string, format: 'json' | 'txt' | 'md' = 'json'): Promise<string | null> {
    try {
      const messages = await this.getMessages(sessionId);
      const session = await this.getSession(sessionId);
      
      if (!session) return null;

      switch (format) {
        case 'json':
          return JSON.stringify({ session, messages }, null, 2);
        
        case 'txt':
          return messages.map(m => 
            `[${m.role.toUpperCase()}] ${new Date(m.created_at).toLocaleString()}\n${m.content}\n`
          ).join('\n---\n');
        
        case 'md':
          return `# ${session.title || 'Chat Session'}\n\n` +
            `Created: ${new Date(session.created_at).toLocaleString()}\n\n` +
            messages.map(m => 
              `## ${m.role === 'user' ? '👤 User' : '🤖 Assistant'}\n` +
              `*${new Date(m.created_at).toLocaleString()}*\n\n${m.content}\n`
            ).join('\n---\n');
        
        default:
          return null;
      }
    } catch (error) {
      console.error('Error exporting chat:', error);
      return null;
    }
  }

  /**
   * 세션 통계 조회
   */
  async getSessionStats(sessionId: string): Promise<{
    messageCount: number;
    totalTokens: number;
    lastMessageAt: string | null;
  } | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return null;

      return {
        messageCount: session.message_count,
        totalTokens: session.total_tokens,
        lastMessageAt: session.last_message_at
      };
    } catch (error) {
      console.error('Error getting session stats:', error);
      return null;
    }
  }
}

// 싱글톤 인스턴스
const chatService = new ChatService();
export default chatService;