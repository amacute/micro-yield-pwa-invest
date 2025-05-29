
import { User } from '@supabase/supabase-js';
import { UserType } from './types';

// Transform Supabase user to our UserType
export const transformUser = (authUser: User, userData: any): UserType => {
  return {
    id: authUser.id,
    name: userData?.full_name || authUser.user_metadata?.name || authUser.user_metadata?.full_name || '',
    email: authUser.email || '',
    phone: userData?.phone || authUser.phone || '',
    walletBalance: userData?.wallet_balance || 0,
    kycVerified: userData?.kyc_verified || false,
    country: userData?.country || 'US',
    currency: userData?.currency || 'USD',
    currencySymbol: userData?.currency_symbol || '$',
    twoFactorEnabled: userData?.two_factor_enabled || false,
    profileImageUrl: userData?.avatar_url || '',
    passportUrl: userData?.passport_url || '',
    avatar_url: userData?.avatar_url,
    avatar: userData?.avatar_url, // For backwards compatibility
    sessions: [] // Will be populated separately if needed
  };
};
