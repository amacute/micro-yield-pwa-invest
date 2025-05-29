
import { toast } from '@/components/ui/sonner';
import { UserType } from '../types';
import { verifyUserEmail, resendEmailVerification } from '../services';

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
    verifyEmail,
    sendEmailVerification,
    enableTwoFactor,
    disableTwoFactor,
    getSessions,
    terminateSession
  };
}
