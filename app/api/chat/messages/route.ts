import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/chat/messages - Get messages for a session
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get messages
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Messages API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/chat/messages - Save a message
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, role, content, model, tokens_used, tool_calls, metadata } = body;

    if (!sessionId || !role || !content) {
      return NextResponse.json({ 
        error: 'Missing required fields: sessionId, role, content' 
      }, { status: 400 });
    }

    // Verify session belongs to user and get session data
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Save message
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        role,
        content,
        model: model || 'gpt-3.5-turbo',
        tokens_used: tokens_used || 0,
        tool_calls,
        metadata: metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }

    // 세션 업데이트 (메시지 수, 마지막 메시지 시간)
    const { error: sessionUpdateError } = await supabase
      .from('chat_sessions')
      .update({
        message_count: session.message_count + 1,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(tokens_used && { total_tokens: session.total_tokens + tokens_used })
      })
      .eq('id', sessionId);

    if (sessionUpdateError) {
      console.error('Error updating session:', sessionUpdateError);
      // 세션 업데이트 실패는 무시하고 메시지는 반환
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Messages API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/chat/messages/batch - Save multiple messages at once
export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, messages } = body;

    if (!sessionId || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ 
        error: 'Missing required fields: sessionId, messages (array)' 
      }, { status: 400 });
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Prepare messages for batch insert
    const messagesToInsert = messages.map(msg => ({
      session_id: sessionId,
      user_id: user.id,
      role: msg.role,
      content: msg.content,
      model: msg.model,
      tokens_used: msg.tokens_used || 0,
      tool_calls: msg.tool_calls,
      metadata: msg.metadata || {},
      created_at: msg.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Save messages
    const { data: savedMessages, error } = await supabase
      .from('chat_messages')
      .insert(messagesToInsert)
      .select();

    if (error) {
      console.error('Error saving messages:', error);
      return NextResponse.json({ error: 'Failed to save messages' }, { status: 500 });
    }

    return NextResponse.json({ messages: savedMessages });
  } catch (error) {
    console.error('Messages API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}