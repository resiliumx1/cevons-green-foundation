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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          direction: string | null
          id: string
          related_id: string
          related_type: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          direction?: string | null
          id?: string
          related_id: string
          related_type: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          direction?: string | null
          id?: string
          related_id?: string
          related_type?: string
          type?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          channel: string | null
          cost: number
          created_at: string
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          updated_at: string
          utm_campaign: string | null
        }
        Insert: {
          channel?: string | null
          cost?: number
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
        }
        Update: {
          channel?: string | null
          cost?: number
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          attachment_url: string | null
          created_at: string
          email: string
          id: string
          landing_page: string | null
          message: string
          name: string
          phone: string | null
          reference: string | null
          referrer: string | null
          status: string
          subject: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          email: string
          id?: string
          landing_page?: string | null
          message: string
          name: string
          phone?: string | null
          reference?: string | null
          referrer?: string | null
          status?: string
          subject?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          email?: string
          id?: string
          landing_page?: string | null
          message?: string
          name?: string
          phone?: string | null
          reference?: string | null
          referrer?: string | null
          status?: string
          subject?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      crm_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          region: string | null
          source: string | null
          status: string
          type: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          region?: string | null
          source?: string | null
          status?: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          region?: string | null
          source?: string | null
          status?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string
          customer_id: string | null
          due_date: string | null
          id: string
          issued_date: string | null
          job_id: string | null
          line_items: Json
          notes: string | null
          number: string
          paid_date: string | null
          status: string
          subtotal: number | null
          tax: number | null
          total: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          id?: string
          issued_date?: string | null
          job_id?: string | null
          line_items?: Json
          notes?: string | null
          number: string
          paid_date?: string | null
          status?: string
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          id?: string
          issued_date?: string | null
          job_id?: string | null
          line_items?: Json
          notes?: string | null
          number?: string
          paid_date?: string | null
          status?: string
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          address: string | null
          assigned_to: string | null
          created_at: string
          customer_id: string | null
          id: string
          notes: string | null
          number: string
          quote_id: string | null
          region: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          service: string | null
          service_request_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          number: string
          quote_id?: string | null
          region?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          service?: string | null
          service_request_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          number?: string
          quote_id?: string | null
          region?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          service?: string | null
          service_request_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_items: {
        Row: {
          body: string | null
          created_at: string
          external_url: string | null
          id: string
          image_url: string | null
          is_published: boolean
          outlet: string | null
          published_at: string
          sort_order: number
          summary: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          outlet?: string | null
          published_at?: string
          sort_order?: number
          summary?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          outlet?: string | null
          published_at?: string
          sort_order?: number
          summary?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          consent: boolean
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          consent?: boolean
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          consent?: boolean
          created_at?: string
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          campaigns: boolean
          id: string
          leads: boolean
          messages: boolean
          reviews: boolean
          system: boolean
          updated_at: string
        }
        Insert: {
          campaigns?: boolean
          id?: string
          leads?: boolean
          messages?: boolean
          reviews?: boolean
          system?: boolean
          updated_at?: string
        }
        Update: {
          campaigns?: boolean
          id?: string
          leads?: boolean
          messages?: boolean
          reviews?: boolean
          system?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: []
      }
      quotes: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          line_items: Json
          notes: string | null
          number: string
          service_request_id: string | null
          status: string
          subtotal: number | null
          tax: number | null
          title: string | null
          total: number | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          line_items?: Json
          notes?: string | null
          number: string
          service_request_id?: string | null
          status?: string
          subtotal?: number | null
          tax?: number | null
          title?: string | null
          total?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          line_items?: Json
          notes?: string | null
          number?: string
          service_request_id?: string | null
          status?: string
          subtotal?: number | null
          tax?: number | null
          title?: string | null
          total?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      request_status_events: {
        Row: {
          created_at: string
          id: string
          note: string | null
          request_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          request_id: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          request_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_status_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          customer_id: string | null
          id: string
          rating: number | null
          response: string | null
          review_date: string | null
          reviewer_name: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          rating?: number | null
          response?: string | null
          review_date?: string | null
          reviewer_name?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          rating?: number | null
          response?: string | null
          review_date?: string | null
          reviewer_name?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          assigned_to: string | null
          category: string | null
          company: string | null
          contact_method: string | null
          created_at: string
          customer_id: string | null
          customer_type: string | null
          details: Json
          email: string | null
          estimated_value: number | null
          file_urls: string[]
          id: string
          landing_page: string | null
          last_contacted_at: string | null
          lost_reason: string | null
          message: string | null
          name: string | null
          phone: string | null
          preferred_date: string | null
          preferred_time: string | null
          reference: string
          referrer: string | null
          region: string | null
          service: string | null
          status: string
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          company?: string | null
          contact_method?: string | null
          created_at?: string
          customer_id?: string | null
          customer_type?: string | null
          details?: Json
          email?: string | null
          estimated_value?: number | null
          file_urls?: string[]
          id?: string
          landing_page?: string | null
          last_contacted_at?: string | null
          lost_reason?: string | null
          message?: string | null
          name?: string | null
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          reference?: string
          referrer?: string | null
          region?: string | null
          service?: string | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          company?: string | null
          contact_method?: string | null
          created_at?: string
          customer_id?: string | null
          customer_type?: string | null
          details?: Json
          email?: string | null
          estimated_value?: number | null
          file_urls?: string[]
          id?: string
          landing_page?: string | null
          last_contacted_at?: string | null
          lost_reason?: string | null
          message?: string | null
          name?: string | null
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          reference?: string
          referrer?: string | null
          region?: string | null
          service?: string | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      utm_links: {
        Row: {
          base_url: string
          created_at: string
          full_url: string
          id: string
          label: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          base_url: string
          created_at?: string
          full_url: string
          id?: string
          label?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          base_url?: string
          created_at?: string
          full_url?: string
          id?: string
          label?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_contact_message_reference: { Args: never; Returns: string }
      generate_request_reference: { Args: never; Returns: string }
      get_request_status: {
        Args: { _reference: string }
        Returns: {
          created_at: string
          reference: string
          service: string
          status: string
        }[]
      }
      notif_pref_enabled: {
        Args: { _type: Database["public"]["Enums"]["notification_type"] }
        Returns: boolean
      }
      submit_contact_message: { Args: { payload: Json }; Returns: undefined }
      submit_service_request: { Args: { payload: Json }; Returns: string }
    }
    Enums: {
      notification_type: "lead" | "review" | "message" | "campaign" | "system"
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
      notification_type: ["lead", "review", "message", "campaign", "system"],
    },
  },
} as const
