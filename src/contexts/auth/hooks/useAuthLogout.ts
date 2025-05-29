
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { UserType } from '../types';
import { logoutUser } from '../services';

export function useAuthLogout(
  setUser: (user: UserType | null) => void,
  setSession: (session: any) => void
) {
  const navigate = useNavigate();

  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
      setUser(null);
      setSession(null);
      navigate('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Logout failed');
    }
  };

  return { logout };
}
