
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { signupUser, signInWithGoogleProvider } from '../services';

interface AdditionalSignupData {
  phone?: string;
  country?: string;
  referralCode?: string;
}

export function useAuthSignup(
  setLoading: (loading: boolean) => void
) {
  const navigate = useNavigate();

  const signup = async (
    name: string, 
    email: string, 
    password: string, 
    additionalData?: AdditionalSignupData
  ): Promise<void> => {
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

  return { signup, signInWithGoogle };
}
