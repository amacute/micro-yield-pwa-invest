
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
    title: investment.title || 'Watch Video Task',
    description: investment.description || 'Complete this video task to earn rewards',
    video_url: '',
    duration: investment.duration || 60,
    reward_amount: 5.00,
    status: 'active' as const,
    created_at: investment.created_at
  }));
};

// Fetch user's task history
export const fetchUserTasks = async (userId: string): Promise<UserTask[]> => {
  // Using user_investments as placeholder
  const { data, error } = await supabase
    .from('user_investments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user tasks:', error);
    toast.error('Failed to load your tasks');
    return [];
  }
  
  // Transform to UserTask format for demo
  return (data || []).map(investment => ({
    id: investment.id,
    user_id: investment.user_id,
    task_id: investment.investment_id || investment.id,
    status: 'pending' as const,
    watch_duration: 0,
    created_at: investment.created_at
  }));
};

// Start a task (user clicks to begin)
export const startTask = async (userId: string, taskId: string) => {
  // Create a user_investment record as placeholder with required fields
  const { data, error } = await supabase
    .from('user_investments')
    .insert({
      user_id: userId,
      investment_id: taskId,
      amount: 5.00,
      status: 'pending',
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      expected_return: 5.00
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
    user_id: data.user_id,
    task_id: data.investment_id || data.id,
    status: 'pending' as const,
    watch_duration: 0,
    created_at: data.created_at
  };
};

// Complete a task (when user finishes watching)
export const completeTask = async (userTaskId: string, watchDuration: number) => {
  const { data, error } = await supabase
    .from('user_investments')
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
    user_id: data.user_id,
    task_id: data.investment_id || data.id,
    status: 'completed' as const,
    watch_duration: watchDuration,
    created_at: data.created_at
  };
};

// Admin functions
export const fetchPendingTasks = async (): Promise<UserTask[]> => {
  const { data, error } = await supabase
    .from('user_investments')
    .select(`
      *,
      users(name, email)
    `)
    .eq('status', 'completed')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching pending tasks:', error);
    toast.error('Failed to load pending tasks');
    return [];
  }
  
  return (data || []).map(investment => ({
    id: investment.id,
    user_id: investment.user_id,
    task_id: investment.investment_id || investment.id,
    status: 'completed' as const,
    watch_duration: 45, // Mock watch duration
    created_at: investment.created_at,
    users: investment.users,
    tasks: {
      id: investment.investment_id || investment.id,
      title: 'Video Task',
      description: 'Watch video and earn rewards',
      duration: 60,
      reward_amount: 5.00,
      status: 'active' as const,
      created_at: investment.created_at
    }
  }));
};

export const verifyTask = async (userTaskId: string, userId: string, rewardAmount: number) => {
  try {
    // Update task status to verified
    const { error: taskError } = await supabase
      .from('user_investments')
      .update({
        status: 'approved'
      })
      .eq('id', userTaskId);
    
    if (taskError) throw taskError;
    
    // Get current user balance
    const { data: userData, error: userFetchError } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();
    
    if (userFetchError) throw userFetchError;
    
    // Update user wallet balance
    const newBalance = (userData?.wallet_balance || 0) + rewardAmount;
    const { error: walletError } = await supabase
      .from('users')
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
    .from('user_investments')
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
      title: taskData.title,
      description: taskData.description,
      duration: taskData.duration,
      min_investment: taskData.reward_amount,
      max_investment: taskData.reward_amount,
      goal: taskData.reward_amount * 100,
      category: 'Task',
      end_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      creator_id: 'admin',
      return_rate: 0, // Required field
      risk: 'low', // Required field
      status: 'active' // Required field
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
    title: data.title,
    description: data.description,
    duration: data.duration,
    reward_amount: taskData.reward_amount,
    status: 'active' as const,
    created_at: data.created_at
  };
};

export const fetchAllTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('category', 'Task')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching all tasks:', error);
    toast.error('Failed to load tasks');
    return [];
  }
  
  return (data || []).map(investment => ({
    id: investment.id,
    title: investment.title,
    description: investment.description,
    duration: investment.duration,
    reward_amount: investment.min_investment,
    status: 'active' as const,
    created_at: investment.created_at
  }));
};
