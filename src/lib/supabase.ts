import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  wallet_balance: number;
  total_invested: number;
  total_returns: number;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  amount: number;
  type: 'fixed_income' | 'growth' | 'high_yield';
  status: 'active' | 'completed' | 'cancelled';
  expected_return: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'return';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  created_at: string;
}

// Database helper functions
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as Profile;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
};

export const getUserInvestments = async (userId: string) => {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Investment[];
};

export const createInvestment = async (investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('investments')
    .insert(investment)
    .select()
    .single();

  if (error) throw error;
  return data as Investment;
};

export const getUserTransactions = async (userId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Transaction[];
};

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single();

  if (error) throw error;
  return data as Transaction;
}; 