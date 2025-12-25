// Database types for Supabase
// These match our SQL schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
          referral_code: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          referral_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          referral_code?: string | null
          created_at?: string
        }
      }
      point_transactions: {
        Row: {
          id: string
          user_id: string
          type: 'streak' | 'referral' | 'spotlight' | 'share' | 'signup' | 'manual'
          points_delta: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'streak' | 'referral' | 'spotlight' | 'share' | 'signup' | 'manual'
          points_delta: number
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'streak' | 'referral' | 'spotlight' | 'share' | 'signup' | 'manual'
          points_delta?: number
          description?: string | null
          created_at?: string
        }
      }
      daily_streaks: {
        Row: {
          user_id: string
          current_streak: number
          last_claimed_date: string | null
        }
        Insert: {
          user_id: string
          current_streak?: number
          last_claimed_date?: string | null
        }
        Update: {
          user_id?: string
          current_streak?: number
          last_claimed_date?: string | null
        }
      }
      rewards: {
        Row: {
          id: string
          title: string
          description: string | null
          points_cost: number
          status: 'active' | 'coming_soon'
          icon_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          points_cost: number
          status?: 'active' | 'coming_soon'
          icon_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          points_cost?: number
          status?: 'active' | 'coming_soon'
          icon_url?: string | null
          created_at?: string
        }
      }
      reward_redemptions: {
        Row: {
          id: string
          user_id: string
          reward_id: string
          points_spent: number
          status: 'pending' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reward_id: string
          points_spent: number
          status?: 'pending' | 'completed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reward_id?: string
          points_spent?: number
          status?: 'pending' | 'completed' | 'cancelled'
          created_at?: string
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_user_id: string | null
          status: 'pending' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_user_id?: string | null
          status?: 'pending' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_user_id?: string | null
          status?: 'pending' | 'completed'
          created_at?: string
        }
      }
      spotlight_tools: {
        Row: {
          id: string
          name: string
          description: string | null
          cta_label: string | null
          cta_url: string | null
          points_reward: number
          is_featured: boolean
          icon_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          cta_label?: string | null
          cta_url?: string | null
          points_reward?: number
          is_featured?: boolean
          icon_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          cta_label?: string | null
          cta_url?: string | null
          points_reward?: number
          is_featured?: boolean
          icon_url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type PointTransaction = Database['public']['Tables']['point_transactions']['Row']
export type DailyStreak = Database['public']['Tables']['daily_streaks']['Row']
export type Reward = Database['public']['Tables']['rewards']['Row']
export type RewardRedemption = Database['public']['Tables']['reward_redemptions']['Row']
export type Referral = Database['public']['Tables']['referrals']['Row']
export type SpotlightTool = Database['public']['Tables']['spotlight_tools']['Row']
