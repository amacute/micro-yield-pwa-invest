
import { toast } from '@/components/ui/sonner';
import { UserType } from '../types';
import { verifyUserEmail, resendEmailVerification } from '../services';
import { enableTwoFactor as enableTwoFactorReal, disableTwoFactor as disableTwoFactorReal, verifyTwoFactorLogin } from '../../../services/twoFactorAuthReal';

export function useAuthSecurity(
  user: UserType | null,
  updateUserProfile: (updates: Partial<UserType>) => Promise<void>
) {
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

  const enableTwoFactor = async (code: string): Promise<boolean> => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return false;
    }

    const result = await enableTwoFactorReal(user.id, code);
    if (result.success) {
      await updateUserProfile({ twoFactorEnabled: true });
      return true;
    }
    return false;
  };

  const disableTwoFactor = async (code: string): Promise<boolean> => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return false;
    }

    const success = await disableTwoFactorReal(user.id, code);
    if (success) {
      await updateUserProfile({ twoFactorEnabled: false });
      return true;
    }
    return false;
  };

  const verifyTwoFactor = async (code: string): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }

    return await verifyTwoFactorLogin(user.id, code);
  };

  const getSessions = (): Array<any> => {
    return user?.sessions || [];
  };

  const terminateSession = async (sessionId: string): Promise<void> => {
    // Implementation for session termination
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return {
    verifyEmail,
    sendEmailVerification,
    enableTwoFactor,
    disableTwoFactor,
    verifyTwoFactor,
    getSessions,
    terminateSession
  };
}
