
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { toast } from '@/components/ui/sonner';
import { AuthContextType, UserType } from './types';
import { transformUser } from './utils';
import {
  fetchUserProfile,
  updateUserProfileInDB,
  loginUser,
  signupUser,
  signInWithGoogleProvider,
  updateUserPassword,
  verifyUserEmail,
  resendEmailVerification,
  logoutUser
} from './services';

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

  const isAuthenticated = user !== null && session !== null;

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetching to avoid blocking auth state updates
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

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      await loginUser(email, password);

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
  }): Promise<void> => {
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

      await signupUser(email, password, {
        full_name: name,
        phone: additionalData?.phone,
        country: additionalData?.country,
        referral_code: additionalData?.referralCode
      });

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

  const signInWithGoogle = async (): Promise<void> => {
    try {
      await signInWithGoogleProvider();
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error(error.message || 'Google sign in failed');
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
      setUser(null);
      setSession(null);
      navigate('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Logout failed');
    }
  };

  const updateUserProfile = async (updates: Partial<UserType>): Promise<void> => {
    if (!user || !session) return;

    try {
      await updateUserProfileInDB(user.id, updates);
      setUser({ ...user, ...updates });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const updateUser = async (updatedUser: UserType): Promise<void> => {
    await updateUserProfile(updatedUser);
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await updateUserPassword(newPassword);
      toast.success('Password updated successfully');
    } catch (error: any) {
      console.error('Update password error:', error);
      toast.error(error.message || 'Failed to update password');
      throw error;
    }
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    return await verifyUserEmail(token);
  };

  const sendEmailVerification = async (email: string): Promise<void> => {
    try {
      await resendEmailVerification(email);
      toast.success('Verification email sent');
    } catch (error: any) {
      console.error('Send verification error:', error);
      toast.error(error.message || 'Failed to send verification email');
    }
  };

  const updateCurrency = (currency: string, symbol: string): void => {
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

  const getSessions = (): Array<any> => {
    return user?.sessions || [];
  };

  const terminateSession = async (sessionId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Implementation would terminate specific session
  };

  // Explicitly type the context value
  const contextValue: AuthContextType = {
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
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
