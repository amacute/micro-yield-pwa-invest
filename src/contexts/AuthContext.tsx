import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, type Profile } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/components/ui/sonner';

type AuthContextType = {
  user: (User & Profile) | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  session: Session | null;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  updateUserProfile?: (updates: Partial<Profile>) => void;
  updateUser?: (user: (User & Profile) | null) => Promise<void>;
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
  const [user, setUser] = useState<(User & Profile) | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = user !== null && session !== null;

  useEffect(() => {
    // Check active sessions and sets the user
    const session = supabase.auth.getSession();
    setUser(session?.user || null);
    setLoading(false);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser({ ...session.user, ...profile });
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        setUser({ ...data.user, ...profile });
        navigate('/');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      navigate('/login');
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            full_name: name,
            wallet_balance: 0,
            total_invested: 0,
            total_returns: 0,
          });

        if (profileError) throw profileError;

        navigate('/verify-email');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<Profile>) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) throw new Error('No user logged in');

      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUser(prev => prev ? { ...prev, ...updatedProfile } : null);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updatedUser: (User & Profile) | null) => {
    await updateUserProfile(updatedUser || {});
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoading: loading,
        isAuthenticated,
        session,
        error,
        login,
        logout,
        register,
        resetPassword,
        updateProfile: updateUserProfile,
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
