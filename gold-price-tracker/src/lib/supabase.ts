import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// TODO: Replace with actual values after Supabase setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Gold Price Data Types
export interface GoldPrice {
  id: number
  source_type: 'international' | 'jewelry' | 'third_party'
  source_name: string
  product_category: string | null
  price: number
  price_unit: string
  change_amount: number | null
  change_percent: number | null
  currency: string
  timestamp: string
  created_at: string
}

export interface EmailSettings {
  id: number
  user_email: string
  push_frequency: 'realtime' | 'daily' | 'weekly' | 'off'
  price_threshold: number
  monitored_brands: string[]
  push_time_start: string
  push_time_end: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DataSource {
  id: number
  source_name: string
  source_type: 'international' | 'jewelry' | 'third_party'
  status: 'online' | 'offline' | 'error'
  last_success_time: string | null
  last_error: string | null
  response_time_ms: number | null
  success_count: number
  error_count: number
  updated_at: string
}

export interface EmailLog {
  id: number
  recipient_email: string
  email_type: 'daily_report' | 'price_alert' | 'test'
  subject: string
  status: 'sent' | 'failed' | 'pending'
  error_message: string | null
  sent_at: string
}
