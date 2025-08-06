/**
 * 채팅 관련 유틸리티 함수들
 */

/**
 * 시간 포맷팅 (오전/오후 표시)
 */
export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
};

/**
 * 날짜 포맷팅 (상대적 시간 표시)
 */
export const formatDate = (date: string): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return '오늘';
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  if (days < 365) return `${Math.floor(days / 30)}개월 전`;
  return d.toLocaleDateString('ko-KR');
};

/**
 * 메시지 내용 미리보기 생성
 */
export const getMessagePreview = (content: string, maxLength: number = 50): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};

/**
 * 세션 제목 자동 생성 (첫 메시지 기반)
 */
export const generateSessionTitle = (firstMessage: string): string => {
  // 특수문자 제거 및 정리
  const cleaned = firstMessage.replace(/[^\w\s가-힣]/gi, '').trim();
  
  // 최대 30자로 제한
  if (cleaned.length > 30) {
    return cleaned.substring(0, 30) + '...';
  }
  
  return cleaned || '새 대화';
};

/**
 * 토큰 수 추정 (간단한 추정)
 */
export const estimateTokens = (text: string): number => {
  // 한글은 보통 2-3토큰, 영어는 단어당 1-2토큰으로 추정
  const koreanChars = (text.match(/[가-힣]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const numbers = (text.match(/\d+/g) || []).length;
  
  return Math.ceil(koreanChars * 0.4 + englishWords * 1.5 + numbers);
};

/**
 * 메시지 그룹화 (시간 기준)
 */
export interface MessageGroup {
  date: string;
  messages: any[];
}

export const groupMessagesByDate = (messages: any[]): MessageGroup[] => {
  const groups: { [key: string]: any[] } = {};
  
  messages.forEach(message => {
    const date = new Date(message.created_at || message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });
  
  return Object.entries(groups).map(([date, messages]) => ({
    date,
    messages
  }));
};

/**
 * 메시지 역할별 아이콘 가져오기
 */
export const getRoleIcon = (role: string): string => {
  switch (role) {
    case 'user': return '👤';
    case 'assistant': return '🤖';
    case 'system': return '⚙️';
    case 'tool': return '🔧';
    default: return '💬';
  }
};

/**
 * 메시지 역할별 색상 클래스 가져오기
 */
export const getRoleColorClass = (role: string): string => {
  switch (role) {
    case 'user': return 'bg-primary text-primary-foreground';
    case 'assistant': return 'bg-muted';
    case 'system': return 'bg-yellow-100 dark:bg-yellow-900';
    case 'tool': return 'bg-blue-100 dark:bg-blue-900';
    default: return 'bg-gray-100 dark:bg-gray-800';
  }
};

/**
 * 마크다운 텍스트를 HTML로 변환 (간단한 변환)
 */
export const simpleMarkdownToHtml = (text: string): string => {
  return text
    // 코드 블록
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // 인라인 코드
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 굵은 글씨
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // 기울임
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // 링크
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // 줄바꿈
    .replace(/\n/g, '<br>');
};

/**
 * 세션 검색
 */
export const searchSessions = (sessions: any[], query: string): any[] => {
  const lowerQuery = query.toLowerCase();
  
  return sessions.filter(session => {
    const title = (session.title || '').toLowerCase();
    const hasMatchingMessage = session.messages?.some((msg: any) => 
      msg.content.toLowerCase().includes(lowerQuery)
    );
    
    return title.includes(lowerQuery) || hasMatchingMessage;
  });
};

/**
 * 세션 정렬
 */
export type SortOption = 'recent' | 'oldest' | 'mostMessages' | 'alphabetical';

export const sortSessions = (sessions: any[], sortBy: SortOption): any[] => {
  const sorted = [...sessions];
  
  switch (sortBy) {
    case 'recent':
      return sorted.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    case 'oldest':
      return sorted.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    case 'mostMessages':
      return sorted.sort((a, b) => b.message_count - a.message_count);
    case 'alphabetical':
      return sorted.sort((a, b) => 
        (a.title || '').localeCompare(b.title || '')
      );
    default:
      return sorted;
  }
};

/**
 * 채팅 내보내기 파일명 생성
 */
export const generateExportFilename = (sessionTitle: string, format: string): string => {
  const date = new Date().toISOString().split('T')[0];
  const safeTitle = sessionTitle.replace(/[^a-zA-Z0-9가-힣]/g, '_');
  return `chat_${safeTitle}_${date}.${format}`;
};

/**
 * 클립보드에 복사
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

/**
 * 파일 다운로드
 */
export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};