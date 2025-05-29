
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { signupUser, signInWithGoogleProvider } from '../services';

interface SimpleSignupData {
  full_name: string;
  phone?: string;
  country?: string;
  referral_code?: string;
}

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

      // Create simple object with explicit typing to avoid deep instantiation
      const userData: SimpleSignupData = {
        full_name: name
      };

      if (additionalData?.phone) {
        userData.phone = additionalData.phone;
      }
      
      if (additionalData?.country) {
        userData.country = additionalData.country;
      }
      
      if (additionalData?.referralCode) {
        userData.referral_code = additionalData.referralCode;
      }

      await signupUser(email, password, userData);

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
