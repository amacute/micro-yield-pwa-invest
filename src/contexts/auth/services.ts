
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { UserType } from './types';

// Fetch user profile data
export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user profile:', error);
  }
  return data;
};

// Update user profile
export const updateUserProfileInDB = async (userId: string, updates: Partial<UserType>) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: updates.name,
      email: updates.email,
      avatar_url: updates.profileImageUrl,
      wallet_balance: updates.walletBalance,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) throw error;
};

// Authentication services
export const loginUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

export const signupUser = async (email: string, password: string, metadata: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });

  if (error) throw error;
  return data;
};

export const signInWithGoogleProvider = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  });

  if (error) throw error;
};

export const updateUserPassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;
};

export const verifyUserEmail = async (token: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    });

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Email verification error:', error);
    return false;
  }
};

export const resendEmailVerification = async (email: string) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email
  });

  if (error) throw error;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
