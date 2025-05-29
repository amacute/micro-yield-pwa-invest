import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  referral_code?: string;
}

export const signUp = async (data: SignUpData) => {
  try {
    // Check if referral code is valid if provided
    if (data.referral_code) {
      const { data: referrer, error: referrerError } = await supabase
        .from('users')
        .select('user_id, email, referral_code')
        .eq('referral_code', data.referral_code)
        .single();

      if (referrerError || !referrer) {
        toast.error('Invalid referral code');
        return { error: 'Invalid referral code' };
      }
    }

    // Sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone,
          referral_code: generateReferralCode(),
          referred_by: data.referral_code
        },
        emailRedirectTo: `${window.location.origin}/auth/verify`
      }
    });

    if (signUpError) throw signUpError;

    // Create user profile in users table
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            user_id: authData.user.id,
            email: data.email,
            name: data.name,
            phone: data.phone,
            referral_code: authData.user.user_metadata.referral_code,
            referred_by: data.referral_code,
            wallet_balance: 0,
            kyc_verified: false
          }
        ]);

      if (profileError) throw profileError;

      // If user was referred, create referral record
      if (data.referral_code) {
        const { error: referralError } = await supabase
          .from('referrals')
          .insert([
            {
              referrer_id: (await supabase
                .from('users')
                .select('user_id')
                .eq('referral_code', data.referral_code)
                .single()).data?.user_id,
              referee_id: authData.user.id,
              status: 'pending',
              bonus_amount: 10 // Default referral bonus
            }
          ]);

        if (referralError) throw referralError;
      }
    }

    toast.success('Registration successful! Please check your email to verify your account.');
    return { user: authData.user };
  } catch (error) {
    console.error('Error during sign up:', error);
    toast.error('Failed to create account');
    return { error };
  }
};

export const verifyEmail = async (token: string) => {
  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    });

    if (error) throw error;

    // Update user verification status
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('users')
        .update({ email_verified: true })
        .eq('user_id', user.id);

      // Process referral bonus if user was referred
      const { data: referral } = await supabase
        .from('referrals')
        .select('*')
        .eq('referee_id', user.id)
        .eq('status', 'pending')
        .single();

      if (referral) {
        // Update referrer's wallet balance
        await supabase.rpc('process_referral_bonus', {
          p_referral_id: referral.id,
          p_bonus_amount: referral.bonus_amount
        });
      }
    }

    toast.success('Email verified successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error verifying email:', error);
    toast.error('Failed to verify email');
    return { error };
  }
};

// Generate a unique referral code
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}; 