import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  console.log('=== CHAT API CALLED ===');
  
  try {
    const body = await req.json();
    const { messages, sessionId } = body;
    
    console.log(`📨 Received ${messages?.length || 0} messages`);
    
    // Check if Gemini API key exists
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY is not set in environment');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log('✅ API Key loaded (length:', apiKey.length, ')');

    // Get user from session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('❌ User not authenticated');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log(`👤 User: ${user.email}`);

    // Get or create chat session
    let chatSessionId = sessionId;
    let sessionSummary = null;
    
    if (!chatSessionId) {
      // Create new session if not provided
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: null,
          model: 'gemini-2.5-flash',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (sessionError) {
        console.error('Failed to create session:', sessionError);
        return new Response(
          JSON.stringify({ error: 'Failed to create chat session' }), 
          { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      chatSessionId = newSession.id;
      console.log(`📝 Created new session: ${chatSessionId}`);
    } else {
      // Verify session belongs to user and get summary
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('id, chat_history_summary, messages_since_summary')
        .eq('id', chatSessionId)
        .eq('user_id', user.id)
        .single();
      
      if (sessionError || !session) {
        console.error('Session not found or unauthorized');
        return new Response(
          JSON.stringify({ error: 'Session not found' }), 
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      sessionSummary = session.chat_history_summary;
      
      // Check if we need to trigger summarization (async, don't wait)
      if (session.messages_since_summary >= 20) {
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/chat/summarize`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Cookie': req.headers.get('cookie') || ''
          },
          body: JSON.stringify({ sessionId: chatSessionId })
        }).catch(err => console.error('Failed to trigger summarization:', err));
      }
    }

    // Save user message to database
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === 'user') {
      const { error: msgError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: chatSessionId,
          user_id: user.id,
          role: 'user',
          content: lastUserMessage.content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (msgError) {
        console.error('Failed to save user message:', msgError);
      }
    }

    // Build system prompt with session context
    let systemPrompt = `You are a helpful AI assistant powered by Gemini 2.5 Flash. Provide concise and helpful responses.`;
    
    // Add session summary to context if available
    if (sessionSummary) {
      systemPrompt += `\n\nContext from previous conversation:\n${sessionSummary}\n\nPlease consider this context when responding, but focus primarily on the current query.`;
    }

    console.log('🚀 Creating stream with Gemini 2.5 Flash...');
    console.log(`📚 Using session summary: ${sessionSummary ? 'Yes' : 'No'}`);
    console.log('Messages to send:', JSON.stringify(messages, null, 2));
    
    // Initialize Google AI with API key
    const googleAI = createGoogleGenerativeAI({
      apiKey: apiKey,
    });
    
    try {
      // Stream the response
      const result = await streamText({
        model: googleAI('gemini-2.5-flash'),
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.3,
        maxTokens: 2000,
      onFinish: async (event) => {
        console.log(`✅ Stream completed. Tokens used: ${event.usage?.totalTokens || 'unknown'}`);
        
        // Save assistant message to database
        if (event.text) {
          const { error: msgError } = await supabase
            .from('chat_messages')
            .insert({
              session_id: chatSessionId,
              user_id: user.id,
              role: 'assistant',
              content: event.text,
              model: 'gemini-2.5-flash',
              tokens_used: event.usage?.totalTokens || 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (msgError) {
            console.error('Failed to save assistant message:', msgError);
          }
        }
      },
    });

    console.log('Stream result created successfully');
    console.log('📤 Returning stream response');
    console.log('Result type:', typeof result);
    console.log('Result keys:', Object.keys(result));
    console.log('Available methods:', {
      toDataStreamResponse: typeof result.toDataStreamResponse,
      toTextStreamResponse: typeof result.toTextStreamResponse,
      toAIStream: typeof result.toAIStream,
      textStream: typeof result.textStream,
    });
    
    // Vercel AI SDK v5 uses toDataStreamResponse
    if (typeof result.toDataStreamResponse === 'function') {
      console.log('Using toDataStreamResponse');
      const response = result.toDataStreamResponse();
      response.headers.set('X-Session-Id', chatSessionId);
      return response;
    } 
    
    // Fallback: try to get the text stream directly
    if (result.textStream) {
      console.log('Using textStream directly');
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.textStream) {
              console.log('Streaming chunk:', chunk);
              controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
          } catch (error) {
            console.error('Stream error:', error);
            controller.error(error);
          }
        },
      });
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'X-Session-Id': chatSessionId,
        },
      });
    }
    
    // If no stream method is available, throw error
    throw new Error('No streaming method available on result');
    } catch (streamError) {
      console.error('Error creating stream:', streamError);
      throw streamError;
    }
  } catch (error) {
    console.error('Stream API error:', error);
    
    // Return detailed error for debugging
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: errorMessage,
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}