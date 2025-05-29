
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Task } from "./types";

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
