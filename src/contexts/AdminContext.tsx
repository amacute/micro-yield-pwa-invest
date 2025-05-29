
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

type AdminContextType = {
  isAdmin: boolean;
  adminLevel: 'admin' | 'super_admin' | null;
  loading: boolean;
  checkAdminStatus: () => Promise<void>;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

type AdminProviderProps = {
  children: ReactNode;
};

export const AdminProvider = ({ children }: AdminProviderProps) => {
  const { user, session } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLevel, setAdminLevel] = useState<'admin' | 'super_admin' | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async () => {
    if (!user || !session) {
      setIsAdmin(false);
      setAdminLevel(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('admin_level, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setAdminLevel(null);
      } else if (data) {
        setIsAdmin(true);
        setAdminLevel(data.admin_level);
      } else {
        setIsAdmin(false);
        setAdminLevel(null);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setAdminLevel(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, [user, session]);

  return (
    <AdminContext.Provider value={{ 
      isAdmin, 
      adminLevel, 
      loading, 
      checkAdminStatus 
    }}>
      {children}
    </AdminContext.Provider>
  );
};
