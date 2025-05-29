
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/components/ui/sonner';

type UserType = {
  id: string;
  name: string;
  email: string;
  walletBalance: number;
  avatar_url?: string;
  kycVerified: boolean;
  country?: string;
  currency?: string;
  currencySymbol?: string;
  lastDepositTime?: string;
  twoFactorEnabled?: boolean;
  phone?: string;
  profileImageUrl?: string;
  passportUrl?: string;
  sessions?: Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
  }>;
};

type AuthContextType = {
  user: UserType | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, additionalData?: {
    phone?: string;
    country?: string;
    referralCode?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUserProfile?: (updates: Partial<UserType>) => void;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = user !== null && session !== null;

  // Transform Supabase user to our UserType
  const transformUser = (authUser: User, userData: any): UserType => {
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
      sessions: [] // Will be populated separately if needed
    };
  };

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
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

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile data
          setTimeout(async () => {
            const userData = await fetchUserProfile(session.user.id);
            const transformedUser = transformUser(session.user, userData);
            setUser(transformedUser);
          }, 0);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id).then(userData => {
          const transformedUser = transformUser(session.user, userData);
          setUser(transformedUser);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Check if user is admin
      const isAdmin = email.includes('admin');
      
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, additionalData?: {
    phone?: string;
    country?: string;
    referralCode?: string;
  }) => {
    try {
      setLoading(true);
      
      // Check if phone number is already used
      if (additionalData?.phone) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone', additionalData.phone)
          .single();
        
        if (existingUser) {
          throw new Error('Phone number is already registered');
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: additionalData?.phone,
            country: additionalData?.country,
            referral_code: additionalData?.referralCode
          }
        }
      });

      if (error) throw error;

      if (additionalData?.referralCode) {
        toast.success(`Account created with referral code: ${additionalData.referralCode}`);
      } else {
        toast.success('Account created successfully! Please check your email for verification.');
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Signup failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error(error.message || 'Google sign in failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      navigate('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Logout failed');
    }
  };

  const updateUserProfile = async (updates: Partial<UserType>) => {
    if (!user || !session) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.name,
          email: updates.email,
          avatar_url: updates.profileImageUrl,
          wallet_balance: updates.walletBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, ...updates });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const updateUser = async (updatedUser: UserType) => {
    await updateUserProfile(updatedUser);
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      toast.success('Password updated successfully');
    } catch (error: any) {
      console.error('Update password error:', error);
      toast.error(error.message || 'Failed to update password');
      throw error;
    }
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
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

  const sendEmailVerification = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (error) throw error;
      toast.success('Verification email sent');
    } catch (error: any) {
      console.error('Send verification error:', error);
      toast.error(error.message || 'Failed to send verification email');
    }
  };

  const updateCurrency = (currency: string, symbol: string) => {
    updateUserProfile({ currency, currencySymbol: symbol });
  };

  const enableTwoFactor = async (code: string): Promise<boolean> => {
    // Mock implementation - would integrate with actual 2FA service
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (code.length === 6) {
      await updateUserProfile({ twoFactorEnabled: true });
      return true;
    }
    return false;
  };

  const disableTwoFactor = async (code: string): Promise<boolean> => {
    // Mock implementation - would integrate with actual 2FA service
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (code.length === 6) {
      await updateUserProfile({ twoFactorEnabled: false });
      return true;
    }
    return false;
  };

  const getSessions = () => {
    return user?.sessions || [];
  };

  const terminateSession = async (sessionId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Implementation would terminate specific session
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isLoading: loading,
      isAuthenticated,
      session,
      login, 
      signup, 
      logout, 
      updateUserProfile,
      updateUser,
      updatePassword,
      verifyEmail,
      sendEmailVerification,
      updateCurrency,
      enableTwoFactor,
      disableTwoFactor,
      getSessions,
      terminateSession,
      signInWithGoogle
    }}>
      {children}
    </AuthContext.Provider>
  );
};
