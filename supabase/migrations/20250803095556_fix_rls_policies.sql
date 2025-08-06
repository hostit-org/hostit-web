-- Fix RLS policies for INSERT operations
-- Drop existing policies to recreate them
DROP POLICY IF EXISTS tool_reviews_modify_policy ON tool_reviews;
DROP POLICY IF EXISTS tool_reviews_insert_policy ON tool_reviews;
DROP POLICY IF EXISTS tool_reviews_select_policy ON tool_reviews;
DROP POLICY IF EXISTS tool_reviews_update_policy ON tool_reviews;
DROP POLICY IF EXISTS tool_reviews_delete_policy ON tool_reviews;

DROP POLICY IF EXISTS tool_collections_modify_policy ON tool_collections;
DROP POLICY IF EXISTS tool_collections_insert_policy ON tool_collections;
DROP POLICY IF EXISTS tool_collections_select_policy ON tool_collections;
DROP POLICY IF EXISTS tool_collections_update_policy ON tool_collections;
DROP POLICY IF EXISTS tool_collections_delete_policy ON tool_collections;

-- Recreate policies with correct syntax
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