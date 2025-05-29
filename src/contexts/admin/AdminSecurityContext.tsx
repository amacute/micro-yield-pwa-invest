
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from '@/components/ui/sonner';

interface AdminSecurityContextType {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  adminRole: string | null;
  sessionTimeout: number;
  lastActivity: number;
  checkAdminStatus: () => Promise<boolean>;
  grantAdminRole: (userId: string, role: 'admin' | 'super_admin') => Promise<boolean>;
  revokeAdminRole: (userId: string) => Promise<boolean>;
  auditLog: (action: string, tableName?: string, recordId?: string, oldValues?: any, newValues?: any) => Promise<void>;
  refreshAdminSession: () => void;
  isSessionValid: () => boolean;
}

const AdminSecurityContext = createContext<AdminSecurityContextType | undefined>(undefined);

export const useAdminSecurity = () => {
  const context = useContext(AdminSecurityContext);
  if (!context) {
    throw new Error('useAdminSecurity must be used within an AdminSecurityProvider');
  }
  return context;
};

export const AdminSecurityProvider = ({ children }: { children: ReactNode }) => {
  const { user, session } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const sessionTimeout = 15 * 60 * 1000; // 15 minutes

  const refreshAdminSession = () => {
    setLastActivity(Date.now());
  };

  const isSessionValid = (): boolean => {
    return Date.now() - lastActivity < sessionTimeout;
  };

  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user?.id || !session) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setAdminRole(null);
      return false;
    }

    // Check session validity
    if (!isSessionValid()) {
      toast.error('Admin session expired. Please log in again.');
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setAdminRole(null);
      return false;
    }

    try {
      // Use the database function to get user role securely
      const { data, error } = await supabase.rpc('get_user_role', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setAdminRole(null);
        return false;
      }

      const role = data;
      const isAdminUser = role === 'admin' || role === 'super_admin';
      const isSuperAdminUser = role === 'super_admin';

      setIsAdmin(isAdminUser);
      setIsSuperAdmin(isSuperAdminUser);
      setAdminRole(role);

      if (isAdminUser) {
        refreshAdminSession();
        await auditLog('ADMIN_LOGIN', 'user_roles', user.id);
      }

      return isAdminUser;
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setAdminRole(null);
      return false;
    }
  };

  const grantAdminRole = async (userId: string, role: 'admin' | 'super_admin'): Promise<boolean> => {
    if (!isSuperAdmin || !isSessionValid()) {
      toast.error('Unauthorized: Only super administrators can grant admin roles');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role,
          granted_by: user?.id,
          granted_at: new Date().toISOString(),
          is_active: true
        });

      if (error) throw error;

      await auditLog('GRANT_ADMIN_ROLE', 'user_roles', userId, null, { role, granted_by: user?.id });
      toast.success(`Successfully granted ${role} role`);
      refreshAdminSession();
      return true;
    } catch (error: any) {
      console.error('Error granting admin role:', error);
      toast.error(error.message || 'Failed to grant admin role');
      return false;
    }
  };

  const revokeAdminRole = async (userId: string): Promise<boolean> => {
    if (!isSuperAdmin || !isSessionValid()) {
      toast.error('Unauthorized: Only super administrators can revoke admin roles');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (error) throw error;

      await auditLog('REVOKE_ADMIN_ROLE', 'user_roles', userId, { is_active: true }, { is_active: false });
      toast.success('Successfully revoked admin role');
      refreshAdminSession();
      return true;
    } catch (error: any) {
      console.error('Error revoking admin role:', error);
      toast.error(error.message || 'Failed to revoke admin role');
      return false;
    }
  };

  const auditLog = async (
    action: string,
    tableName?: string,
    recordId?: string,
    oldValues?: any,
    newValues?: any
  ): Promise<void> => {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          action,
          table_name: tableName,
          record_id: recordId,
          old_values: oldValues,
          new_values: newValues,
          ip_address: null, // Would need to implement IP detection
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  };

  // Auto-logout on session timeout
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAdmin && !isSessionValid()) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setAdminRole(null);
        toast.warning('Admin session expired due to inactivity');
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAdmin, lastActivity]);

  useEffect(() => {
    if (session) {
      checkAdminStatus();
    }
  }, [session, user?.id]);

  return (
    <AdminSecurityContext.Provider
      value={{
        isAdmin,
        isSuperAdmin,
        adminRole,
        sessionTimeout,
        lastActivity,
        checkAdminStatus,
        grantAdminRole,
        revokeAdminRole,
        auditLog,
        refreshAdminSession,
        isSessionValid
      }}
    >
      {children}
    </AdminSecurityContext.Provider>
  );
};
