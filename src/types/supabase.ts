export type InvestmentStatus = 'pending' | 'active' | 'completed' | 'defaulted' | 'cancelled'
export type TransactionType = 'deposit' | 'withdrawal' | 'investment' | 'return' | 'fee'

export interface Profile {
  id: string
  full_name: string | null
  phone_number: string | null
  country: string | null
  kyc_status: boolean
  risk_score: number
  created_at: string
  updated_at: string
}

export interface InvestmentOpportunity {
  id: string
  title: string
  description: string | null
  amount_required: number
  amount_raised: number
  interest_rate: number
  duration_months: number
  risk_level: number
  borrower_id: string
  status: InvestmentStatus
  created_at: string
  updated_at: string
}

export interface Investment {
  id: string
  investor_id: string
  opportunity_id: string
  amount: number
  expected_return: number
  status: InvestmentStatus
  investment_date: string
  maturity_date: string
  created_at: string
  updated_at: string
}

export interface Wallet {
  id: string
  user_id: string
  balance: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  wallet_id: string
  type: TransactionType
  amount: number
  reference_id: string | null
  status: string
  description: string | null
  created_at: string
}

export interface RepaymentSchedule {
  id: string
  investment_id: string
  due_date: string
  amount: number
  paid_amount: number
  status: string
  created_at: string
  updated_at: string
}

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
      sign_up: {
        Row: {
          id: number
          full_name: string
          username: string
          country: string
          phone_number: string
          address: string
          email_address: string
          created_at: string
        }
        Insert: {
          id?: number
          full_name: string
          username: string
          country: string
          phone_number: string
          address: string
          email_address: string
          created_at?: string
        }
        Update: {
          id?: number
          full_name?: string
          username?: string
          country?: string
          phone_number?: string
          address?: string
          email_address?: string
          created_at?: string
        }
      }
      sign_in: {
        Row: {
          id: number
          email: string
          password: string
          created_at: string
        }
        Insert: {
          id?: number
          email: string
          password: string
          created_at?: string
        }
        Update: {
          id?: number
          email?: string
          password?: string
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