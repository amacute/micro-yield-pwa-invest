
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserType } from '../types';
import {
  loginUser,
  signupUser,
  signInWithGoogleProvider,
  updateUserProfileInDB,
  updateUserPassword,
  verifyUserEmail,
  resendEmailVerification,
  logoutUser
} from '../services';

export function useAuthActions(
  user: UserType | null,
  session: any,
  setUser: (user: UserType | null) => void,
  setSession: (session: any) => void,
  setLoading: (loading: boolean) => void
) {
  const navigate = useNavigate();

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      await loginUser(email, password);

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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (code.length === 6) {
      await updateUserProfile({ twoFactorEnabled: true });
      return true;
    }
    return false;
  };

  const disableTwoFactor = async (code: string): Promise<boolean> => {
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
  };

  return {
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
}
