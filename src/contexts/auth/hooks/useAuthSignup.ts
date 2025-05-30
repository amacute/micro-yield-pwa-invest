import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { UserType } from '../types';
import { signupUser } from '../services';

export function useAuthSignup(
  setUser: (user: UserType | null) => void,
  setSession: (session: any) => void,
  setLoading: (loading: boolean) => void
) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const signup = async (
    name: string,
    email: string,
    password: string,
    options?: {
      phone?: string;
      country?: string;
      referralCode?: string;
    }
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Validate inputs
      if (!name || !email || !password) {
        throw new Error('Please fill in all required fields');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Format metadata
      const metadata = {
        full_name: name,
        phone_number: options?.phone,
        country: options?.country,
        referral_code: options?.referralCode,
      };

      // Attempt signup
      const { user, session } = await signupUser(email, password, metadata);

      if (user) {
        setUser({
          id: user.id,
          email: user.email!,
          name: metadata.full_name,
          profileImageUrl: null,
          walletBalance: 0,
          isEmailVerified: user.email_confirmed_at ? true : false,
        });
        setSession(session);

        // Show success message
        toast.success('Account created successfully! Please check your email for verification.');
        
        // Navigate to email verification page
        navigate('/verify-email', { state: { email } });
      }
    } catch (error: any) {
      console.error('Signup error:', error);

      // Handle specific error cases
      let errorMessage = 'Failed to create account. Please try again.';

      if (error.message?.toLowerCase().includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message?.includes('already registered')) {
        errorMessage = 'This email is already registered. Please try logging in.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
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
    signInWithGoogle,
    error
  };
}
