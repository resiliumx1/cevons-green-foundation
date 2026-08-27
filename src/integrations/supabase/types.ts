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
    PostgrestVersion: "14.17"
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
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          changed_fields: string[] | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          new_status: string | null
          note: string | null
          old_status: string | null
          reference: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          changed_fields?: string[] | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          new_status?: string | null
          note?: string | null
          old_status?: string | null
          reference?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          changed_fields?: string[] | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          new_status?: string | null
          note?: string | null
          old_status?: string | null
          reference?: string | null
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
      content_string_versions: {
        Row: {
          id: string
          key: string
          previous_value: string | null
          replaced_at: string
          replaced_by: string | null
        }
        Insert: {
          id?: string
          key: string
          previous_value?: string | null
          replaced_at?: string
          replaced_by?: string | null
        }
        Update: {
          id?: string
          key?: string
          previous_value?: string | null
          replaced_at?: string
          replaced_by?: string | null
        }
        Relationships: []
      }
      content_strings: {
        Row: {
          draft_value: string | null
          key: string
          label: string
          max_length: number | null
          multiline: boolean
          page: string
          published_value: string | null
          section: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          draft_value?: string | null
          key: string
          label: string
          max_length?: number | null
          multiline?: boolean
          page: string
          published_value?: string | null
          section: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          draft_value?: string | null
          key?: string
          label?: string
          max_length?: number | null
          multiline?: boolean
          page?: string
          published_value?: string | null
          section?: string
          updated_at?: string
          updated_by?: string | null
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
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
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
      media_posts: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_h: number | null
          image_path: string | null
          image_w: number | null
          kind: string
          publish_at: string | null
          published: boolean
          sort_order: number
          title: string
          unpublish_at: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_h?: number | null
          image_path?: string | null
          image_w?: number | null
          kind: string
          publish_at?: string | null
          published?: boolean
          sort_order?: number
          title?: string
          unpublish_at?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_h?: number | null
          image_path?: string | null
          image_w?: number | null
          kind?: string
          publish_at?: string | null
          published?: boolean
          sort_order?: number
          title?: string
          unpublish_at?: string | null
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
      page_section_versions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kind: string
          page: string
          payload: Json
          section_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind: string
          page: string
          payload: Json
          section_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          page?: string
          payload?: Json
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_section_versions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "page_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      page_sections: {
        Row: {
          created_at: string
          draft_payload: Json
          id: string
          kind: string
          page: string
          payload: Json
          position: number
          published: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          draft_payload?: Json
          id?: string
          kind: string
          page: string
          payload?: Json
          position?: number
          published?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          draft_payload?: Json
          id?: string
          kind?: string
          page?: string
          payload?: Json
          position?: number
          published?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          body: string | null
          click_count: number
          created_at: string
          cta_href: string | null
          cta_label: string | null
          ends_at: string | null
          id: string
          palette: string
          placement: string
          published: boolean
          starts_at: string
          target_services: string[]
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          click_count?: number
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          ends_at?: string | null
          id?: string
          palette?: string
          placement?: string
          published?: boolean
          starts_at?: string
          target_services?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          click_count?: number
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          ends_at?: string | null
          id?: string
          palette?: string
          placement?: string
          published?: boolean
          starts_at?: string
          target_services?: string[]
          title?: string
          updated_at?: string
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
          service_branch: string | null
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
          service_branch?: string | null
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
          service_branch?: string | null
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
      site_images: {
        Row: {
          alt: string | null
          draft_alt: string | null
          draft_image_h: number | null
          draft_image_path: string | null
          draft_image_w: number | null
          image_h: number | null
          image_path: string | null
          image_w: number | null
          slot: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          alt?: string | null
          draft_alt?: string | null
          draft_image_h?: number | null
          draft_image_path?: string | null
          draft_image_w?: number | null
          image_h?: number | null
          image_path?: string | null
          image_w?: number | null
          slot: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          alt?: string | null
          draft_alt?: string | null
          draft_image_h?: number | null
          draft_image_path?: string | null
          draft_image_w?: number | null
          image_h?: number | null
          image_path?: string | null
          image_w?: number | null
          slot?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      public_content_strings: {
        Row: {
          key: string | null
          published_value: string | null
        }
        Insert: {
          key?: string | null
          published_value?: string | null
        }
        Update: {
          key?: string | null
          published_value?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_remove_user_access: {
        Args: { _user_id: string }
        Returns: undefined
      }
      admin_set_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      can_publish: { Args: { _user_id: string }; Returns: boolean }
      claim_invitation: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_promotion_click: { Args: { _id: string }; Returns: undefined }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      list_admin_people: {
        Args: never
        Returns: {
          email: string
          role: Database["public"]["Enums"]["app_role"]
          role_granted_at: string
          user_created_at: string
          user_id: string
        }[]
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      notif_pref_enabled: {
        Args: { _type: Database["public"]["Enums"]["notification_type"] }
        Returns: boolean
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      submit_contact_message: { Args: { payload: Json }; Returns: undefined }
      submit_service_request: { Args: { payload: Json }; Returns: string }
    }
    Enums: {
      app_role:
        | "admin"
        | "staff"
        | "user"
        | "owner"
        | "editor"
        | "contributor"
        | "viewer"
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
      app_role: [
        "admin",
        "staff",
        "user",
        "owner",
        "editor",
        "contributor",
        "viewer",
      ],
      notification_type: ["lead", "review", "message", "campaign", "system"],
    },
  },
} as const
