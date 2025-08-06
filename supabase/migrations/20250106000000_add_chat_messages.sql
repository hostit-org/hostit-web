-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    content TEXT NOT NULL,
    model TEXT,
    tokens_used INTEGER DEFAULT 0,
    tool_calls JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add missing columns to chat_sessions if they don't exist
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS model TEXT DEFAULT 'gemini-2.5-flash',
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS chat_history_summary TEXT,
ADD COLUMN IF NOT EXISTS summary_updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS messages_since_summary INTEGER DEFAULT 0;

-- Make agent_id and thread_id nullable for simple chat sessions
ALTER TABLE chat_sessions 
ALTER COLUMN agent_id DROP NOT NULL,
ALTER COLUMN thread_id DROP NOT NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_is_archived ON chat_sessions(is_archived, user_id) WHERE is_archived = FALSE;

-- Function to auto-update session on new message
CREATE OR REPLACE FUNCTION update_session_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_sessions 
    SET 
        last_message_at = NEW.created_at,
        message_count = message_count + 1,
        messages_since_summary = messages_since_summary + 1,
        total_tokens = total_tokens + COALESCE(NEW.tokens_used, 0),
        updated_at = NOW()
    WHERE id = NEW.session_id;
    
    -- Auto-generate title from first user message if title is null
    IF NEW.role = 'user' AND EXISTS (
        SELECT 1 FROM chat_sessions 
        WHERE id = NEW.session_id AND title IS NULL
    ) THEN
        UPDATE chat_sessions 
        SET title = 
            CASE 
                WHEN LENGTH(NEW.content) > 100 THEN LEFT(NEW.content, 97) || '...'
                ELSE NEW.content
            END
        WHERE id = NEW.session_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-update
DROP TRIGGER IF EXISTS trigger_update_session_on_message ON chat_messages;
CREATE TRIGGER trigger_update_session_on_message
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_session_on_message();

-- RLS Policies
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own messages
CREATE POLICY chat_messages_policy ON chat_messages
    FOR ALL
    USING (auth.uid() = user_id);

-- Update chat_sessions RLS policy to handle nullable agent_id
DROP POLICY IF EXISTS chat_sessions_policy ON chat_sessions;
CREATE POLICY chat_sessions_policy ON chat_sessions
    FOR ALL
    USING (auth.uid() = user_id);

-- View for sessions with latest message
CREATE OR REPLACE VIEW chat_sessions_with_latest AS
SELECT 
    cs.*,
    cm.latest_message,
    cm.latest_role,
    cm.latest_message_at
FROM chat_sessions cs
LEFT JOIN LATERAL (
    SELECT 
        content as latest_message,
        role as latest_role,
        created_at as latest_message_at
    FROM chat_messages
    WHERE session_id = cs.id
    ORDER BY created_at DESC
    LIMIT 1
) cm ON true;

-- Function to get or create a simple chat session
CREATE OR REPLACE FUNCTION get_or_create_simple_session(
    p_user_id UUID,
    p_session_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
BEGIN
    -- If session_id provided, verify it belongs to user
    IF p_session_id IS NOT NULL THEN
        SELECT id INTO v_session_id
        FROM chat_sessions
        WHERE id = p_session_id AND user_id = p_user_id;
        
        IF v_session_id IS NOT NULL THEN
            RETURN v_session_id;
        END IF;
    END IF;
    
    -- Create new session without agent_id and thread_id
    INSERT INTO chat_sessions (user_id, title, created_at, updated_at)
    VALUES (p_user_id, NULL, NOW(), NOW())
    RETURNING id INTO v_session_id;
    
    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON chat_messages TO authenticated;
GRANT SELECT ON chat_sessions_with_latest TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_simple_session TO authenticated;
GRANT EXECUTE ON FUNCTION update_session_on_message TO authenticated;