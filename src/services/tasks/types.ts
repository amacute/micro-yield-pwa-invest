
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
