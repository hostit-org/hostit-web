import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const MESSAGES_THRESHOLD = 20; // 20개 메시지마다 요약
const MAX_MESSAGES_TO_FETCH = 50; // 한번에 최대 50개 메시지만 가져와서 요약

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, forceUpdate = false } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if summary is needed
    if (!forceUpdate && session.messages_since_summary < MESSAGES_THRESHOLD) {
      return NextResponse.json({ 
        message: 'Summary not needed yet',
        messages_since_summary: session.messages_since_summary,
        threshold: MESSAGES_THRESHOLD
      });
    }

    // Get recent messages to summarize
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('role, content, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(session.messages_since_summary || MAX_MESSAGES_TO_FETCH);

    if (messagesError || !messages || messages.length === 0) {
      return NextResponse.json({ 
        error: 'No messages to summarize' 
      }, { status: 400 });
    }

    // Reverse to get chronological order
    messages.reverse();

    // Prepare conversation for summarization
    const conversationText = messages.map(msg => 
      `${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n\n');

    // Generate summary
    let summaryPrompt = `Please provide a concise summary of this conversation, focusing on:
1. Main topics discussed
2. Key decisions or conclusions made
3. Important information shared
4. Any action items or next steps

Keep the summary under 500 words and structure it clearly.`;

    // If there's an existing summary, ask to merge with new content
    if (session.chat_history_summary) {
      summaryPrompt = `Here is the existing summary of our previous conversation:

${session.chat_history_summary}

Now, please update this summary by incorporating the following new messages, maintaining continuity and avoiding repetition. Keep the most important information from both the old summary and new messages:`;
    }

    summaryPrompt += `\n\nConversation to summarize:\n${conversationText}`;

    // Initialize Google AI with API key
    const googleAI = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || '',
    });
    
    const { text: newSummary } = await generateText({
      model: googleAI('gemini-2.5-flash'),
      prompt: summaryPrompt,
      temperature: 0.3,
      maxRetries: 2,
    });

    // Update session with new summary
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({
        chat_history_summary: newSummary,
        summary_updated_at: new Date().toISOString(),
        messages_since_summary: 0 // Reset counter
      })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating summary:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update summary' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      summary: newSummary,
      messages_summarized: messages.length
    });
  } catch (error) {
    console.error('Summarize API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// GET endpoint to check if summary is needed
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

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('messages_since_summary, chat_history_summary, summary_updated_at')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      needs_summary: session.messages_since_summary >= MESSAGES_THRESHOLD,
      messages_since_summary: session.messages_since_summary,
      threshold: MESSAGES_THRESHOLD,
      has_existing_summary: !!session.chat_history_summary,
      last_summary_at: session.summary_updated_at
    });
  } catch (error) {
    console.error('Summarize check error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}