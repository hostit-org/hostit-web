-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Tool Categories (hierarchical structure)
CREATE TABLE IF NOT EXISTS tool_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id UUID REFERENCES tool_categories(id) ON DELETE CASCADE,
    icon TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- MCP Tools Catalog (all available tools)
CREATE TABLE IF NOT EXISTS mcp_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    long_description TEXT,
    category_id UUID REFERENCES tool_categories(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    author TEXT,
    version TEXT,
    github_url TEXT,
    npm_package TEXT,
    pip_package TEXT,
    docker_image TEXT,
    transport_type TEXT CHECK (transport_type IN ('stdio', 'http', 'websocket', 'docker')),
    config_schema JSONB DEFAULT '{}',
    capabilities JSONB DEFAULT '{}', -- {tools: [], resources: [], prompts: []}
    requirements JSONB DEFAULT '{}', -- system requirements, dependencies
    popularity_score INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    stars_count INTEGER DEFAULT 0,
    is_official BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    embedding vector(1536), -- For semantic search
    search_text TSVECTOR, -- For full-text search
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- User's personal tool collection
CREATE TABLE IF NOT EXISTS user_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES mcp_tools(id) ON DELETE CASCADE,
    custom_name TEXT,
    custom_description TEXT,
    custom_config JSONB DEFAULT '{}',
    custom_category TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, tool_id)
);

-- Tool usage logs for analytics
CREATE TABLE IF NOT EXISTS tool_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES mcp_tools(id) ON DELETE CASCADE,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    input JSONB DEFAULT '{}',
    output JSONB DEFAULT '{}',
    error JSONB,
    tokens_used INTEGER DEFAULT 0,
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tool reviews and ratings
CREATE TABLE IF NOT EXISTS tool_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES mcp_tools(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    is_recommended BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, tool_id)
);

-- Tool collections (user-created lists)
CREATE TABLE IF NOT EXISTS tool_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tool collection items
CREATE TABLE IF NOT EXISTS tool_collection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES tool_collections(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES mcp_tools(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    notes TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(collection_id, tool_id)
);

-- Create indexes for better performance
CREATE INDEX idx_mcp_tools_category ON mcp_tools(category_id);
CREATE INDEX idx_mcp_tools_tags ON mcp_tools USING GIN(tags);
CREATE INDEX idx_mcp_tools_search ON mcp_tools USING GIN(search_text);
CREATE INDEX idx_mcp_tools_embedding ON mcp_tools USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_mcp_tools_popularity ON mcp_tools(popularity_score DESC);
CREATE INDEX idx_mcp_tools_created ON mcp_tools(created_at DESC);

CREATE INDEX idx_user_tools_user ON user_tools(user_id);
CREATE INDEX idx_user_tools_tool ON user_tools(tool_id);
CREATE INDEX idx_user_tools_favorite ON user_tools(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_user_tools_pinned ON user_tools(user_id, is_pinned) WHERE is_pinned = TRUE;

CREATE INDEX idx_tool_usage_logs_user ON tool_usage_logs(user_id);
CREATE INDEX idx_tool_usage_logs_tool ON tool_usage_logs(tool_id);
CREATE INDEX idx_tool_usage_logs_session ON tool_usage_logs(session_id);
CREATE INDEX idx_tool_usage_logs_created ON tool_usage_logs(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at column
CREATE TRIGGER update_tool_categories_updated_at BEFORE UPDATE ON tool_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mcp_tools_updated_at BEFORE UPDATE ON mcp_tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tools_updated_at BEFORE UPDATE ON user_tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tool_reviews_updated_at BEFORE UPDATE ON tool_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tool_collections_updated_at BEFORE UPDATE ON tool_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update search_text column
CREATE OR REPLACE FUNCTION update_mcp_tools_search_text()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_text := to_tsvector('english', 
        COALESCE(NEW.name, '') || ' ' || 
        COALESCE(NEW.description, '') || ' ' || 
        COALESCE(NEW.author, '') || ' ' ||
        COALESCE(array_to_string(NEW.tags, ' '), '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mcp_tools_search_text
BEFORE INSERT OR UPDATE ON mcp_tools
FOR EACH ROW
EXECUTE FUNCTION update_mcp_tools_search_text();

-- Function to update tool popularity score
CREATE OR REPLACE FUNCTION calculate_tool_popularity_score(tool_id UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER;
BEGIN
    SELECT 
        COALESCE(t.stars_count, 0) * 10 +
        COALESCE(t.downloads_count, 0) +
        COALESCE(ut.users_count, 0) * 50 +
        COALESCE(tr.avg_rating, 0) * 20 +
        COALESCE(ul.recent_usage, 0) * 5
    INTO score
    FROM mcp_tools t
    LEFT JOIN (
        SELECT tool_id, COUNT(*) as users_count 
        FROM user_tools 
        WHERE tool_id = $1
        GROUP BY tool_id
    ) ut ON t.id = ut.tool_id
    LEFT JOIN (
        SELECT tool_id, AVG(rating) as avg_rating 
        FROM tool_reviews 
        WHERE tool_id = $1
        GROUP BY tool_id
    ) tr ON t.id = tr.tool_id
    LEFT JOIN (
        SELECT tool_id, COUNT(*) as recent_usage 
        FROM tool_usage_logs 
        WHERE tool_id = $1 AND created_at > NOW() - INTERVAL '7 days'
        GROUP BY tool_id
    ) ul ON t.id = ul.tool_id
    WHERE t.id = $1;
    
    RETURN COALESCE(score, 0);
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) Policies
ALTER TABLE user_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_collection_items ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own user_tools
CREATE POLICY user_tools_policy ON user_tools
    FOR ALL
    USING (auth.uid() = user_id);

-- Users can only see their own usage logs
CREATE POLICY tool_usage_logs_policy ON tool_usage_logs
    FOR ALL
    USING (auth.uid() = user_id);

-- Users can see all reviews but only modify their own
CREATE POLICY tool_reviews_select_policy ON tool_reviews
    FOR SELECT
    USING (TRUE);

CREATE POLICY tool_reviews_insert_policy ON tool_reviews
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY tool_reviews_update_policy ON tool_reviews
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY tool_reviews_delete_policy ON tool_reviews
    FOR DELETE
    USING (auth.uid() = user_id);

-- Collections: public ones are visible to all, private only to owner
CREATE POLICY tool_collections_select_policy ON tool_collections
    FOR SELECT
    USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY tool_collections_insert_policy ON tool_collections
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY tool_collections_update_policy ON tool_collections
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY tool_collections_delete_policy ON tool_collections
    FOR DELETE
    USING (auth.uid() = user_id);

-- Collection items follow collection visibility
CREATE POLICY tool_collection_items_policy ON tool_collection_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tool_collections tc
            WHERE tc.id = collection_id
            AND (tc.is_public = TRUE OR tc.user_id = auth.uid())
        )
    );

-- Insert some default categories
INSERT INTO tool_categories (name, slug, description, icon, display_order) VALUES
    ('Development', 'development', 'Tools for software development', '=�', 1),
    ('AI & Machine Learning', 'ai-ml', 'AI and ML tools', '>', 2),
    ('Data & Analytics', 'data-analytics', 'Data processing and analytics tools', '=�', 3),
    ('Communication', 'communication', 'Communication and collaboration tools', '=�', 4),
    ('Productivity', 'productivity', 'Productivity and workflow tools', '�', 5),
    ('Cloud & Infrastructure', 'cloud-infra', 'Cloud services and infrastructure tools', '', 6),
    ('Security', 'security', 'Security and compliance tools', '=', 7),
    ('Content & Media', 'content-media', 'Content creation and media tools', '<�', 8),
    ('Database', 'database', 'Database management tools', '=�', 9),
    ('Monitoring', 'monitoring', 'Monitoring and observability tools', '=�', 10)
ON CONFLICT (slug) DO NOTHING;

-- Add subcategories
INSERT INTO tool_categories (name, slug, parent_id, description, icon, display_order) 
SELECT 
    'Version Control', 
    'version-control', 
    id, 
    'Git and version control tools', 
    '=', 
    1
FROM tool_categories WHERE slug = 'development'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tool_categories (name, slug, parent_id, description, icon, display_order) 
SELECT 
    'Web Frameworks', 
    'web-frameworks', 
    id, 
    'Web development frameworks', 
    '<', 
    2
FROM tool_categories WHERE slug = 'development'
ON CONFLICT (slug) DO NOTHING;

-- Create views for easier querying
CREATE OR REPLACE VIEW tools_with_stats AS
SELECT 
    t.*,
    COALESCE(ut.users_count, 0) as users_count,
    COALESCE(tr.avg_rating, 0) as avg_rating,
    COALESCE(tr.reviews_count, 0) as reviews_count,
    COALESCE(ul.usage_last_week, 0) as usage_last_week,
    c.name as category_name,
    c.slug as category_slug
FROM mcp_tools t
LEFT JOIN tool_categories c ON t.category_id = c.id
LEFT JOIN (
    SELECT tool_id, COUNT(*) as users_count 
    FROM user_tools 
    GROUP BY tool_id
) ut ON t.id = ut.tool_id
LEFT JOIN (
    SELECT 
        tool_id, 
        AVG(rating) as avg_rating,
        COUNT(*) as reviews_count
    FROM tool_reviews 
    GROUP BY tool_id
) tr ON t.id = tr.tool_id
LEFT JOIN (
    SELECT tool_id, COUNT(*) as usage_last_week 
    FROM tool_usage_logs 
    WHERE created_at > NOW() - INTERVAL '7 days'
    GROUP BY tool_id
) ul ON t.id = ul.tool_id;

-- Create view for user's tools with all details
CREATE OR REPLACE VIEW user_tools_detailed AS
SELECT 
    ut.*,
    t.name as tool_name,
    t.description as tool_description,
    t.author,
    t.github_url,
    t.capabilities,
    t.transport_type,
    c.name as category_name,
    c.slug as category_slug
FROM user_tools ut
JOIN mcp_tools t ON ut.tool_id = t.id
LEFT JOIN tool_categories c ON t.category_id = c.id;

-- Function to search tools with multiple strategies
CREATE OR REPLACE FUNCTION search_tools(
    query TEXT,
    category_filter UUID DEFAULT NULL,
    tag_filter TEXT[] DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    category_name TEXT,
    tags TEXT[],
    author TEXT,
    avg_rating NUMERIC,
    users_count BIGINT,
    relevance_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.description,
        c.name as category_name,
        t.tags,
        t.author,
        COALESCE(AVG(tr.rating), 0) as avg_rating,
        COUNT(DISTINCT ut.user_id) as users_count,
        ts_rank(t.search_text, plainto_tsquery('english', query)) as relevance_score
    FROM mcp_tools t
    LEFT JOIN tool_categories c ON t.category_id = c.id
    LEFT JOIN tool_reviews tr ON t.id = tr.tool_id
    LEFT JOIN user_tools ut ON t.id = ut.tool_id
    WHERE 
        (t.search_text @@ plainto_tsquery('english', query) OR query IS NULL OR query = '')
        AND (t.category_id = category_filter OR category_filter IS NULL)
        AND (t.tags && tag_filter OR tag_filter IS NULL)
    GROUP BY t.id, t.name, t.description, c.name, t.tags, t.author, t.search_text
    ORDER BY relevance_score DESC, users_count DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for authenticated users
GRANT SELECT ON mcp_tools TO authenticated;
GRANT SELECT ON tool_categories TO authenticated;
GRANT SELECT ON tools_with_stats TO authenticated;
GRANT ALL ON user_tools TO authenticated;
GRANT ALL ON tool_usage_logs TO authenticated;
GRANT ALL ON tool_reviews TO authenticated;
GRANT ALL ON tool_collections TO authenticated;
GRANT ALL ON tool_collection_items TO authenticated;
GRANT SELECT ON user_tools_detailed TO authenticated;