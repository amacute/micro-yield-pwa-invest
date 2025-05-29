
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { UserTask } from "./types";

// Admin functions
export const fetchPendingTasks = async (): Promise<UserTask[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      profiles!inner(full_name, email)
    `)
    .eq('type', 'task_completion')
    .eq('status', 'completed')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching pending tasks:', error);
    toast.error('Failed to load pending tasks');
    return [];
  }
  
  return (data || []).map(transaction => ({
    id: transaction.id,
    user_id: transaction.user_id || '',
    task_id: transaction.description || transaction.id,
    status: 'completed' as const,
    watch_duration: 45, // Mock watch duration
    created_at: transaction.created_at || new Date().toISOString(),
    users: transaction.profiles,
    tasks: {
      id: transaction.id,
      title: 'Video Task',
      description: 'Watch video and earn rewards',
      duration: 60,
      reward_amount: 5.00,
      status: 'active' as const,
      created_at: transaction.created_at || new Date().toISOString()
    }
  }));
};

export const verifyTask = async (userTaskId: string, userId: string, rewardAmount: number) => {
  try {
    // Update task status to verified
    const { error: taskError } = await supabase
      .from('transactions')
      .update({
        status: 'approved'
      })
      .eq('id', userTaskId);
    
    if (taskError) throw taskError;
    
    // Get current user balance
    const { data: userData, error: userFetchError } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();
    
    if (userFetchError) throw userFetchError;
    
    // Update user wallet balance
    const newBalance = (userData?.wallet_balance || 0) + rewardAmount;
    const { error: walletError } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);
    
    if (walletError) throw walletError;
    
    toast.success('Task verified and reward credited');
    return true;
  } catch (error) {
    console.error('Error verifying task:', error);
    toast.error('Failed to verify task');
    return false;
  }
};

export const rejectTask = async (userTaskId: string, reason?: string) => {
  const { error } = await supabase
    .from('transactions')
    .update({
      status: 'rejected'
    })
    .eq('id', userTaskId);
  
  if (error) {
    console.error('Error rejecting task:', error);
    toast.error('Failed to reject task');
    return false;
  }
  
  toast.success('Task rejected');
  return true;
};
