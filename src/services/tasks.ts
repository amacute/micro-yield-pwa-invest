
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export interface Task {
  id: string;
  title: string;
  description: string;
  video_url?: string;
  duration: number; // in seconds
  reward_amount: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface UserTask {
  id: string;
  user_id: string;
  task_id: string;
  status: 'pending' | 'completed' | 'verified' | 'rejected';
  completed_at?: string;
  verified_at?: string;
  watch_duration: number;
  created_at: string;
  tasks?: Task;
  users?: any;
}

// Fetch available tasks for users
export const fetchAvailableTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching tasks:', error);
    toast.error('Failed to load tasks');
    return [];
  }
  
  return data || [];
};

// Fetch user's task history
export const fetchUserTasks = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_tasks')
    .select(`
      *,
      tasks(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user tasks:', error);
    toast.error('Failed to load your tasks');
    return [];
  }
  
  return data || [];
};

// Start a task (user clicks to begin)
export const startTask = async (userId: string, taskId: string) => {
  const { data, error } = await supabase
    .from('user_tasks')
    .insert({
      user_id: userId,
      task_id: taskId,
      status: 'pending',
      watch_duration: 0
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error starting task:', error);
    toast.error('Failed to start task');
    return null;
  }
  
  return data;
};

// Complete a task (when user finishes watching)
export const completeTask = async (userTaskId: string, watchDuration: number) => {
  const { data, error } = await supabase
    .from('user_tasks')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      watch_duration: watchDuration
    })
    .eq('id', userTaskId)
    .select()
    .single();
  
  if (error) {
    console.error('Error completing task:', error);
    toast.error('Failed to complete task');
    return null;
  }
  
  toast.success('Task completed! Waiting for admin verification.');
  return data;
};

// Admin functions
export const fetchPendingTasks = async () => {
  const { data, error } = await supabase
    .from('user_tasks')
    .select(`
      *,
      tasks(*),
      users(name, email)
    `)
    .eq('status', 'completed')
    .order('completed_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching pending tasks:', error);
    toast.error('Failed to load pending tasks');
    return [];
  }
  
  return data || [];
};

export const verifyTask = async (userTaskId: string, userId: string, rewardAmount: number) => {
  try {
    // Update task status to verified
    const { error: taskError } = await supabase
      .from('user_tasks')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString()
      })
      .eq('id', userTaskId);
    
    if (taskError) throw taskError;
    
    // Get current user balance
    const { data: userData, error: userFetchError } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('user_id', userId)
      .single();
    
    if (userFetchError) throw userFetchError;
    
    // Update user wallet balance
    const newBalance = (userData?.wallet_balance || 0) + rewardAmount;
    const { error: walletError } = await supabase
      .from('users')
      .update({ wallet_balance: newBalance })
      .eq('user_id', userId);
    
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
    .from('user_tasks')
    .update({
      status: 'rejected',
      rejection_reason: reason
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

// Admin task management
export const createTask = async (taskData: Omit<Task, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating task:', error);
    toast.error('Failed to create task');
    return null;
  }
  
  toast.success('Task created successfully');
  return data;
};

export const fetchAllTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching all tasks:', error);
    toast.error('Failed to load tasks');
    return [];
  }
  
  return data || [];
};
