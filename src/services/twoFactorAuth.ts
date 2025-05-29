
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

// Generate a secure random secret for TOTP
export const generateTOTPSecret = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Simple TOTP implementation (in production, use a proper library like otplib)
export const generateTOTP = (secret: string): string => {
  // This is a simplified implementation
  // In production, use a proper TOTP library like 'otplib'
  const timeStep = Math.floor(Date.now() / 30000);
  const hash = btoa(secret + timeStep.toString()).slice(0, 6);
  return hash.replace(/[^0-9]/g, '0').slice(0, 6);
};

// Verify TOTP code
export const verifyTOTP = (secret: string, token: string): boolean => {
  // Check current time window and ±1 window for clock drift
  const currentWindow = Math.floor(Date.now() / 30000);
  
  for (let i = -1; i <= 1; i++) {
    const timeStep = currentWindow + i;
    const expectedToken = btoa(secret + timeStep.toString()).slice(0, 6).replace(/[^0-9]/g, '0').slice(0, 6);
    if (expectedToken === token) {
      return true;
    }
  }
  return false;
};

// Enable 2FA for user
export const enableTwoFactorAuth = async (userId: string, totpCode: string): Promise<{ success: boolean; secret?: string; backupCodes?: string[] }> => {
  try {
    // Generate secret and backup codes
    const secret = generateTOTPSecret();
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    // Verify the provided TOTP code
    if (!verifyTOTP(secret, totpCode)) {
      return { success: false };
    }

    // Store 2FA settings in database
    const { error } = await supabase
      .from('users')
      .update({
        two_factor_enabled: true,
        two_factor_secret: secret,
        backup_codes: backupCodes,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true, secret, backupCodes };
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    return { success: false };
  }
};

// Disable 2FA for user
export const disableTwoFactorAuth = async (userId: string, totpCode: string): Promise<boolean> => {
  try {
    // Get current secret to verify code
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('two_factor_secret')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Verify the provided TOTP code
    if (!verifyTOTP(userData.two_factor_secret, totpCode)) {
      return false;
    }

    // Disable 2FA
    const { error } = await supabase
      .from('users')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        backup_codes: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return false;
  }
};

// Verify 2FA code during login
export const verifyTwoFactorCode = async (userId: string, code: string): Promise<boolean> => {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('two_factor_secret, backup_codes')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    // Check TOTP code
    if (verifyTOTP(userData.two_factor_secret, code)) {
      return true;
    }

    // Check backup codes
    if (userData.backup_codes && userData.backup_codes.includes(code)) {
      // Remove used backup code
      const updatedBackupCodes = userData.backup_codes.filter((bc: string) => bc !== code);
      
      await supabase
        .from('users')
        .update({ backup_codes: updatedBackupCodes })
        .eq('user_id', userId);

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
    return false;
  }
};
