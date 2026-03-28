export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      automation_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          emails_failed: number | null
          emails_sent: number | null
          error_message: string | null
          id: string
          metadata: Json | null
          retries_attempted: number | null
          run_type: string
          started_at: string
          status: string
          subscribers_processed: number | null
          subscribers_total: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          emails_failed?: number | null
          emails_sent?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          retries_attempted?: number | null
          run_type: string
          started_at?: string
          status?: string
          subscribers_processed?: number | null
          subscribers_total?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          emails_failed?: number | null
          emails_sent?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          retries_attempted?: number | null
          run_type?: string
          started_at?: string
          status?: string
          subscribers_processed?: number | null
          subscribers_total?: number | null
        }
        Relationships: []
      }
      daily_metrics: {
        Row: {
          button_clicks: number | null
          click_rate: number | null
          conversion_rate: number | null
          created_at: string
          date: string
          id: string
          metadata: Json | null
          new_signups: number | null
          open_rate: number | null
          page_views: number | null
          stripe_revenue: number | null
          total_subscribers: number | null
        }
        Insert: {
          button_clicks?: number | null
          click_rate?: number | null
          conversion_rate?: number | null
          created_at?: string
          date?: string
          id?: string
          metadata?: Json | null
          new_signups?: number | null
          open_rate?: number | null
          page_views?: number | null
          stripe_revenue?: number | null
          total_subscribers?: number | null
        }
        Update: {
          button_clicks?: number | null
          click_rate?: number | null
          conversion_rate?: number | null
          created_at?: string
          date?: string
          id?: string
          metadata?: Json | null
          new_signups?: number | null
          open_rate?: number | null
          page_views?: number | null
          stripe_revenue?: number | null
          total_subscribers?: number | null
        }
        Relationships: []
      }
      homepage_variants: {
        Row: {
          conversions: number | null
          created_at: string
          created_by: string | null
          id: string
          impressions: number | null
          is_active: boolean | null
          is_archived: boolean | null
          last_updated: string | null
          performance_score: number | null
          section_type: string
          variant_metadata: Json | null
          variant_text: string
        }
        Insert: {
          conversions?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          impressions?: number | null
          is_active?: boolean | null
          is_archived?: boolean | null
          last_updated?: string | null
          performance_score?: number | null
          section_type: string
          variant_metadata?: Json | null
          variant_text: string
        }
        Update: {
          conversions?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          impressions?: number | null
          is_active?: boolean | null
          is_archived?: boolean | null
          last_updated?: string | null
          performance_score?: number | null
          section_type?: string
          variant_metadata?: Json | null
          variant_text?: string
        }
        Relationships: []
      }
      interaction_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          session_id: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          session_id?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          session_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interaction_events_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "homepage_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletters: {
        Row: {
          automation_run_id: string | null
          content_html: string
          created_at: string
          created_by: string | null
          id: string
          is_global: boolean | null
          issue_number: number
          send_attempts: number | null
          send_error: string | null
          send_status: string | null
          sent_at: string | null
          summary: string | null
          target_user_id: string | null
          title: string
        }
        Insert: {
          automation_run_id?: string | null
          content_html: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_global?: boolean | null
          issue_number?: number
          send_attempts?: number | null
          send_error?: string | null
          send_status?: string | null
          sent_at?: string | null
          summary?: string | null
          target_user_id?: string | null
          title: string
        }
        Update: {
          automation_run_id?: string | null
          content_html?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_global?: boolean | null
          issue_number?: number
          send_attempts?: number | null
          send_error?: string | null
          send_status?: string | null
          sent_at?: string | null
          summary?: string | null
          target_user_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletters_automation_run_id_fkey"
            columns: ["automation_run_id"]
            isOneToOne: false
            referencedRelation: "automation_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          experience_level: string | null
          full_name: string | null
          id: string
          niche_interests: string[] | null
          risk_level: string | null
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          experience_level?: string | null
          full_name?: string | null
          id: string
          niche_interests?: string[] | null
          risk_level?: string | null
          subscription_tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          experience_level?: string | null
          full_name?: string | null
          id?: string
          niche_interests?: string[] | null
          risk_level?: string | null
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean | null
          joined_at: string
          tier: string
          user_id: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          tier?: string
          user_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          tier?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
