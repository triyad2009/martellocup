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
      about_content: {
        Row: {
          created_at: string
          description_bn: string
          description_en: string
          id: string
          is_singleton: boolean
          mission_bn: string
          mission_en: string
          updated_at: string
          vision_bn: string
          vision_en: string
        }
        Insert: {
          created_at?: string
          description_bn?: string
          description_en?: string
          id?: string
          is_singleton?: boolean
          mission_bn?: string
          mission_en?: string
          updated_at?: string
          vision_bn?: string
          vision_en?: string
        }
        Update: {
          created_at?: string
          description_bn?: string
          description_en?: string
          id?: string
          is_singleton?: boolean
          mission_bn?: string
          mission_en?: string
          updated_at?: string
          vision_bn?: string
          vision_en?: string
        }
        Relationships: []
      }
      ai_knowledge: {
        Row: {
          answer_bn: string
          answer_en: string
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          media_urls: string[]
          question: string
          route: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer_bn: string
          answer_en: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          media_urls?: string[]
          question: string
          route?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer_bn?: string
          answer_en?: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          media_urls?: string[]
          question?: string
          route?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      committee_members: {
        Row: {
          created_at: string
          id: string
          name: string
          photo_url: string | null
          role_bn: string
          role_en: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          photo_url?: string | null
          role_bn: string
          role_en: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          photo_url?: string | null
          role_bn?: string
          role_en?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      contact_info: {
        Row: {
          address_bn: string | null
          address_en: string | null
          created_at: string
          email: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          is_singleton: boolean
          phone: string | null
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          address_bn?: string | null
          address_en?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          is_singleton?: boolean
          phone?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          address_bn?: string | null
          address_en?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          is_singleton?: boolean
          phone?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      feed_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          tagged_user_ids: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          tagged_user_ids?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          tagged_user_ids?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          caption: string | null
          content: string | null
          created_at: string
          id: string
          media_type: string
          media_url: string | null
          tagged_user_ids: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          content?: string | null
          created_at?: string
          id?: string
          media_type?: string
          media_url?: string | null
          tagged_user_ids?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          content?: string | null
          created_at?: string
          id?: string
          media_type?: string
          media_url?: string | null
          tagged_user_ids?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fixtures: {
        Row: {
          away_team: string
          created_at: string
          home_team: string
          id: string
          match_date: string
          match_time: string | null
          round: string | null
          sort_order: number
          status: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          away_team: string
          created_at?: string
          home_team: string
          id?: string
          match_date: string
          match_time?: string | null
          round?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          away_team?: string
          created_at?: string
          home_team?: string
          id?: string
          match_date?: string
          match_time?: string | null
          round?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          caption_bn: string | null
          caption_en: string | null
          created_at: string
          id: string
          image_url: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          caption_bn?: string | null
          caption_en?: string | null
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          caption_bn?: string | null
          caption_en?: string | null
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      hero_stats: {
        Row: {
          created_at: string
          goals_count: number
          id: string
          is_singleton: boolean
          matches_count: number
          players_count: number
          teams_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          goals_count?: number
          id?: string
          is_singleton?: boolean
          matches_count?: number
          players_count?: number
          teams_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          goals_count?: number
          id?: string
          is_singleton?: boolean
          matches_count?: number
          players_count?: number
          teams_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      jersey_orders: {
        Row: {
          admin_notes: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_charge: number
          discount_amount: number
          email_sent_at: string | null
          id: string
          jersey_number: number | null
          jersey_print_name: string
          notes: string | null
          payment_method: string
          product_id: string | null
          product_name: string
          promo_code: string | null
          quantity: number
          rejection_reason: string | null
          size: string
          status: string
          total_amount: number
          tracking_code: string | null
          unit_price: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_charge?: number
          discount_amount?: number
          email_sent_at?: string | null
          id?: string
          jersey_number?: number | null
          jersey_print_name: string
          notes?: string | null
          payment_method?: string
          product_id?: string | null
          product_name: string
          promo_code?: string | null
          quantity?: number
          rejection_reason?: string | null
          size: string
          status?: string
          total_amount?: number
          tracking_code?: string | null
          unit_price?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string
          delivery_charge?: number
          discount_amount?: number
          email_sent_at?: string | null
          id?: string
          jersey_number?: number | null
          jersey_print_name?: string
          notes?: string | null
          payment_method?: string
          product_id?: string | null
          product_name?: string
          promo_code?: string | null
          quantity?: number
          rejection_reason?: string | null
          size?: string
          status?: string
          total_amount?: number
          tracking_code?: string | null
          unit_price?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jersey_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "jersey_products"
            referencedColumns: ["id"]
          },
        ]
      }
      jersey_products: {
        Row: {
          available_sizes: string[]
          cod_enabled: boolean
          created_at: string
          delivery_charge: number
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          size_chart: Json | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          available_sizes?: string[]
          cod_enabled?: boolean
          created_at?: string
          delivery_charge?: number
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price?: number
          size_chart?: Json | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          available_sizes?: string[]
          cod_enabled?: boolean
          created_at?: string
          delivery_charge?: number
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          size_chart?: Json | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          bio_bn: string | null
          bio_en: string | null
          bio_sat: string | null
          created_at: string
          email: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          name: string
          phone: string | null
          photo_url: string | null
          role_bn: string
          role_en: string
          role_sat: string
          sort_order: number
          tiktok_url: string | null
          updated_at: string
          whatsapp_url: string | null
          youtube_url: string | null
        }
        Insert: {
          bio_bn?: string | null
          bio_en?: string | null
          bio_sat?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          role_bn?: string
          role_en?: string
          role_sat?: string
          sort_order?: number
          tiktok_url?: string | null
          updated_at?: string
          whatsapp_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          bio_bn?: string | null
          bio_en?: string | null
          bio_sat?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          role_bn?: string
          role_en?: string
          role_sat?: string
          sort_order?: number
          tiktok_url?: string | null
          updated_at?: string
          whatsapp_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          file_name: string | null
          id: string
          media_type: string
          media_url: string | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          file_name?: string | null
          id?: string
          media_type?: string
          media_url?: string | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          file_name?: string | null
          id?: string
          media_type?: string
          media_url?: string | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          category: string | null
          content_bn: string | null
          content_en: string | null
          cover_url: string | null
          created_at: string
          excerpt_bn: string | null
          excerpt_en: string | null
          id: string
          is_published: boolean
          published_date: string
          sort_order: number
          title_bn: string
          title_en: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content_bn?: string | null
          content_en?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt_bn?: string | null
          excerpt_en?: string | null
          id?: string
          is_published?: boolean
          published_date?: string
          sort_order?: number
          title_bn: string
          title_en: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content_bn?: string | null
          content_en?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt_bn?: string | null
          excerpt_en?: string | null
          id?: string
          is_published?: boolean
          published_date?: string
          sort_order?: number
          title_bn?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_number: string
          created_at: string
          id: string
          instructions: string | null
          is_active: boolean
          logo_url: string | null
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          account_number: string
          created_at?: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          logo_url?: string | null
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          account_number?: string
          created_at?: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          logo_url?: string | null
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      payment_submissions: {
        Row: {
          amount: number | null
          created_at: string
          discount_amount: number
          id: string
          jersey_order_id: string | null
          notes: string | null
          payer_name: string
          payer_phone: string
          payment_method_id: string | null
          payment_method_name: string | null
          promo_code: string | null
          registration_id: string | null
          rejection_reason: string | null
          sender_last4: string
          sponsor_id: string | null
          status: string
          submission_type: string
          ticket_code: string | null
          ticket_tier_id: string | null
          ticket_tier_name: string | null
          transaction_id: string | null
          updated_at: string
          used_at: string | null
          used_by: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          discount_amount?: number
          id?: string
          jersey_order_id?: string | null
          notes?: string | null
          payer_name: string
          payer_phone: string
          payment_method_id?: string | null
          payment_method_name?: string | null
          promo_code?: string | null
          registration_id?: string | null
          rejection_reason?: string | null
          sender_last4: string
          sponsor_id?: string | null
          status?: string
          submission_type?: string
          ticket_code?: string | null
          ticket_tier_id?: string | null
          ticket_tier_name?: string | null
          transaction_id?: string | null
          updated_at?: string
          used_at?: string | null
          used_by?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          discount_amount?: number
          id?: string
          jersey_order_id?: string | null
          notes?: string | null
          payer_name?: string
          payer_phone?: string
          payment_method_id?: string | null
          payment_method_name?: string | null
          promo_code?: string | null
          registration_id?: string | null
          rejection_reason?: string | null
          sender_last4?: string
          sponsor_id?: string | null
          status?: string
          submission_type?: string
          ticket_code?: string | null
          ticket_tier_id?: string | null
          ticket_tier_name?: string | null
          transaction_id?: string | null
          updated_at?: string
          used_at?: string | null
          used_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_submissions_jersey_order_id_fkey"
            columns: ["jersey_order_id"]
            isOneToOne: false
            referencedRelation: "jersey_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_submissions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_submissions_ticket_tier_id_fkey"
            columns: ["ticket_tier_id"]
            isOneToOne: false
            referencedRelation: "ticket_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string
          goals: number
          id: string
          jersey: number | null
          name: string
          photo_url: string | null
          position: string | null
          sort_order: number
          team: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          goals?: number
          id?: string
          jersey?: number | null
          name: string
          photo_url?: string | null
          position?: string | null
          sort_order?: number
          team?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          goals?: number
          id?: string
          jersey?: number | null
          name?: string
          photo_url?: string | null
          position?: string | null
          sort_order?: number
          team?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      points_table: {
        Row: {
          created_at: string
          drawn: number
          form: string | null
          goals_against: number
          goals_for: number
          id: string
          lost: number
          played: number
          points: number
          position: number
          team: string
          updated_at: string
          won: number
        }
        Insert: {
          created_at?: string
          drawn?: number
          form?: string | null
          goals_against?: number
          goals_for?: number
          id?: string
          lost?: number
          played?: number
          points?: number
          position?: number
          team: string
          updated_at?: string
          won?: number
        }
        Update: {
          created_at?: string
          drawn?: number
          form?: string | null
          goals_against?: number
          goals_for?: number
          id?: string
          lost?: number
          played?: number
          points?: number
          position?: number
          team?: string
          updated_at?: string
          won?: number
        }
        Relationships: []
      }
      portal_credentials: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          label: string
          last_login_at: string | null
          password_hash: string
          role: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          label: string
          last_login_at?: string | null
          password_hash: string
          role?: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          label?: string
          last_login_at?: string | null
          password_hash?: string
          role?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      portal_expense_slips: {
        Row: {
          created_at: string
          expense_id: string
          file_type: string | null
          file_url: string
          id: string
        }
        Insert: {
          created_at?: string
          expense_id: string
          file_type?: string | null
          file_url: string
          id?: string
        }
        Update: {
          created_at?: string
          expense_id?: string
          file_type?: string | null
          file_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_expense_slips_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "portal_expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          decided_at: string | null
          decided_by_credential: string | null
          decision_note: string | null
          description: string | null
          entry_date: string
          id: string
          requested_by_credential: string | null
          status: string
          title: string
          updated_at: string
          vendor: string | null
        }
        Insert: {
          amount: number
          category?: string
          created_at?: string
          decided_at?: string | null
          decided_by_credential?: string | null
          decision_note?: string | null
          description?: string | null
          entry_date?: string
          id?: string
          requested_by_credential?: string | null
          status?: string
          title: string
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          decided_at?: string | null
          decided_by_credential?: string | null
          decision_note?: string | null
          description?: string | null
          entry_date?: string
          id?: string
          requested_by_credential?: string | null
          status?: string
          title?: string
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_expenses_decided_by_credential_fkey"
            columns: ["decided_by_credential"]
            isOneToOne: false
            referencedRelation: "portal_credentials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_expenses_requested_by_credential_fkey"
            columns: ["requested_by_credential"]
            isOneToOne: false
            referencedRelation: "portal_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_income: {
        Row: {
          amount: number
          collected_by: string | null
          created_at: string
          created_by_credential: string | null
          entry_date: string
          id: string
          method: string
          note: string | null
          receipt_url: string | null
          source_name: string
          source_submission_id: string | null
          source_type: string
        }
        Insert: {
          amount: number
          collected_by?: string | null
          created_at?: string
          created_by_credential?: string | null
          entry_date?: string
          id?: string
          method?: string
          note?: string | null
          receipt_url?: string | null
          source_name: string
          source_submission_id?: string | null
          source_type?: string
        }
        Update: {
          amount?: number
          collected_by?: string | null
          created_at?: string
          created_by_credential?: string | null
          entry_date?: string
          id?: string
          method?: string
          note?: string | null
          receipt_url?: string | null
          source_name?: string
          source_submission_id?: string | null
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_income_created_by_credential_fkey"
            columns: ["created_by_credential"]
            isOneToOne: false
            referencedRelation: "portal_credentials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_income_source_submission_id_fkey"
            columns: ["source_submission_id"]
            isOneToOne: true
            referencedRelation: "payment_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_sessions: {
        Row: {
          created_at: string
          credential_id: string
          expires_at: string
          id: string
          token_hash: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          credential_id: string
          expires_at: string
          id?: string
          token_hash: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          credential_id?: string
          expires_at?: string
          id?: string
          token_hash?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_sessions_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "portal_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          applies_to: string
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          updated_at: string
          used_count: number
        }
        Insert: {
          applies_to?: string
          code: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          used_count?: number
        }
        Update: {
          applies_to?: string
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      registrations: {
        Row: {
          address: string | null
          captain_name: string
          category: string | null
          coach_email: string | null
          coach_name: string
          coach_phone: string
          created_at: string
          description: string | null
          id: string
          players_data: Json
          rejection_reason: string | null
          short_name: string | null
          social_links: Json | null
          status: string
          team_name: string
          tracking_code: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          captain_name: string
          category?: string | null
          coach_email?: string | null
          coach_name: string
          coach_phone: string
          created_at?: string
          description?: string | null
          id?: string
          players_data?: Json
          rejection_reason?: string | null
          short_name?: string | null
          social_links?: Json | null
          status?: string
          team_name: string
          tracking_code?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          captain_name?: string
          category?: string | null
          coach_email?: string | null
          coach_name?: string
          coach_phone?: string
          created_at?: string
          description?: string | null
          id?: string
          players_data?: Json
          rejection_reason?: string | null
          short_name?: string | null
          social_links?: Json | null
          status?: string
          team_name?: string
          tracking_code?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      results: {
        Row: {
          away_score: number
          away_team: string
          created_at: string
          home_score: number
          home_team: string
          id: string
          match_date: string
          motm: string | null
          scorers: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          away_score?: number
          away_team: string
          created_at?: string
          home_score?: number
          home_team: string
          id?: string
          match_date: string
          motm?: string | null
          scorers?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          away_score?: number
          away_team?: string
          created_at?: string
          home_score?: number
          home_team?: string
          id?: string
          match_date?: string
          motm?: string | null
          scorers?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      sponsor_packages: {
        Row: {
          benefits_bn: string
          benefits_en: string
          created_at: string
          id: string
          is_active: boolean
          price: number
          tier: string
          updated_at: string
        }
        Insert: {
          benefits_bn?: string
          benefits_en?: string
          created_at?: string
          id?: string
          is_active?: boolean
          price?: number
          tier: string
          updated_at?: string
        }
        Update: {
          benefits_bn?: string
          benefits_en?: string
          created_at?: string
          id?: string
          is_active?: boolean
          price?: number
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          amount_paid: number | null
          banner_url: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          description_bn: string
          description_en: string
          facebook_url: string | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          name: string
          sort_order: number
          status: string
          tier: string
          updated_at: string
          user_id: string | null
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          amount_paid?: number | null
          banner_url?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description_bn?: string
          description_en?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          name: string
          sort_order?: number
          status?: string
          tier?: string
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          amount_paid?: number | null
          banner_url?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description_bn?: string
          description_en?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          name?: string
          sort_order?: number
          status?: string
          tier?: string
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          caption: string | null
          created_at: string
          expires_at: string
          id: string
          media_type: string
          media_url: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          media_type?: string
          media_url: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          media_type?: string
          media_url?: string
          user_id?: string
        }
        Relationships: []
      }
      super_admin_emails: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          coach: string | null
          color_from: string | null
          color_to: string | null
          created_at: string
          group_name: string | null
          id: string
          logo_url: string | null
          name_bn: string
          name_en: string
          player_count: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          coach?: string | null
          color_from?: string | null
          color_to?: string | null
          created_at?: string
          group_name?: string | null
          id?: string
          logo_url?: string | null
          name_bn: string
          name_en: string
          player_count?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          coach?: string | null
          color_from?: string | null
          color_to?: string | null
          created_at?: string
          group_name?: string | null
          id?: string
          logo_url?: string | null
          name_bn?: string
          name_en?: string
          player_count?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      ticket_tiers: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      tournament_settings: {
        Row: {
          created_at: string
          hero_logo_url: string | null
          id: string
          is_singleton: boolean
          location: string
          season_name: string
          tagline: string
          theme_mode: string
          tournament_start: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hero_logo_url?: string | null
          id?: string
          is_singleton?: boolean
          location?: string
          season_name?: string
          tagline?: string
          theme_mode?: string
          tournament_start?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hero_logo_url?: string | null
          id?: string
          is_singleton?: boolean
          location?: string
          season_name?: string
          tagline?: string
          theme_mode?: string
          tournament_start?: string
          updated_at?: string
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
      wc_chat_messages: {
        Row: {
          country_code: string
          country_name: string
          created_at: string
          display_name: string
          flag_emoji: string | null
          id: string
          message: string
          photo_url: string | null
          user_id: string
        }
        Insert: {
          country_code: string
          country_name: string
          created_at?: string
          display_name: string
          flag_emoji?: string | null
          id?: string
          message: string
          photo_url?: string | null
          user_id: string
        }
        Update: {
          country_code?: string
          country_name?: string
          created_at?: string
          display_name?: string
          flag_emoji?: string | null
          id?: string
          message?: string
          photo_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wc_game_scores: {
        Row: {
          created_at: string
          game_type: string
          id: string
          points_earned: number
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          game_type: string
          id?: string
          points_earned?: number
          score?: number
          user_id: string
        }
        Update: {
          created_at?: string
          game_type?: string
          id?: string
          points_earned?: number
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      wc_participants: {
        Row: {
          country_code: string
          country_name: string
          created_at: string
          display_name: string
          flag_emoji: string | null
          photo_url: string | null
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          country_code: string
          country_name: string
          created_at?: string
          display_name: string
          flag_emoji?: string | null
          photo_url?: string | null
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          country_code?: string
          country_name?: string
          created_at?: string
          display_name?: string
          flag_emoji?: string | null
          photo_url?: string | null
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wc_predictions: {
        Row: {
          away_score: number
          away_team: string
          created_at: string
          home_score: number
          home_team: string
          id: string
          match_date: string | null
          match_id: string
          points_earned: number
          user_id: string
        }
        Insert: {
          away_score: number
          away_team: string
          created_at?: string
          home_score: number
          home_team: string
          id?: string
          match_date?: string | null
          match_id: string
          points_earned?: number
          user_id: string
        }
        Update: {
          away_score?: number
          away_team?: string
          created_at?: string
          home_score?: number
          home_team?: string
          id?: string
          match_date?: string | null
          match_id?: string
          points_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      wc_quiz_attempts: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          points_earned: number
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct: boolean
          points_earned?: number
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          points_earned?: number
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wc_quiz_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "wc_quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      wc_quiz_questions: {
        Row: {
          correct_index: number
          created_at: string
          id: string
          is_active: boolean
          options: Json
          points: number
          question_bn: string
          question_en: string
        }
        Insert: {
          correct_index: number
          created_at?: string
          id?: string
          is_active?: boolean
          options: Json
          points?: number
          question_bn: string
          question_en: string
        }
        Update: {
          correct_index?: number
          created_at?: string
          id?: string
          is_active?: boolean
          options?: Json
          points?: number
          question_bn?: string
          question_en?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_portal_credential: {
        Args: {
          _label: string
          _password: string
          _role: string
          _username: string
        }
        Returns: Json
      }
      admin_set_portal_credential_active: {
        Args: { _active: boolean; _id: string }
        Returns: Json
      }
      get_or_create_conversation: {
        Args: { other_user: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      list_admin_user_ids: {
        Args: never
        Returns: {
          user_id: string
        }[]
      }
      list_approved_teams: {
        Args: never
        Returns: {
          category: string
          created_at: string
          id: string
          short_name: string
          team_name: string
        }[]
      }
      list_members_public: {
        Args: never
        Returns: {
          bio_bn: string
          bio_en: string
          bio_sat: string
          created_at: string
          facebook_url: string
          id: string
          instagram_url: string
          name: string
          photo_url: string
          role_bn: string
          role_en: string
          role_sat: string
          sort_order: number
          tiktok_url: string
          updated_at: string
          whatsapp_url: string
          youtube_url: string
        }[]
      }
      lookup_jersey_order: { Args: { _code: string }; Returns: Json }
      lookup_registration: { Args: { _code: string }; Returns: Json }
      lookup_ticket: {
        Args: { _code: string }
        Returns: {
          amount: number
          created_at: string
          id: string
          payer_name: string
          status: string
          ticket_code: string
          ticket_tier_name: string
          used_at: string
        }[]
      }
      portal_add_income: {
        Args: {
          _amount: number
          _collected_by: string
          _entry_date: string
          _method: string
          _note: string
          _receipt_url: string
          _source_name: string
          _token: string
        }
        Returns: Json
      }
      portal_decide_expense: {
        Args: {
          _decision: string
          _expense_id: string
          _note: string
          _token: string
        }
        Returns: Json
      }
      portal_list_expenses: {
        Args: { _token: string }
        Returns: {
          amount: number
          category: string
          created_at: string
          decided_at: string
          decided_by_credential: string
          decision_note: string
          description: string
          entry_date: string
          id: string
          requested_by_credential: string
          slips: Json
          status: string
          title: string
          vendor: string
        }[]
      }
      portal_list_income: {
        Args: { _token: string }
        Returns: {
          amount: number
          collected_by: string | null
          created_at: string
          created_by_credential: string | null
          entry_date: string
          id: string
          method: string
          note: string | null
          receipt_url: string | null
          source_name: string
          source_submission_id: string | null
          source_type: string
        }[]
        SetofOptions: {
          from: "*"
          to: "portal_income"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      portal_login: {
        Args: { _password: string; _user_agent?: string; _username: string }
        Returns: Json
      }
      portal_submit_expense: {
        Args: {
          _amount: number
          _category: string
          _description: string
          _entry_date: string
          _slip_urls: string[]
          _title: string
          _token: string
          _vendor: string
        }
        Returns: Json
      }
      portal_validate_token: { Args: { _token: string }; Returns: Json }
      redeem_ticket: { Args: { _code: string }; Returns: Json }
      scan_any_code: { Args: { _code: string }; Returns: Json }
      validate_promo_code: {
        Args: { _applies_to: string; _base_amount: number; _code: string }
        Returns: Json
      }
      wc_award_points: { Args: { _points: number }; Returns: undefined }
      wc_leaderboard: {
        Args: { _limit?: number }
        Returns: {
          country_code: string
          country_name: string
          flag_emoji: string
          member_count: number
          total_points: number
        }[]
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "content_manager"
        | "match_manager"
        | "media_manager"
        | "viewer"
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
        "super_admin",
        "admin",
        "content_manager",
        "match_manager",
        "media_manager",
        "viewer",
      ],
    },
  },
} as const
