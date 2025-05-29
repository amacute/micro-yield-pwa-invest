
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

// Note: These functions use placeholder table names since the actual task tables don't exist yet
// In a real implementation, you would need to create the 'tasks' and 'user_tasks' tables in Supabase

// Fetch available tasks for users
export const fetchAvailableTasks = async (): Promise<Task[]> => {
  // Using investments table as placeholder - in real app you'd have a tasks table
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .limit(10);
  
  if (error) {
    console.error('Error fetching tasks:', error);
    toast.error('Failed to load tasks');
    return [];
  }
  
  // Transform investment data to task format for demo
  return (data || []).map(investment => ({
    id: investment.id,
    title: 'Watch Video Task', // Default title since investments table doesn't have title
    description: 'Complete this video task to earn rewards', // Default description
    video_url: '',
    duration: 60, // Default duration
    reward_amount: 5.00,
    status: 'active' as const,
    created_at: investment.created_at || new Date().toISOString()
  }));
};

// Fetch user's task history using transactions table
export const fetchUserTasks = async (userId: string): Promise<UserTask[]> => {
  // Using transactions table to track user tasks
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'task_completion')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user tasks:', error);
    toast.error('Failed to load your tasks');
    return [];
  }
  
  // Transform to UserTask format for demo
  return (data || []).map(transaction => ({
    id: transaction.id,
    user_id: transaction.user_id || '',
    task_id: transaction.description || transaction.id, // Use description as task reference
    status: transaction.status === 'completed' ? 'completed' as const : 'pending' as const,
    watch_duration: 0,
    created_at: transaction.created_at || new Date().toISOString()
  }));
};

// Start a task (user clicks to begin)
export const startTask = async (userId: string, taskId: string) => {
  // Create a transaction record as placeholder
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount: 5.00,
      type: 'task_completion',
      status: 'pending',
      description: `Task ${taskId} started`
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error starting task:', error);
    toast.error('Failed to start task');
    return null;
  }
  
  // Transform to UserTask format
  return {
    id: data.id,
    user_id: data.user_id || '',
    task_id: taskId,
    status: 'pending' as const,
    watch_duration: 0,
    created_at: data.created_at || new Date().toISOString()
  };
};

// Complete a task (when user finishes watching)
export const completeTask = async (userTaskId: string, watchDuration: number) => {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      status: 'completed'
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
  return {
    id: data.id,
    user_id: data.user_id || '',
    task_id: data.description || data.id,
    status: 'completed' as const,
    watch_duration: watchDuration,
    created_at: data.created_at || new Date().toISOString()
  };
};

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

// Admin task management
export const createTask = async (taskData: Omit<Task, 'id' | 'created_at'>) => {
  // Create as investment for demo purposes with all required fields
  const { data, error } = await supabase
    .from('investments')
    .insert({
      amount: taskData.reward_amount,
      expected_return: taskData.reward_amount,
      status: 'active',
      type: 'Task',
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      user_id: null // Admin created
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating task:', error);
    toast.error('Failed to create task');
    return null;
  }
  
  toast.success('Task created successfully');
  return {
    id: data.id,
    title: taskData.title,
    description: taskData.description,
    duration: taskData.duration,
    reward_amount: taskData.reward_amount,
    status: 'active' as const,
    created_at: data.created_at || new Date().toISOString()
  };
};

export const fetchAllTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('type', 'Task')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching all tasks:', error);
    toast.error('Failed to load tasks');
    return [];
  }
  
  return (data || []).map(investment => ({
    id: investment.id,
    title: 'Video Task',
    description: 'Complete this video task to earn rewards',
    duration: 60,
    reward_amount: investment.amount,
    status: 'active' as const,
    created_at: investment.created_at || new Date().toISOString()
  }));
};
