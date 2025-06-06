
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
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

  // List of admin user IDs - Updated with your admin ID
  const adminUserIds = [
    '6d432c28038d77b50025adad10f0e824', // Your admin ID
    // Add more admin user IDs here as needed
  ];

  const checkAdminStatus = async () => {
    if (!user || !session) {
      setIsAdmin(false);
      setAdminLevel(null);
      setLoading(false);
      return;
    }

    try {
      // Check if user ID is in the admin list
      const userIsAdmin = adminUserIds.includes(user.id);
      
      if (userIsAdmin) {
        setIsAdmin(true);
        setAdminLevel('admin');
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
