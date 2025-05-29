import { Database } from './database.types'
import { createClient } from '@supabase/supabase-js'

export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

// Define commonly used table types
export type UserProfile = Tables['user_profiles']['Row']
export type Investment = Tables['investments']['Row']
export type Transaction = Tables['transactions']['Row']
export type KYCStatus = Tables['kyc_status']['Row']

// Define commonly used insert types
export type UserProfileInsert = Tables['user_profiles']['Insert']
export type InvestmentInsert = Tables['investments']['Insert']
export type TransactionInsert = Tables['transactions']['Insert']
export type KYCStatusInsert = Tables['kyc_status']['Insert']

// Define commonly used update types
export type UserProfileUpdate = Tables['user_profiles']['Update']
export type InvestmentUpdate = Tables['investments']['Update']
export type TransactionUpdate = Tables['transactions']['Update']
export type KYCStatusUpdate = Tables['kyc_status']['Update']

// Export type-safe Supabase client
export type TypedSupabaseClient = ReturnType<typeof createClient<Database>> 