
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserType } from '../types';
import { loginUser } from '../services';

export function useAuthLogin(
  setUser: (user: UserType | null) => void,
  setSession: (session: any) => void,
  setLoading: (loading: boolean) => void
) {
  const navigate = useNavigate();

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      await loginUser(email, password);

      const isAdmin = email.includes('admin');
      
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { login };
}
