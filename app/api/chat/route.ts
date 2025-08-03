import { streamText } from 'ai';
import { gemini25Flash } from '@/lib/ai-provider';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  console.log('=== CHAT API CALLED ===');
  
  try {
    const body = await req.json();
    const { messages } = body;
    
    console.log(`📨 Received ${messages?.length || 0} messages`);
    
    // Check if Gemini API key exists
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY is not set in environment');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log('✅ API Key loaded');

    // Get user from session (optional)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      console.log(`👤 User: ${user.email}`);
    } else {
      console.log('👤 User: Anonymous');
    }

    // Simple system prompt for now
    const systemPrompt = `You are a helpful AI assistant powered by Gemini 2.5 Flash. Provide concise and helpful responses.`;

    console.log('🚀 Creating stream with Gemini 2.5 Flash...');
    
    // Stream the response
    const result = await streamText({
      model: gemini25Flash,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.3,
      onFinish: async (event) => {
        console.log(`✅ Stream completed. Tokens used: ${event.usage?.totalTokens || 'unknown'}`);
      },
    });

    console.log('📤 Returning stream response');
    console.log('Result type:', typeof result);
    console.log('Result keys:', Object.keys(result));
    
    // Check different methods to return stream
    if (typeof result.toDataStreamResponse === 'function') {
      return result.toDataStreamResponse();
    } else if (typeof result.toTextStreamResponse === 'function') {
      return result.toTextStreamResponse();
    } else if (typeof result.toAIStreamResponse === 'function') {
      return result.toAIStreamResponse();
    } else {
      // Manual stream response
      const stream = result.textStream;
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
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