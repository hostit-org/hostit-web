export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      agent_mcp_servers: {
        Row: {
          agent_id: string
          created_at: string | null
          is_enabled: boolean | null
          mcp_server_id: string
          order_index: number | null
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          is_enabled?: boolean | null
          mcp_server_id: string
          order_index?: number | null
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          is_enabled?: boolean | null
          mcp_server_id?: string
          order_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_mcp_servers_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_mcp_servers_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents_with_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_mcp_servers_mcp_server_id_fkey"
            columns: ["mcp_server_id"]
            isOneToOne: false
            referencedRelation: "mcp_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          thread_id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          thread_id: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          thread_id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents_with_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mcp_servers: {
        Row: {
          config: Json
          created_at: string | null
          description: string | null
          error_message: string | null
          id: string
          last_ping: string | null
          name: string
          status: string | null
          transport_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config: Json
          created_at?: string | null
          description?: string | null
          error_message?: string | null
          id?: string
          last_ping?: string | null
          name: string
          status?: string | null
          transport_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string | null
          description?: string | null
          error_message?: string | null
          id?: string
          last_ping?: string | null
          name?: string
          status?: string | null
          transport_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mcp_servers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcp_servers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mcp_tools: {
        Row: {
          author: string | null
          capabilities: Json | null
          category_id: string | null
          config_schema: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          docker_image: string | null
          downloads_count: number | null
          embedding: string | null
          github_url: string | null
          id: string
          is_official: boolean | null
          is_verified: boolean | null
          long_description: string | null
          name: string
          npm_package: string | null
          pip_package: string | null
          popularity_score: number | null
          requirements: Json | null
          search_text: unknown | null
          slug: string
          stars_count: number | null
          tags: string[] | null
          transport_type: string | null
          updated_at: string
          updated_by: string | null
          version: string | null
        }
        Insert: {
          author?: string | null
          capabilities?: Json | null
          category_id?: string | null
          config_schema?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          docker_image?: string | null
          downloads_count?: number | null
          embedding?: string | null
          github_url?: string | null
          id?: string
          is_official?: boolean | null
          is_verified?: boolean | null
          long_description?: string | null
          name: string
          npm_package?: string | null
          pip_package?: string | null
          popularity_score?: number | null
          requirements?: Json | null
          search_text?: unknown | null
          slug: string
          stars_count?: number | null
          tags?: string[] | null
          transport_type?: string | null
          updated_at?: string
          updated_by?: string | null
          version?: string | null
        }
        Update: {
          author?: string | null
          capabilities?: Json | null
          category_id?: string | null
          config_schema?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          docker_image?: string | null
          downloads_count?: number | null
          embedding?: string | null
          github_url?: string | null
          id?: string
          is_official?: boolean | null
          is_verified?: boolean | null
          long_description?: string | null
          name?: string
          npm_package?: string | null
          pip_package?: string | null
          popularity_score?: number | null
          requirements?: Json | null
          search_text?: unknown | null
          slug?: string
          stars_count?: number | null
          tags?: string[] | null
          transport_type?: string | null
          updated_at?: string
          updated_by?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mcp_tools_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tool_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcp_tools_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcp_tools_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcp_tools_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcp_tools_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_categories: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "tool_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_categories_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_categories_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_collection_items: {
        Row: {
          added_at: string
          collection_id: string
          display_order: number | null
          id: string
          notes: string | null
          tool_id: string
        }
        Insert: {
          added_at?: string
          collection_id: string
          display_order?: number | null
          id?: string
          notes?: string | null
          tool_id: string
        }
        Update: {
          added_at?: string
          collection_id?: string
          display_order?: number | null
          id?: string
          notes?: string | null
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "tool_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_collection_items_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "mcp_tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_collection_items_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_collections: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_reviews: {
        Row: {
          created_at: string
          id: string
          is_recommended: boolean | null
          rating: number | null
          review: string | null
          tool_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_recommended?: boolean | null
          rating?: number | null
          review?: string | null
          tool_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_recommended?: boolean | null
          rating?: number | null
          review?: string | null
          tool_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_reviews_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "mcp_tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_reviews_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_usage_logs: {
        Row: {
          action: string
          created_at: string
          error: Json | null
          execution_time_ms: number | null
          id: string
          input: Json | null
          output: Json | null
          session_id: string | null
          tokens_used: number | null
          tool_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          error?: Json | null
          execution_time_ms?: number | null
          id?: string
          input?: Json | null
          output?: Json | null
          session_id?: string | null
          tokens_used?: number | null
          tool_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          error?: Json | null
          execution_time_ms?: number | null
          id?: string
          input?: Json | null
          output?: Json | null
          session_id?: string | null
          tokens_used?: number | null
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_usage_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_usage_logs_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "mcp_tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_usage_logs_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tools: {
        Row: {
          created_at: string
          custom_category: string | null
          custom_config: Json | null
          custom_description: string | null
          custom_name: string | null
          id: string
          is_favorite: boolean | null
          is_pinned: boolean | null
          last_used_at: string | null
          tool_id: string
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_category?: string | null
          custom_config?: Json | null
          custom_description?: string | null
          custom_name?: string | null
          id?: string
          is_favorite?: boolean | null
          is_pinned?: boolean | null
          last_used_at?: string | null
          tool_id: string
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          custom_category?: string | null
          custom_config?: Json | null
          custom_description?: string | null
          custom_name?: string | null
          id?: string
          is_favorite?: boolean | null
          is_pinned?: boolean | null
          last_used_at?: string | null
          tool_id?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "mcp_tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tools_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tools_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          github_id: string | null
          google_id: string | null
          id: string
          kakao_id: string | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          github_id?: string | null
          google_id?: string | null
          id: string
          kakao_id?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          github_id?: string | null
          google_id?: string | null
          id?: string
          kakao_id?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      agents_with_servers: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          is_default: boolean | null
          mcp_servers: Json | null
          name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tools_with_stats: {
        Row: {
          author: string | null
          avg_rating: number | null
          capabilities: Json | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          config_schema: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          docker_image: string | null
          downloads_count: number | null
          embedding: string | null
          github_url: string | null
          id: string | null
          is_official: boolean | null
          is_verified: boolean | null
          long_description: string | null
          name: string | null
          npm_package: string | null
          pip_package: string | null
          popularity_score: number | null
          requirements: Json | null
          reviews_count: number | null
          search_text: unknown | null
          slug: string | null
          stars_count: number | null
          tags: string[] | null
          transport_type: string | null
          updated_at: string | null
          updated_by: string | null
          usage_last_week: number | null
          users_count: number | null
          version: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mcp_tools_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tool_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcp_tools_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcp_tools_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcp_tools_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcp_tools_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          email: string | null
          id: string | null
          joined_at: string | null
          name: string | null
          total_agents: number | null
          total_chat_sessions: number | null
          total_mcp_servers: number | null
        }
        Relationships: []
      }
      user_tools_detailed: {
        Row: {
          author: string | null
          capabilities: Json | null
          category_name: string | null
          category_slug: string | null
          created_at: string | null
          custom_category: string | null
          custom_config: Json | null
          custom_description: string | null
          custom_name: string | null
          github_url: string | null
          id: string | null
          is_favorite: boolean | null
          is_pinned: boolean | null
          last_used_at: string | null
          tool_description: string | null
          tool_id: string | null
          tool_name: string | null
          transport_type: string | null
          updated_at: string | null
          usage_count: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "mcp_tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tools_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tools_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      calculate_tool_popularity_score: {
        Args: { tool_id: string }
        Returns: number
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      search_tools: {
        Args: {
          query: string
          category_filter?: string
          tag_filter?: string[]
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          name: string
          description: string
          category_name: string
          tags: string[]
          author: string
          avg_rating: number
          users_count: number
          relevance_score: number
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
