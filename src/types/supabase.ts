export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      app_config: {
        Row: {
          key: string
          value: string | null
        }
        Insert: {
          key: string
          value?: string | null
        }
        Update: {
          key?: string
          value?: string | null
        }
        Relationships: []
      }
      course_events: {
        Row: {
          address: string | null
          capacity: number | null
          category: string | null
          contact_email: string | null
          contact_phone: string | null
          course_id: string
          created_at: string | null
          currency: string | null
          description: string | null
          end_at: string
          external_id: string | null
          id: string
          image_url: string | null
          is_cancelled: boolean | null
          is_online: boolean | null
          is_public: boolean | null
          is_published: boolean | null
          location: string | null
          metadata: Json | null
          organizer_id: string | null
          price: number | null
          registration_url: string | null
          requires_payment: boolean | null
          start_at: string
          tags: string[] | null
          timezone: string | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          category?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          course_id?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_at: string
          external_id?: string | null
          id?: string
          image_url?: string | null
          is_cancelled?: boolean | null
          is_online?: boolean | null
          is_public?: boolean | null
          is_published?: boolean | null
          location?: string | null
          metadata?: Json | null
          organizer_id?: string | null
          price?: number | null
          registration_url?: string | null
          requires_payment?: boolean | null
          start_at: string
          tags?: string[] | null
          timezone?: string | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          category?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          course_id?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_at?: string
          external_id?: string | null
          id?: string
          image_url?: string | null
          is_cancelled?: boolean | null
          is_online?: boolean | null
          is_public?: boolean | null
          is_published?: boolean | null
          location?: string | null
          metadata?: Json | null
          organizer_id?: string | null
          price?: number | null
          registration_url?: string | null
          requires_payment?: boolean | null
          start_at?: string
          tags?: string[] | null
          timezone?: string | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_events_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "course_events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      course_gallery: {
        Row: {
          alt_text: string | null
          caption: string | null
          course_id: string
          created_at: string | null
          id: string
          image_url: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          image_url: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          image_url?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_gallery_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_holes: {
        Row: {
          created_at: string | null
          handicap: number | null
          hole_number: number | null
          id: string
          meters: number | null
          notes: string | null
          par: number | null
          tee_box_id: string
          updated_at: string | null
          yards: number | null
        }
        Insert: {
          created_at?: string | null
          handicap?: number | null
          hole_number?: number | null
          id?: string
          meters?: number | null
          notes?: string | null
          par?: number | null
          tee_box_id: string
          updated_at?: string | null
          yards?: number | null
        }
        Update: {
          created_at?: string | null
          handicap?: number | null
          hole_number?: number | null
          id?: string
          meters?: number | null
          notes?: string | null
          par?: number | null
          tee_box_id?: string
          updated_at?: string | null
          yards?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hole_tee_distances_tee_box_id_fkey"
            columns: ["tee_box_id"]
            isOneToOne: false
            referencedRelation: "tee_boxes"
            referencedColumns: ["id"]
          },
        ]
      }
      course_news: {
        Row: {
          category: string | null
          content: string
          course_id: string
          cover_image_url: string | null
          created_at: string | null
          expire_at: string | null
          facebook_id: string | null
          facebook_url: string | null
          id: string
          is_published: boolean | null
          publish_at: string | null
          summary: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          views: number | null
        }
        Insert: {
          category?: string | null
          content: string
          course_id?: string
          cover_image_url?: string | null
          created_at?: string | null
          expire_at?: string | null
          facebook_id?: string | null
          facebook_url?: string | null
          id?: string
          is_published?: boolean | null
          publish_at?: string | null
          summary?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
        }
        Update: {
          category?: string | null
          content?: string
          course_id?: string
          cover_image_url?: string | null
          created_at?: string | null
          expire_at?: string | null
          facebook_id?: string | null
          facebook_url?: string | null
          id?: string
          is_published?: boolean | null
          publish_at?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_news_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_news_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "course_news_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      courses: {
        Row: {
          active: boolean | null
          amenities: string[] | null
          booking_window_days: number | null
          created_at: string | null
          description: string | null
          email: string | null
          facebook: string | null
          golf_course_api_id: number | null
          holes: number | null
          id: string
          image_url: string | null
          instagram: string | null
          location: Json | null
          max_tee_players: number | null
          name: string
          operating_hours: Json | null
          phone: string | null
          rating: number | null
          site_url: string | null
          tee_slot_interval: number | null
          timezone: string | null
        }
        Insert: {
          active?: boolean | null
          amenities?: string[] | null
          booking_window_days?: number | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook?: string | null
          golf_course_api_id?: number | null
          holes?: number | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          location?: Json | null
          max_tee_players?: number | null
          name: string
          operating_hours?: Json | null
          phone?: string | null
          rating?: number | null
          site_url?: string | null
          tee_slot_interval?: number | null
          timezone?: string | null
        }
        Update: {
          active?: boolean | null
          amenities?: string[] | null
          booking_window_days?: number | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook?: string | null
          golf_course_api_id?: number | null
          holes?: number | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          location?: Json | null
          max_tee_players?: number | null
          name?: string
          operating_hours?: Json | null
          phone?: string | null
          rating?: number | null
          site_url?: string | null
          tee_slot_interval?: number | null
          timezone?: string | null
        }
        Relationships: []
      }
      event_attendances: {
        Row: {
          created_at: string
          event_id: string
          guests_count: number
          id: string
          note: string | null
          notified: boolean | null
          status: Database["public"]["Enums"]["event_attendance_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          guests_count?: number
          id?: string
          note?: string | null
          notified?: boolean | null
          status?: Database["public"]["Enums"]["event_attendance_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          guests_count?: number
          id?: string
          note?: string | null
          notified?: boolean | null
          status?: Database["public"]["Enums"]["event_attendance_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendances_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "course_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendances_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_attendances_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_attendances_user_id_fkey2"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_attendances_user_id_fkey2"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      golf_round_holes: {
        Row: {
          created_at: string | null
          fairway_hit: boolean | null
          green_in_regulation: boolean | null
          hole_number: number
          id: string
          notes: string | null
          penalties: number | null
          putts: number | null
          round_id: string
          sand_save: boolean | null
          score_to_par: number | null
          strokes: number | null
          tee_box_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          fairway_hit?: boolean | null
          green_in_regulation?: boolean | null
          hole_number: number
          id?: string
          notes?: string | null
          penalties?: number | null
          putts?: number | null
          round_id: string
          sand_save?: boolean | null
          score_to_par?: number | null
          strokes?: number | null
          tee_box_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          fairway_hit?: boolean | null
          green_in_regulation?: boolean | null
          hole_number?: number
          id?: string
          notes?: string | null
          penalties?: number | null
          putts?: number | null
          round_id?: string
          sand_save?: boolean | null
          score_to_par?: number | null
          strokes?: number | null
          tee_box_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "golf_round_holes_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "golf_round_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "golf_round_holes_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "golf_rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "golf_round_holes_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "tournament_leaderboard"
            referencedColumns: ["round_id"]
          },
          {
            foreignKeyName: "golf_round_holes_tee_box_id_fkey"
            columns: ["tee_box_id"]
            isOneToOne: false
            referencedRelation: "tee_boxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "golf_round_holes_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "golf_round_holes_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      golf_rounds: {
        Row: {
          back_score: number | null
          course_id: string | null
          created_at: string | null
          differential: number | null
          duration_minutes: number | null
          end_time: string | null
          fairways_hit: number | null
          front_score: number | null
          golf_group_id: string | null
          greens_in_regulation: number | null
          id: string
          notes: string | null
          round_date: string
          score_to_par: number | null
          start_time: string | null
          tee_box_id: string | null
          total_penalties: number | null
          total_putts: number | null
          total_score: number | null
          updated_at: string | null
          user_id: string | null
          weather: string | null
        }
        Insert: {
          back_score?: number | null
          course_id?: string | null
          created_at?: string | null
          differential?: number | null
          duration_minutes?: number | null
          end_time?: string | null
          fairways_hit?: number | null
          front_score?: number | null
          golf_group_id?: string | null
          greens_in_regulation?: number | null
          id?: string
          notes?: string | null
          round_date?: string
          score_to_par?: number | null
          start_time?: string | null
          tee_box_id?: string | null
          total_penalties?: number | null
          total_putts?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          weather?: string | null
        }
        Update: {
          back_score?: number | null
          course_id?: string | null
          created_at?: string | null
          differential?: number | null
          duration_minutes?: number | null
          end_time?: string | null
          fairways_hit?: number | null
          front_score?: number | null
          golf_group_id?: string | null
          greens_in_regulation?: number | null
          id?: string
          notes?: string | null
          round_date?: string
          score_to_par?: number | null
          start_time?: string | null
          tee_box_id?: string | null
          total_penalties?: number | null
          total_putts?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          weather?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "golf_rounds_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "golf_rounds_tee_box_id_fkey"
            columns: ["tee_box_id"]
            isOneToOne: false
            referencedRelation: "tee_boxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "golf_rounds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "golf_rounds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      golfer_profiles: {
        Row: {
          availability: Json | null
          avatar_url: string | null
          average_drive_yards: number | null
          average_score: number | null
          city: string | null
          clubs_owned: string[] | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          ghin_id: number | null
          handicap_index: number | null
          home_course_id: string | null
          id: string
          is_coach: boolean | null
          is_pro: boolean
          last_name: string | null
          locale: string | null
          membership_end_date: string | null
          membership_level: string | null
          membership_number: string | null
          membership_start_date: string | null
          notifications: Json | null
          phone: string | null
          playing_frequency: string | null
          preferred_play_days: string[] | null
          preferred_tee_box_id: string | null
          state: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
          zip_code: string | null
        }
        Insert: {
          availability?: Json | null
          avatar_url?: string | null
          average_drive_yards?: number | null
          average_score?: number | null
          city?: string | null
          clubs_owned?: string[] | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          ghin_id?: number | null
          handicap_index?: number | null
          home_course_id?: string | null
          id?: string
          is_coach?: boolean | null
          is_pro?: boolean
          last_name?: string | null
          locale?: string | null
          membership_end_date?: string | null
          membership_level?: string | null
          membership_number?: string | null
          membership_start_date?: string | null
          notifications?: Json | null
          phone?: string | null
          playing_frequency?: string | null
          preferred_play_days?: string[] | null
          preferred_tee_box_id?: string | null
          state?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          zip_code?: string | null
        }
        Update: {
          availability?: Json | null
          avatar_url?: string | null
          average_drive_yards?: number | null
          average_score?: number | null
          city?: string | null
          clubs_owned?: string[] | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          ghin_id?: number | null
          handicap_index?: number | null
          home_course_id?: string | null
          id?: string
          is_coach?: boolean | null
          is_pro?: boolean
          last_name?: string | null
          locale?: string | null
          membership_end_date?: string | null
          membership_level?: string | null
          membership_number?: string | null
          membership_start_date?: string | null
          notifications?: Json | null
          phone?: string | null
          playing_frequency?: string | null
          preferred_play_days?: string[] | null
          preferred_tee_box_id?: string | null
          state?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "golfer_profiles_home_course_id_fkey"
            columns: ["home_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          body: string | null
          created_at: string | null
          id: string
          meta: Json | null
          read: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          meta?: Json | null
          read?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          meta?: Json | null
          read?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      rss_articles: {
        Row: {
          author: string | null
          content: string | null
          created_at: string | null
          description: string | null
          id: string
          link: string
          pub_date: string | null
          source: string | null
          title: string | null
        }
        Insert: {
          author?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          link: string
          pub_date?: string | null
          source?: string | null
          title?: string | null
        }
        Update: {
          author?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          link?: string
          pub_date?: string | null
          source?: string | null
          title?: string | null
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          created_at: string | null
          description: string
          email: string | null
          full_name: string | null
          id: string
          image_url: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          email?: string | null
          full_name?: string | null
          id?: string
          image_url?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          email?: string | null
          full_name?: string | null
          id?: string
          image_url?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_requests_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "support_requests_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tee_boxes: {
        Row: {
          back_bogey_rating: number | null
          back_course_rating: number | null
          back_par: number | null
          back_slope_rating: number | null
          bogey_rating: number | null
          color: string | null
          course_id: string
          course_rating: number | null
          created_at: string | null
          enabled: boolean | null
          front_bogey_rating: number | null
          front_course_rating: number | null
          front_par: number | null
          front_slope_rating: number | null
          gender: string | null
          id: string
          name: string
          number_of_holes: number | null
          par_total: number
          slope_rating: number | null
          total_meters: number | null
          total_yards: number | null
          units: string | null
          updated_at: string | null
        }
        Insert: {
          back_bogey_rating?: number | null
          back_course_rating?: number | null
          back_par?: number | null
          back_slope_rating?: number | null
          bogey_rating?: number | null
          color?: string | null
          course_id: string
          course_rating?: number | null
          created_at?: string | null
          enabled?: boolean | null
          front_bogey_rating?: number | null
          front_course_rating?: number | null
          front_par?: number | null
          front_slope_rating?: number | null
          gender?: string | null
          id?: string
          name: string
          number_of_holes?: number | null
          par_total?: number
          slope_rating?: number | null
          total_meters?: number | null
          total_yards?: number | null
          units?: string | null
          updated_at?: string | null
        }
        Update: {
          back_bogey_rating?: number | null
          back_course_rating?: number | null
          back_par?: number | null
          back_slope_rating?: number | null
          bogey_rating?: number | null
          color?: string | null
          course_id?: string
          course_rating?: number | null
          created_at?: string | null
          enabled?: boolean | null
          front_bogey_rating?: number | null
          front_course_rating?: number | null
          front_par?: number | null
          front_slope_rating?: number | null
          gender?: string | null
          id?: string
          name?: string
          number_of_holes?: number | null
          par_total?: number
          slope_rating?: number | null
          total_meters?: number | null
          total_yards?: number | null
          units?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tee_boxes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      tee_time_reservations: {
        Row: {
          assistance_required: boolean | null
          booking_status: string | null
          caddy_required: boolean | null
          clubs_required: boolean | null
          created_at: string | null
          email: string | null
          first_name: string | null
          golf_cart_required: boolean | null
          holes: number | null
          id: string
          last_name: string | null
          notes: string | null
          payment_status: string | null
          phone: string | null
          push_cart_required: boolean | null
          slot_id: string
          total_price: number | null
          user_id: string | null
        }
        Insert: {
          assistance_required?: boolean | null
          booking_status?: string | null
          caddy_required?: boolean | null
          clubs_required?: boolean | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          golf_cart_required?: boolean | null
          holes?: number | null
          id?: string
          last_name?: string | null
          notes?: string | null
          payment_status?: string | null
          phone?: string | null
          push_cart_required?: boolean | null
          slot_id: string
          total_price?: number | null
          user_id?: string | null
        }
        Update: {
          assistance_required?: boolean | null
          booking_status?: string | null
          caddy_required?: boolean | null
          clubs_required?: boolean | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          golf_cart_required?: boolean | null
          holes?: number | null
          id?: string
          last_name?: string | null
          notes?: string | null
          payment_status?: string | null
          phone?: string | null
          push_cart_required?: boolean | null
          slot_id?: string
          total_price?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "tee_time_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "tee_time_slots_with_reservation_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tee_time_reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tee_time_reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tee_time_slots: {
        Row: {
          course_id: string | null
          created_at: string | null
          hole: number
          id: string
          max_players: number | null
          status: string | null
          tee_date: string
          tee_time: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          hole?: number
          id?: string
          max_players?: number | null
          status?: string | null
          tee_date: string
          tee_time: string
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          hole?: number
          id?: string
          max_players?: number | null
          status?: string | null
          tee_date?: string
          tee_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "tee_time_slots_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_groups: {
        Row: {
          course_id: string
          created_at: string
          game_type: string
          id: string
          is_closed: boolean | null
          max_players: number
          name: string
          starting_hole: number | null
          total_holes: number | null
          tournament_id: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          game_type?: string
          id?: string
          is_closed?: boolean | null
          max_players?: number
          name?: string
          starting_hole?: number | null
          total_holes?: number | null
          tournament_id?: string | null
          user_id?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          game_type?: string
          id?: string
          is_closed?: boolean | null
          max_players?: number
          name?: string
          starting_hole?: number | null
          total_holes?: number | null
          tournament_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "golf_round_groups_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "golf_round_groups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "golf_round_groups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tournament_groups_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_groups_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "v_tournament_rounds_full"
            referencedColumns: ["t_id"]
          },
        ]
      }
      tournament_rounds: {
        Row: {
          back_9_score: number | null
          course_handicap: number | null
          course_id: string
          course_rating: number | null
          created_at: string
          dispute_requested: boolean
          end_datetime: string | null
          front_9_score: number | null
          golf_round_group_id: string | null
          gross_score: number | null
          handicap_index: number | null
          handicap_percent: number | null
          hole_1: number | null
          hole_1_par: number | null
          hole_1_yards: number | null
          hole_10: number | null
          hole_10_par: number | null
          hole_10_yards: number | null
          hole_11: number | null
          hole_11_par: number | null
          hole_11_yards: number | null
          hole_12: number | null
          hole_12_par: number | null
          hole_12_yards: number | null
          hole_13: number | null
          hole_13_par: number | null
          hole_13_yards: number | null
          hole_14: number | null
          hole_14_par: number | null
          hole_14_yards: number | null
          hole_15: number | null
          hole_15_par: number | null
          hole_15_yards: number | null
          hole_16: number | null
          hole_16_par: number | null
          hole_16_yards: number | null
          hole_17: number | null
          hole_17_par: number | null
          hole_17_yards: number | null
          hole_18: number | null
          hole_18_par: number | null
          hole_18_yards: number | null
          hole_2: number | null
          hole_2_par: number | null
          hole_2_yards: number | null
          hole_3: number | null
          hole_3_par: number | null
          hole_3_yards: number | null
          hole_4: number | null
          hole_4_par: number | null
          hole_4_yards: number | null
          hole_5: number | null
          hole_5_par: number | null
          hole_5_yards: number | null
          hole_6: number | null
          hole_6_par: number | null
          hole_6_yards: number | null
          hole_7: number | null
          hole_7_par: number | null
          hole_7_yards: number | null
          hole_8: number | null
          hole_8_par: number | null
          hole_8_yards: number | null
          hole_9: number | null
          hole_9_par: number | null
          hole_9_yards: number | null
          id: string
          is_complete: boolean
          net_score: number | null
          notes: string | null
          pace_of_play: number | null
          slope_rating: number | null
          start_datetime: string | null
          tee_box_id: string | null
          tee_color: string
          total_par: number | null
          total_yards: number | null
          tournament_handicap: number | null
          tournament_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          back_9_score?: number | null
          course_handicap?: number | null
          course_id: string
          course_rating?: number | null
          created_at?: string
          dispute_requested?: boolean
          end_datetime?: string | null
          front_9_score?: number | null
          golf_round_group_id?: string | null
          gross_score?: number | null
          handicap_index?: number | null
          handicap_percent?: number | null
          hole_1?: number | null
          hole_1_par?: number | null
          hole_1_yards?: number | null
          hole_10?: number | null
          hole_10_par?: number | null
          hole_10_yards?: number | null
          hole_11?: number | null
          hole_11_par?: number | null
          hole_11_yards?: number | null
          hole_12?: number | null
          hole_12_par?: number | null
          hole_12_yards?: number | null
          hole_13?: number | null
          hole_13_par?: number | null
          hole_13_yards?: number | null
          hole_14?: number | null
          hole_14_par?: number | null
          hole_14_yards?: number | null
          hole_15?: number | null
          hole_15_par?: number | null
          hole_15_yards?: number | null
          hole_16?: number | null
          hole_16_par?: number | null
          hole_16_yards?: number | null
          hole_17?: number | null
          hole_17_par?: number | null
          hole_17_yards?: number | null
          hole_18?: number | null
          hole_18_par?: number | null
          hole_18_yards?: number | null
          hole_2?: number | null
          hole_2_par?: number | null
          hole_2_yards?: number | null
          hole_3?: number | null
          hole_3_par?: number | null
          hole_3_yards?: number | null
          hole_4?: number | null
          hole_4_par?: number | null
          hole_4_yards?: number | null
          hole_5?: number | null
          hole_5_par?: number | null
          hole_5_yards?: number | null
          hole_6?: number | null
          hole_6_par?: number | null
          hole_6_yards?: number | null
          hole_7?: number | null
          hole_7_par?: number | null
          hole_7_yards?: number | null
          hole_8?: number | null
          hole_8_par?: number | null
          hole_8_yards?: number | null
          hole_9?: number | null
          hole_9_par?: number | null
          hole_9_yards?: number | null
          id?: string
          is_complete?: boolean
          net_score?: number | null
          notes?: string | null
          pace_of_play?: number | null
          slope_rating?: number | null
          start_datetime?: string | null
          tee_box_id?: string | null
          tee_color: string
          total_par?: number | null
          total_yards?: number | null
          tournament_handicap?: number | null
          tournament_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          back_9_score?: number | null
          course_handicap?: number | null
          course_id?: string
          course_rating?: number | null
          created_at?: string
          dispute_requested?: boolean
          end_datetime?: string | null
          front_9_score?: number | null
          golf_round_group_id?: string | null
          gross_score?: number | null
          handicap_index?: number | null
          handicap_percent?: number | null
          hole_1?: number | null
          hole_1_par?: number | null
          hole_1_yards?: number | null
          hole_10?: number | null
          hole_10_par?: number | null
          hole_10_yards?: number | null
          hole_11?: number | null
          hole_11_par?: number | null
          hole_11_yards?: number | null
          hole_12?: number | null
          hole_12_par?: number | null
          hole_12_yards?: number | null
          hole_13?: number | null
          hole_13_par?: number | null
          hole_13_yards?: number | null
          hole_14?: number | null
          hole_14_par?: number | null
          hole_14_yards?: number | null
          hole_15?: number | null
          hole_15_par?: number | null
          hole_15_yards?: number | null
          hole_16?: number | null
          hole_16_par?: number | null
          hole_16_yards?: number | null
          hole_17?: number | null
          hole_17_par?: number | null
          hole_17_yards?: number | null
          hole_18?: number | null
          hole_18_par?: number | null
          hole_18_yards?: number | null
          hole_2?: number | null
          hole_2_par?: number | null
          hole_2_yards?: number | null
          hole_3?: number | null
          hole_3_par?: number | null
          hole_3_yards?: number | null
          hole_4?: number | null
          hole_4_par?: number | null
          hole_4_yards?: number | null
          hole_5?: number | null
          hole_5_par?: number | null
          hole_5_yards?: number | null
          hole_6?: number | null
          hole_6_par?: number | null
          hole_6_yards?: number | null
          hole_7?: number | null
          hole_7_par?: number | null
          hole_7_yards?: number | null
          hole_8?: number | null
          hole_8_par?: number | null
          hole_8_yards?: number | null
          hole_9?: number | null
          hole_9_par?: number | null
          hole_9_yards?: number | null
          id?: string
          is_complete?: boolean
          net_score?: number | null
          notes?: string | null
          pace_of_play?: number | null
          slope_rating?: number | null
          start_datetime?: string | null
          tee_box_id?: string | null
          tee_color?: string
          total_par?: number | null
          total_yards?: number | null
          tournament_handicap?: number | null
          tournament_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_rounds_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_golf_round_group_id_fkey1"
            columns: ["golf_round_group_id"]
            isOneToOne: false
            referencedRelation: "tournament_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_golf_round_group_id_fkey1"
            columns: ["golf_round_group_id"]
            isOneToOne: false
            referencedRelation: "tournament_leaderboard"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "tournament_rounds_golf_round_group_id_fkey1"
            columns: ["golf_round_group_id"]
            isOneToOne: false
            referencedRelation: "v_tournament_rounds_full"
            referencedColumns: ["tg_id"]
          },
          {
            foreignKeyName: "tournament_rounds_tee_box_id_fkey"
            columns: ["tee_box_id"]
            isOneToOne: false
            referencedRelation: "tee_boxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "v_tournament_rounds_full"
            referencedColumns: ["t_id"]
          },
          {
            foreignKeyName: "tournament_rounds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tournament_rounds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tournaments: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          end_at: string | null
          format: string
          handicap_percent: number | null
          id: string
          is_hidden: boolean | null
          max_players: number | null
          metadata: Json | null
          name: string
          organizer_id: string | null
          registration_close_at: string | null
          registration_open_at: string | null
          slug: string
          start_at: string | null
          status: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          end_at?: string | null
          format?: string
          handicap_percent?: number | null
          id?: string
          is_hidden?: boolean | null
          max_players?: number | null
          metadata?: Json | null
          name: string
          organizer_id?: string | null
          registration_close_at?: string | null
          registration_open_at?: string | null
          slug: string
          start_at?: string | null
          status?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          end_at?: string | null
          format?: string
          handicap_percent?: number | null
          id?: string
          is_hidden?: boolean | null
          max_players?: number | null
          metadata?: Json | null
          name?: string
          organizer_id?: string | null
          registration_close_at?: string | null
          registration_open_at?: string | null
          slug?: string
          start_at?: string | null
          status?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournaments_organizer_id_fkey1"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tournaments_organizer_id_fkey1"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_course_flags: {
        Row: {
          course_id: string
          created_at: string
          evaluation: number | null
          id: number
          is_favorite: boolean | null
          review: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          evaluation?: number | null
          id?: number
          is_favorite?: boolean | null
          review?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          evaluation?: number | null
          id?: number
          is_favorite?: boolean | null
          review?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_course_flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          is_admin: boolean | null
          is_course_manager: boolean | null
          is_manager: boolean | null
          is_user: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          is_admin?: boolean | null
          is_course_manager?: boolean | null
          is_manager?: boolean | null
          is_user?: boolean | null
          user_id?: string
        }
        Update: {
          created_at?: string
          is_admin?: boolean | null
          is_course_manager?: boolean | null
          is_manager?: boolean | null
          is_user?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      event_attendances_with_profiles: {
        Row: {
          attendance_created_at: string | null
          attendance_id: string | null
          attendance_updated_at: string | null
          avatar_url: string | null
          event_id: string | null
          first_name: string | null
          guests_count: number | null
          handicap_index: number | null
          home_course_id: string | null
          is_pro: boolean | null
          last_name: string | null
          note: string | null
          notified: boolean | null
          profile_created_at: string | null
          profile_email: string | null
          profile_id: string | null
          profile_phone: string | null
          profile_updated_at: string | null
          status: Database["public"]["Enums"]["event_attendance_status"] | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attendances_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "course_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendances_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_attendances_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_attendances_user_id_fkey2"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_attendances_user_id_fkey2"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "golfer_profiles_home_course_id_fkey"
            columns: ["home_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      golf_round_details: {
        Row: {
          back_dif: number | null
          back_par: number | null
          back_score: number | null
          course_id: string | null
          course_name: string | null
          course_rating: number | null
          created_at: string | null
          differential: number | null
          duration_minutes: number | null
          end_time: string | null
          fairways_hit: number | null
          front_dif: number | null
          front_par: number | null
          front_score: number | null
          golf_group_id: string | null
          greens_in_regulation: number | null
          group_name: string | null
          id: string | null
          notes: string | null
          par_total: number | null
          round_date: string | null
          score_to_par: number | null
          slope_rating: number | null
          start_time: string | null
          tee_box_color: string | null
          tee_box_id: string | null
          tee_box_name: string | null
          total_dif: number | null
          total_penalties: number | null
          total_putts: number | null
          total_score: number | null
          updated_at: string | null
          user_id: string | null
          weather: string | null
        }
        Relationships: [
          {
            foreignKeyName: "golf_rounds_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "golf_rounds_tee_box_id_fkey"
            columns: ["tee_box_id"]
            isOneToOne: false
            referencedRelation: "tee_boxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "golf_rounds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "golf_rounds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      golf_round_holes_details: {
        Row: {
          course_handicap: number | null
          course_hole_id: string | null
          course_par: number | null
          course_yards: number | null
          created_at: string | null
          fairway_hit: boolean | null
          green_in_regulation: boolean | null
          hole_number: number | null
          id: string | null
          notes: string | null
          penalties: number | null
          putts: number | null
          round_id: string | null
          sand_save: boolean | null
          score_to_par: number | null
          strokes: number | null
          tee_box_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "golf_round_holes_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "golf_round_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "golf_round_holes_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "golf_rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "golf_round_holes_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "tournament_leaderboard"
            referencedColumns: ["round_id"]
          },
          {
            foreignKeyName: "golf_round_holes_tee_box_id_fkey"
            columns: ["tee_box_id"]
            isOneToOne: false
            referencedRelation: "tee_boxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "golf_round_holes_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "golf_round_holes_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tee_time_reservations_with_slot: {
        Row: {
          assistance_required: boolean | null
          booking_status: string | null
          caddy_required: boolean | null
          clubs_required: boolean | null
          course_id: string | null
          course_name: string | null
          first_name: string | null
          golf_cart_required: boolean | null
          hole: number | null
          last_name: string | null
          max_players: number | null
          notes: string | null
          payment_status: string | null
          push_cart_required: boolean | null
          reservation_count: number | null
          reservation_created_at: string | null
          reservation_email: string | null
          reservation_id: string | null
          reservation_phone: string | null
          slot_created_at: string | null
          slot_id: string | null
          slot_status: string | null
          tee_date: string | null
          tee_time: string | null
          total_price: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "tee_time_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "tee_time_slots_with_reservation_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tee_time_reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tee_time_reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tee_time_slots_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      tee_time_slots_with_reservation_count: {
        Row: {
          active_reservation_count: number | null
          available_players: number | null
          course_id: string | null
          created_at: string | null
          hole: number | null
          id: string | null
          max_players: number | null
          status: string | null
          tee_date: string | null
          tee_time: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tee_time_slots_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_leaderboard: {
        Row: {
          adjusted_score: number | null
          course_id: string | null
          differential: number | null
          fairways_hit: number | null
          first_name: string | null
          golfer_profile_id: string | null
          golfer_user_id: string | null
          greens_in_regulation: number | null
          group_id: string | null
          last_name: string | null
          position: number | null
          recorded_at: string | null
          round_date: string | null
          round_id: string | null
          tee_box_color: string | null
          tee_box_course_rating: number | null
          tee_box_id: string | null
          tee_box_name: string | null
          tee_box_par_total: number | null
          tee_box_slope_rating: number | null
          tier: string | null
          total_penalties: number | null
          total_putts: number | null
          total_score: number | null
        }
        Relationships: [
          {
            foreignKeyName: "golf_rounds_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "golf_rounds_tee_box_id_fkey"
            columns: ["tee_box_id"]
            isOneToOne: false
            referencedRelation: "tee_boxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "golf_rounds_user_id_fkey"
            columns: ["golfer_user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "golf_rounds_user_id_fkey"
            columns: ["golfer_user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tournament_leaderboard_dense_rank: {
        Row: {
          avatar_url: string | null
          back_9_score: number | null
          course_handicap: number | null
          course_id: string | null
          course_rating: number | null
          end_datetime: string | null
          first_name: string | null
          front_9_score: number | null
          golf_round_group_id: string | null
          gross_score: number | null
          group_name: string | null
          handicap_index: number | null
          handicap_percent: number | null
          id: string | null
          is_complete: boolean | null
          last_name: string | null
          net_score: number | null
          pace_of_play: number | null
          place: number | null
          score_vs_par: number | null
          slope_rating: number | null
          start_datetime: string | null
          tear: string | null
          tee_box_id: string | null
          tee_color: string | null
          total_par: number | null
          total_yards: number | null
          tournament_handicap: number | null
          tournament_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_rounds_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_golf_round_group_id_fkey1"
            columns: ["golf_round_group_id"]
            isOneToOne: false
            referencedRelation: "tournament_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_golf_round_group_id_fkey1"
            columns: ["golf_round_group_id"]
            isOneToOne: false
            referencedRelation: "tournament_leaderboard"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "tournament_rounds_golf_round_group_id_fkey1"
            columns: ["golf_round_group_id"]
            isOneToOne: false
            referencedRelation: "v_tournament_rounds_full"
            referencedColumns: ["tg_id"]
          },
          {
            foreignKeyName: "tournament_rounds_tee_box_id_fkey"
            columns: ["tee_box_id"]
            isOneToOne: false
            referencedRelation: "tee_boxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "v_tournament_rounds_full"
            referencedColumns: ["t_id"]
          },
          {
            foreignKeyName: "tournament_rounds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tournament_rounds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tournament_leaderboard_gapped_rank: {
        Row: {
          avatar_url: string | null
          back_9_score: number | null
          course_handicap: number | null
          course_id: string | null
          course_rating: number | null
          end_datetime: string | null
          first_name: string | null
          front_9_score: number | null
          golf_round_group_id: string | null
          gross_score: number | null
          group_name: string | null
          handicap_index: number | null
          handicap_percent: number | null
          id: string | null
          is_complete: boolean | null
          last_name: string | null
          net_score: number | null
          pace_of_play: number | null
          place: number | null
          score_vs_par: number | null
          slope_rating: number | null
          start_datetime: string | null
          tear: string | null
          tee_box_id: string | null
          tee_color: string | null
          total_par: number | null
          total_yards: number | null
          tournament_handicap: number | null
          tournament_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_rounds_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_golf_round_group_id_fkey1"
            columns: ["golf_round_group_id"]
            isOneToOne: false
            referencedRelation: "tournament_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_golf_round_group_id_fkey1"
            columns: ["golf_round_group_id"]
            isOneToOne: false
            referencedRelation: "tournament_leaderboard"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "tournament_rounds_golf_round_group_id_fkey1"
            columns: ["golf_round_group_id"]
            isOneToOne: false
            referencedRelation: "v_tournament_rounds_full"
            referencedColumns: ["tg_id"]
          },
          {
            foreignKeyName: "tournament_rounds_tee_box_id_fkey"
            columns: ["tee_box_id"]
            isOneToOne: false
            referencedRelation: "tee_boxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "v_tournament_rounds_full"
            referencedColumns: ["t_id"]
          },
          {
            foreignKeyName: "tournament_rounds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tournament_rounds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_profile_view: {
        Row: {
          avatar_url: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          golfer_profile_id: string | null
          handicap_index: number | null
          home_course_id: string | null
          is_admin: boolean | null
          is_course_manager: boolean | null
          is_manager: boolean | null
          is_pro: boolean | null
          is_user: boolean | null
          last_name: string | null
          phone: string | null
          preferred_tee_box_id: string | null
          profile_created_at: string | null
          profile_updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "golfer_profiles_home_course_id_fkey"
            columns: ["home_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      v_tournament_rounds_full: {
        Row: {
          t_course_id: string | null
          t_created_at: string | null
          t_description: string | null
          t_end_at: string | null
          t_format: string | null
          t_handicap_percent: number | null
          t_id: string | null
          t_is_hidden: boolean | null
          t_max_players: number | null
          t_metadata: Json | null
          t_name: string | null
          t_organizer_id: string | null
          t_registration_close_at: string | null
          t_registration_open_at: string | null
          t_slug: string | null
          t_start_at: string | null
          t_status: string | null
          t_timezone: string | null
          t_updated_at: string | null
          tg_course_id: string | null
          tg_created_at: string | null
          tg_game_type: string | null
          tg_id: string | null
          tg_is_closed: boolean | null
          tg_max_players: number | null
          tg_name: string | null
          tg_starting_hole: number | null
          tg_total_holes: number | null
          tg_tournament_id: string | null
          tg_user_id: string | null
          tr_back_9_score: number | null
          tr_course_handicap: number | null
          tr_course_id: string | null
          tr_course_rating: number | null
          tr_created_at: string | null
          tr_dispute_requested: boolean | null
          tr_end_datetime: string | null
          tr_front_9_score: number | null
          tr_golf_round_group_id: string | null
          tr_gross_score: number | null
          tr_handicap_index: number | null
          tr_handicap_percent: number | null
          tr_hole_1: number | null
          tr_hole_1_par: number | null
          tr_hole_1_yards: number | null
          tr_hole_10: number | null
          tr_hole_10_par: number | null
          tr_hole_10_yards: number | null
          tr_hole_11: number | null
          tr_hole_11_par: number | null
          tr_hole_11_yards: number | null
          tr_hole_12: number | null
          tr_hole_12_par: number | null
          tr_hole_12_yards: number | null
          tr_hole_13: number | null
          tr_hole_13_par: number | null
          tr_hole_13_yards: number | null
          tr_hole_14: number | null
          tr_hole_14_par: number | null
          tr_hole_14_yards: number | null
          tr_hole_15: number | null
          tr_hole_15_par: number | null
          tr_hole_15_yards: number | null
          tr_hole_16: number | null
          tr_hole_16_par: number | null
          tr_hole_16_yards: number | null
          tr_hole_17: number | null
          tr_hole_17_par: number | null
          tr_hole_17_yards: number | null
          tr_hole_18: number | null
          tr_hole_18_par: number | null
          tr_hole_18_yards: number | null
          tr_hole_2: number | null
          tr_hole_2_par: number | null
          tr_hole_2_yards: number | null
          tr_hole_3: number | null
          tr_hole_3_par: number | null
          tr_hole_3_yards: number | null
          tr_hole_4: number | null
          tr_hole_4_par: number | null
          tr_hole_4_yards: number | null
          tr_hole_5: number | null
          tr_hole_5_par: number | null
          tr_hole_5_yards: number | null
          tr_hole_6: number | null
          tr_hole_6_par: number | null
          tr_hole_6_yards: number | null
          tr_hole_7: number | null
          tr_hole_7_par: number | null
          tr_hole_7_yards: number | null
          tr_hole_8: number | null
          tr_hole_8_par: number | null
          tr_hole_8_yards: number | null
          tr_hole_9: number | null
          tr_hole_9_par: number | null
          tr_hole_9_yards: number | null
          tr_id: string | null
          tr_is_complete: boolean | null
          tr_net_score: number | null
          tr_notes: string | null
          tr_pace_of_play: number | null
          tr_slope_rating: number | null
          tr_start_datetime: string | null
          tr_tee_box_id: string | null
          tr_tee_color: string | null
          tr_total_par: number | null
          tr_total_yards: number | null
          tr_tournament_handicap: number | null
          tr_tournament_id: string | null
          tr_updated_at: string | null
          tr_user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "golf_round_groups_course_id_fkey"
            columns: ["tg_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "golf_round_groups_user_id_fkey"
            columns: ["tg_user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "golf_round_groups_user_id_fkey"
            columns: ["tg_user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tournament_groups_tournament_id_fkey"
            columns: ["tg_tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_groups_tournament_id_fkey"
            columns: ["tg_tournament_id"]
            isOneToOne: false
            referencedRelation: "v_tournament_rounds_full"
            referencedColumns: ["t_id"]
          },
          {
            foreignKeyName: "tournament_rounds_course_id_fkey"
            columns: ["tr_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_golf_round_group_id_fkey1"
            columns: ["tr_golf_round_group_id"]
            isOneToOne: false
            referencedRelation: "tournament_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_golf_round_group_id_fkey1"
            columns: ["tr_golf_round_group_id"]
            isOneToOne: false
            referencedRelation: "tournament_leaderboard"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "tournament_rounds_golf_round_group_id_fkey1"
            columns: ["tr_golf_round_group_id"]
            isOneToOne: false
            referencedRelation: "v_tournament_rounds_full"
            referencedColumns: ["tg_id"]
          },
          {
            foreignKeyName: "tournament_rounds_tee_box_id_fkey"
            columns: ["tr_tee_box_id"]
            isOneToOne: false
            referencedRelation: "tee_boxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_tournament_id_fkey"
            columns: ["tr_tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_tournament_id_fkey"
            columns: ["tr_tournament_id"]
            isOneToOne: false
            referencedRelation: "v_tournament_rounds_full"
            referencedColumns: ["t_id"]
          },
          {
            foreignKeyName: "tournament_rounds_user_id_fkey"
            columns: ["tr_user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tournament_rounds_user_id_fkey"
            columns: ["tr_user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tournaments_course_id_fkey"
            columns: ["t_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournaments_organizer_id_fkey1"
            columns: ["t_organizer_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tournaments_organizer_id_fkey1"
            columns: ["t_organizer_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_tournament_rounds_with_groups_preview: {
        Row: {
          course_handicap: number | null
          course_id: string | null
          end_datetime: string | null
          golf_round_group_id: string | null
          gross_score: number | null
          group_game_type: string | null
          group_is_closed: boolean | null
          group_name: string | null
          handicap_index: number | null
          handicap_percent: number | null
          is_complete: boolean | null
          net_score: number | null
          pace_of_play: number | null
          start_datetime: string | null
          tee_box_id: string | null
          tee_color: string | null
          total_par: number | null
          total_yards: number | null
          tournament_end_at: string | null
          tournament_handicap: number | null
          tournament_id: string | null
          tournament_is_hidden: boolean | null
          tournament_name: string | null
          tournament_round_id: string | null
          tournament_start_at: string | null
          tournament_status: string | null
          tournament_timezone: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_rounds_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_golf_round_group_id_fkey1"
            columns: ["golf_round_group_id"]
            isOneToOne: false
            referencedRelation: "tournament_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_golf_round_group_id_fkey1"
            columns: ["golf_round_group_id"]
            isOneToOne: false
            referencedRelation: "tournament_leaderboard"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "tournament_rounds_golf_round_group_id_fkey1"
            columns: ["golf_round_group_id"]
            isOneToOne: false
            referencedRelation: "v_tournament_rounds_full"
            referencedColumns: ["tg_id"]
          },
          {
            foreignKeyName: "tournament_rounds_tee_box_id_fkey"
            columns: ["tee_box_id"]
            isOneToOne: false
            referencedRelation: "tee_boxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "v_tournament_rounds_full"
            referencedColumns: ["t_id"]
          },
          {
            foreignKeyName: "tournament_rounds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "golfer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tournament_rounds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Functions: {
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      fn_create_golfer_profile: {
        Args: { p_email: string; p_user_id: string }
        Returns: undefined
      }
      generate_tee_time_slots_for_course: {
        Args: {
          p_course_id: string
          p_days: number
          p_hole: number
          p_interval_minutes_override?: number
          p_max_players_override?: number
        }
        Returns: number
      }
      generate_tee_time_slots_for_course_day: {
        Args: {
          p_close_time: string
          p_course_id: string
          p_date: string
          p_hole: number
          p_max_players: number
          p_open_time: string
          p_tee_slot_interval: number
        }
        Returns: number
      }
      get_age_distribution: {
        Args: { p_course_id?: string }
        Returns: {
          age_group: string
          avg_handicap: number
          avg_rounds_played: number
          golfer_count: number
          max_age: number
          min_age: number
          percentage: number
        }[]
      }
      get_age_statistics: {
        Args: { p_course_id?: string }
        Returns: {
          avg_age: number
          median_age: number
          most_common_age_group: string
          oldest_age: number
          total_golfers_with_dob: number
          youngest_age: number
        }[]
      }
      get_app_config_value: { Args: { p_key: string }; Returns: string }
      get_average_group_size: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          avg_group_size: number
          five_plus_player_reservations: number
          four_player_reservations: number
          single_player_reservations: number
          three_player_reservations: number
          total_players: number
          total_reservations: number
          two_player_reservations: number
        }[]
      }
      get_average_rounds_per_golfer: {
        Args: {
          p_course_id?: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: {
          avg_rounds_per_golfer: number
          golfers_with_1_to_5_rounds: number
          golfers_with_11_to_20_rounds: number
          golfers_with_20_plus_rounds: number
          golfers_with_6_to_10_rounds: number
          golfers_with_no_rounds: number
          median_rounds_per_golfer: number
          total_golfers: number
          total_rounds: number
        }[]
      }
      get_behavior_dashboard_summary: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          metric_category: string
          metric_name: string
          metric_value: string
          numeric_value: number
        }[]
      }
      get_booking_lead_time: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          avg_lead_time_days: number
          avg_lead_time_hours: number
          max_lead_time_days: number
          median_lead_time_days: number
          min_lead_time_hours: number
          more_than_week_bookings: number
          one_day_advance_bookings: number
          same_day_bookings: number
          total_bookings: number
          two_to_seven_days_bookings: number
        }[]
      }
      get_cancellation_rate: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          advance_cancellations: number
          avg_cancellation_lead_time_days: number
          cancellation_rate: number
          cancelled_reservations: number
          confirmed_reservations: number
          pending_reservations: number
          same_day_cancellations: number
          total_reservations: number
        }[]
      }
      get_cancellation_rate_by_day: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          cancellation_rate: number
          cancelled_reservations: number
          day_number: number
          day_of_week: string
          total_reservations: number
        }[]
      }
      get_cancellation_trends: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          cancellation_rate: number
          cancelled_reservations: number
          total_reservations: number
          week_start: string
        }[]
      }
      get_daily_reservations: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          confirmed_reservations: number
          reservation_date: string
          total_reservations: number
          unique_golfers: number
        }[]
      }
      get_dashboard_summary: {
        Args: { p_course_id: string }
        Returns: {
          active_members_30d: number
          engagement_rate_percent: number
          new_members_30d: number
          total_bookings_30d: number
          total_members: number
          utilization_percent_90d: number
        }[]
      }
      get_decrypted_secret: { Args: { secret_name: string }; Returns: string }
      get_demand_heatmap: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          avg_players_per_slot: number
          booked_slots: number
          day_number: number
          day_of_week: string
          demand_level: string
          hour_of_day: number
          time_slot: string
          total_reservations: number
          total_slots: number
          utilization_percentage: number
        }[]
      }
      get_demand_heatmap_by_date: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          avg_players_per_slot: number
          booked_slots: number
          day_of_week: string
          hour_of_day: number
          reservation_date: string
          time_slot: string
          total_reservations: number
          total_slots: number
          utilization_percentage: number
        }[]
      }
      get_first_time_reservations: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          avg_first_timers_per_day: number
          first_time_guests: number
          first_time_registered_users: number
          percentage_of_total: number
          total_first_time_reservations: number
        }[]
      }
      get_first_time_reservations_by_date: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          first_time_count: number
          first_time_percentage: number
          reservation_date: string
          total_reservations: number
        }[]
      }
      get_gender_distribution: {
        Args: { p_course_id?: string }
        Returns: {
          avg_age: number
          avg_handicap: number
          gender: string
          golfer_count: number
          percentage: number
        }[]
      }
      get_golfer_activity: {
        Args: {
          p_course_id?: string
          p_end_date: string
          p_limit?: number
          p_start_date: string
        }
        Returns: {
          cancelled_reservations: number
          confirmed_reservations: number
          first_reservation_date: string
          golfer_email: string
          golfer_id: string
          golfer_name: string
          is_registered: boolean
          last_reservation_date: string
          total_reservations: number
        }[]
      }
      get_golfer_profile_dashboard: {
        Args: { p_course_id?: string }
        Returns: {
          metric_category: string
          metric_name: string
          metric_value: string
          numeric_value: number
        }[]
      }
      get_group_size_by_date: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          avg_group_size: number
          reservation_date: string
          total_players: number
          total_slots_booked: number
        }[]
      }
      get_holes_preference: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          avg_holes_per_reservation: number
          eighteen_hole_percentage: number
          eighteen_hole_reservations: number
          nine_hole_percentage: number
          nine_hole_reservations: number
          total_reservations: number
        }[]
      }
      get_holes_preference_by_day: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          day_number: number
          day_of_week: string
          eighteen_hole_count: number
          eighteen_hole_percentage: number
          nine_hole_count: number
          total_reservations: number
        }[]
      }
      get_holes_preference_trends: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          eighteen_hole_percentage: number
          month_name: string
          month_start: string
          nine_hole_percentage: number
          total_reservations: number
        }[]
      }
      get_hourly_preference: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          avg_reservations_per_day: number
          hour_of_day: number
          percentage_of_total: number
          time_period: string
          time_slot: string
          total_reservations: number
        }[]
      }
      get_inactive_golfers: {
        Args: { p_course_id?: string; p_months_inactive?: number }
        Returns: {
          avg_months_since_last_round: number
          inactive_golfers: number
          inactive_percentage: number
          total_golfers: number
        }[]
      }
      get_inactive_golfers_list: {
        Args: {
          p_course_id?: string
          p_limit?: number
          p_months_inactive?: number
        }
        Returns: {
          golfer_email: string
          golfer_id: string
          golfer_name: string
          handicap_index: number
          last_round_date: string
          membership_level: string
          months_since_last_round: number
          total_rounds_played: number
        }[]
      }
      get_lead_time_trends: {
        Args: {
          p_course_id?: string
          p_end_date: string
          p_group_by?: string
          p_start_date: string
        }
        Returns: {
          avg_lead_time_days: number
          median_lead_time_days: number
          period_end: string
          period_start: string
          same_day_percentage: number
          total_bookings: number
        }[]
      }
      get_location_distribution_by_city: {
        Args: { p_course_id?: string; p_limit?: number }
        Returns: {
          avg_handicap: number
          city: string
          golfer_count: number
          percentage: number
        }[]
      }
      get_location_distribution_by_country: {
        Args: { p_course_id?: string }
        Returns: {
          avg_handicap: number
          country: string
          golfer_count: number
          percentage: number
        }[]
      }
      get_location_distribution_by_state: {
        Args: { p_course_id?: string }
        Returns: {
          avg_age: number
          avg_handicap: number
          golfer_count: number
          percentage: number
          state: string
        }[]
      }
      get_location_distribution_by_zip: {
        Args: { p_course_id?: string; p_limit?: number }
        Returns: {
          avg_handicap: number
          golfer_count: number
          percentage: number
          zip_code: string
        }[]
      }
      get_member_activity_trends: {
        Args: { p_course_id: string }
        Returns: {
          active_members: number
          member_booking_rate: number
          total_bookings: number
          week: string
        }[]
      }
      get_membership_growth: {
        Args: { p_course_id: string }
        Returns: {
          month: string
          new_members: number
        }[]
      }
      get_monthly_reservations: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          avg_daily_reservations: number
          confirmed_reservations: number
          month_name: string
          month_start: string
          total_reservations: number
          unique_golfers: number
          year: number
        }[]
      }
      get_most_active_age_group: {
        Args: {
          p_course_id?: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: {
          age_group: string
          avg_handicap: number
          avg_rounds_per_golfer: number
          avg_score: number
          max_age: number
          min_age: number
          total_golfers: number
          total_round_percentage: number
          total_rounds: number
        }[]
      }
      get_most_common_group_size: {
        Args: {
          p_course_id?: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: {
          group_count: number
          group_size: number
          percentage: number
          total_players: number
        }[]
      }
      get_most_loyal_players: {
        Args: {
          p_course_id?: string
          p_end_date?: string
          p_limit?: number
          p_start_date?: string
        }
        Returns: {
          avg_score: number
          days_as_member: number
          first_round_date: string
          golfer_email: string
          golfer_id: string
          golfer_name: string
          handicap_index: number
          last_round_date: string
          membership_level: string
          rank: number
          rounds_per_month: number
          total_rounds: number
        }[]
      }
      get_new_golfer_signups: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          cumulative_signups: number
          month_name: string
          month_start: string
          new_signups: number
        }[]
      }
      get_noshow_rate: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          estimated_noshows: number
          noshow_rate: number
          note: string
          total_confirmed_reservations: number
        }[]
      }
      get_noshow_rate_with_checkin: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          checked_in_count: number
          checkin_rate: number
          noshow_count: number
          noshow_rate: number
          total_confirmed_reservations: number
        }[]
      }
      get_peak_reservation_days: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          avg_reservations_per_day: number
          confirmed_reservations: number
          day_number: number
          day_of_week: string
          percentage_of_total: number
          total_reservations: number
        }[]
      }
      get_peak_reservation_hours: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          avg_reservations_per_hour: number
          confirmed_reservations: number
          hour_of_day: number
          percentage_of_total: number
          time_slot: string
          total_reservations: number
        }[]
      }
      get_peak_reservation_time_ranges: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          confirmed_reservations: number
          end_hour: number
          percentage_of_total: number
          start_hour: number
          time_range: string
          total_reservations: number
        }[]
      }
      get_playing_day_by_age_group: {
        Args: {
          p_course_id?: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: {
          age_group: string
          day_number: number
          day_of_week: string
          percentage_of_age_group: number
          total_rounds: number
        }[]
      }
      get_playing_day_distribution_by_age: {
        Args: {
          p_course_id?: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: {
          age_group: string
          day_number: number
          day_of_week: string
          percentage_of_age_group: number
          total_rounds: number
        }[]
      }
      get_popular_tee_times: {
        Args: { p_course_id: string }
        Returns: {
          booking_rate_percent: number
          bookings: number
          time_slot: string
        }[]
      }
      get_repeat_booking_distribution: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          booking_frequency: string
          golfer_count: number
          percentage: number
        }[]
      }
      get_repeat_booking_rate: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          avg_bookings_per_golfer: number
          max_bookings_by_single_golfer: number
          one_time_golfers: number
          repeat_golfers: number
          repeat_rate: number
          total_unique_golfers: number
        }[]
      }
      get_reservation_dashboard_summary: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          metric_category: string
          metric_name: string
          metric_value: string
          numeric_value: number
        }[]
      }
      get_signup_retention_analysis: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          activation_rate: number
          avg_rounds_by_new_golfers: number
          month_name: string
          month_start: string
          new_signups: number
          signups_with_rounds: number
        }[]
      }
      get_time_preference: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          afternoon_count: number
          afternoon_percentage: number
          early_morning_count: number
          early_morning_percentage: number
          evening_count: number
          evening_percentage: number
          morning_count: number
          morning_percentage: number
          most_popular_time_period: string
          total_reservations: number
        }[]
      }
      get_time_preference_by_day: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          afternoon_percentage: number
          day_number: number
          day_of_week: string
          morning_percentage: number
          preferred_time: string
          total_reservations: number
        }[]
      }
      get_time_preference_by_golfer_type: {
        Args: {
          p_course_id?: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: {
          avg_score: number
          golfer_type: string
          percentage: number
          round_count: number
          time_period: string
        }[]
      }
      get_top_repeat_customers: {
        Args: {
          p_course_id?: string
          p_end_date: string
          p_limit?: number
          p_start_date: string
        }
        Returns: {
          avg_bookings_per_month: number
          cancelled_bookings: number
          confirmed_bookings: number
          days_as_customer: number
          first_booking_date: string
          golfer_email: string
          golfer_id: string
          golfer_name: string
          last_booking_date: string
          total_bookings: number
        }[]
      }
      get_total_reservations: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          cancelled_reservations: number
          confirmed_reservations: number
          pending_reservations: number
          total_reservations: number
        }[]
      }
      get_unique_golfers: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          guest_golfers: number
          new_golfers: number
          registered_golfers: number
          returning_golfers: number
          total_unique_golfers: number
        }[]
      }
      get_utilization_by_day: {
        Args: { p_course_id: string }
        Returns: {
          day: string
          day_order: number
          utilization: number
        }[]
      }
      get_walkin_vs_reservation_stats: {
        Args: {
          p_course_id?: string
          p_end_date: string
          p_same_day_hours?: number
          p_start_date: string
        }
        Returns: {
          advance_percentage: number
          advance_reservations: number
          avg_advance_booking_days: number
          same_day_percentage: number
          same_day_reservations: number
          total_players: number
        }[]
      }
      get_weekly_reservations: {
        Args: { p_course_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          confirmed_reservations: number
          total_reservations: number
          unique_golfers: number
          week_end: string
          week_number: number
          week_start: string
          year: number
        }[]
      }
      golfer_profiles_added_over_time: {
        Args: {
          p_end?: string
          p_grain?: string
          p_home_course_id?: string
          p_start?: string
        }
        Returns: {
          bucket: string
          profiles_count: number
        }[]
      }
      insert_course_event: {
        Args: {
          p_course_id: string
          p_description?: string
          p_end_at?: string
          p_external_id?: string
          p_image_url?: string
          p_is_published?: boolean
          p_start_at?: string
          p_title?: string
        }
        Returns: string
      }
      insert_course_news: {
        Args: {
          p_category?: string
          p_content?: string
          p_course_id: string
          p_cover_image_url?: string
          p_expire_at?: string
          p_facebook_id?: string
          p_facebook_url?: string
          p_is_published?: boolean
          p_publish_at?: string
          p_summary?: string
          p_title?: string
          p_user_id?: string
        }
        Returns: string
      }
      insert_rss_article: {
        Args: {
          p_author: string
          p_content: string
          p_description: string
          p_link: string
          p_pub_date: string
          p_source: string
          p_title: string
        }
        Returns: string
      }
    }
    Enums: {
      event_attendance_status:
        | "invited"
        | "interested"
        | "maybe"
        | "going"
        | "waitlist"
        | "declined"
        | "cancelled"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      event_attendance_status: [
        "invited",
        "interested",
        "maybe",
        "going",
        "waitlist",
        "declined",
        "cancelled",
      ],
    },
  },
} as const

