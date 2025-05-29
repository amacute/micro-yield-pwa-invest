
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Task, UserTask } from "./types";

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
