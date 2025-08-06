import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/chat/sessions - Get all user's chat sessions
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get URL params
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('chat_sessions')
      .select(`
        *,
        messages:chat_messages(count)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/chat/sessions - Create a new chat session
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, model = 'gemini-2.5-flash', metadata = {} } = body;

    // Create new session
    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: user.id,
        title,
        model,
        metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/chat/sessions - Update a chat session
export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, title, is_archived, metadata } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Update session
    const { data: session, error } = await supabase
      .from('chat_sessions')
      .update({
        ...(title !== undefined && { title }),
        ...(is_archived !== undefined && { is_archived }),
        ...(metadata !== undefined && { metadata }),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating session:', error);
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/chat/sessions - Delete a chat session
export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Delete session (messages will cascade delete)
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting session:', error);
      return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}