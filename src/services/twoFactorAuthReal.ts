
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

// Generate a cryptographically secure random secret for TOTP
export const generateTOTPSecret = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < array.length; i++) {
    secret += chars[array[i] % chars.length];
  }
  
  return secret;
};

// Generate TOTP QR code URL for authenticator apps
export const generateQRCodeURL = (secret: string, userEmail: string, issuer: string = 'Axiomify'): string => {
  const label = encodeURIComponent(`${issuer}:${userEmail}`);
  const issuerParam = encodeURIComponent(issuer);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuerParam}&algorithm=SHA1&digits=6&period=30`;
};

// Simple TOTP verification (in production, use a proper library like 'otpauth')
export const verifyTOTP = (secret: string, token: string): boolean => {
  if (!token || token.length !== 6) return false;
  
  // This is a simplified implementation
  // In production, implement proper TOTP algorithm or use a library
  const timeStep = Math.floor(Date.now() / 30000);
  
  // Check current time window and adjacent windows for clock drift
  for (let window = -1; window <= 1; window++) {
    const computedToken = generateTOTP(secret, timeStep + window);
    if (computedToken === token) {
      return true;
    }
  }
  
  return false;
};

// Simplified TOTP generation (use proper library in production)
const generateTOTP = (secret: string, timeStep: number): string => {
  // This is a placeholder - implement proper HMAC-SHA1 TOTP algorithm
  // or use a library like 'otpauth' in production
  const hash = simpleHash(secret + timeStep.toString());
  return (hash % 1000000).toString().padStart(6, '0');
};

const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const enableTwoFactor = async (userId: string, totpCode: string): Promise<{ success: boolean; secret?: string; qrCodeUrl?: string }> => {
  try {
    // Generate new TOTP secret
    const secret = generateTOTPSecret();
    
    // Verify the provided code against the new secret
    if (!verifyTOTP(secret, totpCode)) {
      toast.error('Invalid verification code. Please try again.');
      return { success: false };
    }

    // Store the secret securely in the user's profile
    const { error } = await supabase
      .from('profiles')
      .update({
        two_factor_secret: secret,
        two_factor_enabled: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;

    // Generate QR code URL for user's authenticator app
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    const qrCodeUrl = generateQRCodeURL(secret, userProfile?.email || '');

    toast.success('Two-factor authentication enabled successfully');
    return { success: true, secret, qrCodeUrl };

  } catch (error: any) {
    console.error('Error enabling 2FA:', error);
    toast.error(error.message || 'Failed to enable two-factor authentication');
    return { success: false };
  }
};

export const disableTwoFactor = async (userId: string, totpCode: string): Promise<boolean> => {
  try {
    // Get user's current TOTP secret
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('two_factor_secret')
      .eq('id', userId)
      .single();

    if (fetchError || !profile?.two_factor_secret) {
      toast.error('Two-factor authentication is not enabled');
      return false;
    }

    // Verify the provided code
    if (!verifyTOTP(profile.two_factor_secret, totpCode)) {
      toast.error('Invalid verification code');
      return false;
    }

    // Disable 2FA
    const { error } = await supabase
      .from('profiles')
      .update({
        two_factor_secret: null,
        two_factor_enabled: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;

    toast.success('Two-factor authentication disabled');
    return true;

  } catch (error: any) {
    console.error('Error disabling 2FA:', error);
    toast.error(error.message || 'Failed to disable two-factor authentication');
    return false;
  }
};

export const verifyTwoFactorLogin = async (userId: string, totpCode: string): Promise<boolean> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('two_factor_secret, two_factor_enabled')
      .eq('id', userId)
      .single();

    if (error || !profile?.two_factor_enabled || !profile?.two_factor_secret) {
      return true; // 2FA not enabled, allow login
    }

    return verifyTOTP(profile.two_factor_secret, totpCode);

  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return false;
  }
};
