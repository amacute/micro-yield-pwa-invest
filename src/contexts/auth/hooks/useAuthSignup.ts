
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { AdditionalSignupData } from '../types';

export function useAuthSignup(setLoading: (loading: boolean) => void) {
  const signup = async (
    name: string, 
    email: string, 
    password: string, 
    additionalData?: AdditionalSignupData
  ): Promise<void> => {
    setLoading(true);
    try {
      // Validate password complexity
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone: additionalData?.phone,
            country: additionalData?.country,
            referral_code: additionalData?.referralCode,
          }
        }
      });

      if (error) throw error;

      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Please check your email to verify your account');
      } else {
        toast.success('Account created successfully');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    setLoading(true);
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
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    signup,
    signInWithGoogle
  };
}
