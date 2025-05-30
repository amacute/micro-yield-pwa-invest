import { Database } from './database.types'
import { createClient } from '@supabase/supabase-js'

export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

// Define commonly used table types
export type UserProfile = Tables['profiles']['Row']
export type Investment = Tables['investments']['Row']
export type Transaction = Tables['transactions']['Row']
export type KYCStatus = Tables['kyc_status']['Row']
export type Loan = Tables['loans']['Row']

// Define commonly used insert types
export type UserProfileInsert = Tables['profiles']['Insert']
export type InvestmentInsert = Tables['investments']['Insert']
export type TransactionInsert = Tables['transactions']['Insert']
export type KYCStatusInsert = Tables['kyc_status']['Insert']
export type LoanInsert = Tables['loans']['Insert']

// Define commonly used update types
export type UserProfileUpdate = Tables['profiles']['Update']
export type InvestmentUpdate = Tables['investments']['Update']
export type TransactionUpdate = Tables['transactions']['Update']
export type KYCStatusUpdate = Tables['kyc_status']['Update']
export type LoanUpdate = Tables['loans']['Update']

// Export type-safe Supabase client
export type TypedSupabaseClient = ReturnType<typeof createClient<Database>>

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
          email: string
          full_name: string | null
          avatar_url: string | null
          wallet_balance: number
          country: string | null
          phone_number: string | null
          country_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          wallet_balance?: number
          country?: string | null
          phone_number?: string | null
          country_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          wallet_balance?: number
          country?: string | null
          phone_number?: string | null
          country_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tiktok_submissions: {
        Row: {
          id: string
          user_id: string
          video_url: string
          status: 'pending' | 'approved' | 'rejected'
          submitted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_url: string
          status?: 'pending' | 'approved' | 'rejected'
          submitted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_url?: string
          status?: 'pending' | 'approved' | 'rejected'
          submitted_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          requester_id: string
          matched_by_id: string | null
          type: 'borrow_request' | 'lend_offer'
          amount: number
          interest_rate: number
          duration_months: number
          amount_to_repay: number | null
          status: 'pending' | 'matched' | 'lender_paid' | 'borrower_received' | 'deposit_made' | 'withdrawable' | 'withdrawn'
          lender_payment_confirmed: boolean
          borrower_payment_received: boolean
          borrower_deposit_made: boolean
          matched_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          matched_by_id?: string | null
          type: 'borrow_request' | 'lend_offer'
          amount: number
          interest_rate: number
          duration_months: number
          amount_to_repay?: number | null
          status?: 'pending' | 'matched' | 'lender_paid' | 'borrower_received' | 'deposit_made' | 'withdrawable' | 'withdrawn'
          lender_payment_confirmed?: boolean
          borrower_payment_received?: boolean
          borrower_deposit_made?: boolean
          matched_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          matched_by_id?: string | null
          type?: 'borrow_request' | 'lend_offer'
          amount?: number
          interest_rate?: number
          duration_months?: number
          amount_to_repay?: number | null
          status?: 'pending' | 'matched' | 'lender_paid' | 'borrower_received' | 'deposit_made' | 'withdrawable' | 'withdrawn'
          lender_payment_confirmed?: boolean
          borrower_payment_received?: boolean
          borrower_deposit_made?: boolean
          matched_at?: string | null
          created_at?: string
          updated_at?: string
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'] 