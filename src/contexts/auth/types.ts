import { User, Session } from '@supabase/supabase-js';

export type UserType = {
  id: string;
  email: string;
  name: string | null;
  profileImageUrl: string | null;
  walletBalance: number;
  isEmailVerified: boolean;
  avatar_url?: string;
  avatar?: string; // For backwards compatibility
  kycVerified: boolean;
  country?: string;
  currency?: string;
  currencySymbol?: string;
  lastDepositTime?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string; // For TOTP secret storage
  phone?: string;
  passportUrl?: string;
  sessions?: Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
  }>;
};

export interface AdditionalSignupData {
  phone?: string;
  country?: string;
  referralCode?: string;
}

export type AuthContextType = {
  user: UserType | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  session: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    options?: {
      phone?: string;
      country?: string;
      referralCode?: string;
    }
  ) => Promise<void>;
  signupError: string | null;
  updateUserProfile?: (updates: Partial<UserType>) => Promise<void>;
  updateUser?: (user: UserType) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
  sendEmailVerification: (email: string) => Promise<void>;
  updateCurrency: (currency: string, symbol: string) => void;
  enableTwoFactor: (code: string) => Promise<boolean>;
  disableTwoFactor: (code: string) => Promise<boolean>;
  getSessions: () => Array<any>;
  terminateSession: (sessionId: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
};
