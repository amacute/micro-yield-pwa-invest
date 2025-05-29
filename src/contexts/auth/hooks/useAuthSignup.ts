
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface AdditionalSignupData {
  phone?: string;
  country?: string;
  referralCode?: string;
}

export function useAuthSignup(
  setLoading: (loading: boolean) => void
) {
  const navigate = useNavigate();

  const signupUser = async (email: string, password: string, metadata: any) => {
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

  const signInWithGoogleProvider = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) throw error;
  };

  const signup = async (
    name: string, 
    email: string, 
    password: string, 
    additionalData?: AdditionalSignupData
  ): Promise<void> => {
    try {
      setLoading(true);
      
      // Validate password strength
      if (password.length < 12) {
        throw new Error('Password must be at least 12 characters long');
      }
      
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        throw new Error('Password must contain uppercase, lowercase, numbers, and special characters');
      }
      
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

      // Create metadata object for Supabase signup
      const metadata = {
        full_name: name,
        ...(additionalData?.phone && { phone: additionalData.phone }),
        ...(additionalData?.country && { country: additionalData.country }),
        ...(additionalData?.referralCode && { referral_code: additionalData.referralCode })
      };

      await signupUser(email, password, metadata);

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

  return { signup, signInWithGoogle };
}
