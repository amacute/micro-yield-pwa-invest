
import { toast } from '@/components/ui/sonner';
import { UserType } from '../types';
import { updateUserProfileInDB, updateUserPassword } from '../services';

export function useAuthProfile(
  user: UserType | null,
  session: any,
  setUser: (user: UserType | null) => void
) {
  const updateUserProfile = async (updates: Partial<UserType>): Promise<void> => {
    if (!user || !session) return;

    try {
      await updateUserProfileInDB(user.id, updates);
      setUser({ ...user, ...updates });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const updateUser = async (updatedUser: UserType): Promise<void> => {
    await updateUserProfile(updatedUser);
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await updateUserPassword(newPassword);
      toast.success('Password updated successfully');
    } catch (error: any) {
      console.error('Update password error:', error);
      toast.error(error.message || 'Failed to update password');
      throw error;
    }
  };

  const updateCurrency = (currency: string, symbol: string): void => {
    updateUserProfile({ currency, currencySymbol: symbol });
  };

  return {
    updateUserProfile,
    updateUser,
    updatePassword,
    updateCurrency
  };
}
