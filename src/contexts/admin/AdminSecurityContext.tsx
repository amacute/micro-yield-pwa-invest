
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

interface AdminSecurityContextType {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  adminRole: string | null;
  checkAdminStatus: () => Promise<boolean>;
  grantAdminRole: (userId: string, role: 'admin' | 'super_admin') => Promise<boolean>;
  revokeAdminRole: (userId: string) => Promise<boolean>;
  auditLog: (action: string, tableName?: string, recordId?: string, oldValues?: any, newValues?: any) => Promise<void>;
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

  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user?.id) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setAdminRole(null);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('role', { ascending: true }) // super_admin comes first alphabetically
        .limit(1)
        .single();

      if (error || !data) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setAdminRole(null);
        return false;
      }

      const role = data.role;
      const isAdminUser = role === 'admin' || role === 'super_admin';
      const isSuperAdminUser = role === 'super_admin';

      setIsAdmin(isAdminUser);
      setIsSuperAdmin(isSuperAdminUser);
      setAdminRole(role);

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
    if (!isSuperAdmin) {
      toast.error('Only super administrators can grant admin roles');
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
      return true;
    } catch (error: any) {
      console.error('Error granting admin role:', error);
      toast.error(error.message || 'Failed to grant admin role');
      return false;
    }
  };

  const revokeAdminRole = async (userId: string): Promise<boolean> => {
    if (!isSuperAdmin) {
      toast.error('Only super administrators can revoke admin roles');
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
        checkAdminStatus,
        grantAdminRole,
        revokeAdminRole,
        auditLog
      }}
    >
      {children}
    </AdminSecurityContext.Provider>
  );
};
