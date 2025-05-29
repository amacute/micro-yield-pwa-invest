
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

// User management
export const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching users:', error);
    toast.error('Failed to load users');
    return [];
  }
  
  return data || [];
};

// P2P User Matching - Updated to work with profiles table
export const fetchAvailableUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .gt('wallet_balance', 0)
    .order('wallet_balance', { ascending: false });
  
  if (error) {
    console.error('Error fetching available users:', error);
    toast.error('Failed to load users');
    return [];
  }
  
  return data || [];
};
