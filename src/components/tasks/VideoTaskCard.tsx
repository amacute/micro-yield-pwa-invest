
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { Task, UserTask, startTask, completeTask } from '@/services/tasks';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

interface VideoTaskCardProps {
  task: Task;
  userTask?: UserTask;
  onTaskUpdate?: () => void;
}

export function VideoTaskCard({ task, userTask, onTaskUpdate }: VideoTaskCardProps) {
  const { user } = useAuth();
  const [isWatching, setIsWatching] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [currentUserTask, setCurrentUserTask] = useState<UserTask | null>(userTask || null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartWatching = async () => {
    if (!user) {
      toast.error('Please log in to start tasks');
      return;
    }

    if (!currentUserTask) {
      const newUserTask = await startTask(user.id, task.id);
      if (newUserTask) {
        setCurrentUserTask(newUserTask);
      } else {
        return;
      }
    }

    setIsWatching(true);
    setWatchTime(0);
    
    // Start timer
    intervalRef.current = setInterval(() => {
      setWatchTime(prev => prev + 1);
    }, 1000);
  };

  const handleStopWatching = async () => {
    setIsWatching(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Check if user watched enough (at least 80% of video)
    const requiredWatchTime = Math.floor(task.duration * 0.8);
    
    if (watchTime >= requiredWatchTime && currentUserTask) {
      const completed = await completeTask(currentUserTask.id, watchTime);
      if (completed) {
        setCurrentUserTask({ ...currentUserTask, status: 'completed' });
        if (onTaskUpdate) onTaskUpdate();
      }
    } else {
      toast.error(`Please watch at least ${formatDuration(requiredWatchTime)} to complete this task`);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'text-yellow-600';
      case 'verified': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'pending': return 'In Progress';
      case 'completed': return 'Awaiting Verification';
      case 'verified': return 'Verified & Paid';
      case 'rejected': return 'Rejected';
      default: return 'Available';
    }
  };

  const canStartTask = !currentUserTask || currentUserTask.status === 'rejected';
  const isCompleted = currentUserTask && ['completed', 'verified'].includes(currentUserTask.status);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 h-32 flex items-center justify-center">
          {!isWatching ? (
            <Button
              onClick={handleStartWatching}
              disabled={!canStartTask || isCompleted}
              className="bg-black/20 hover:bg-black/40 text-white border-white/30"
              size="lg"
            >
              <Play className="h-6 w-6 mr-2" />
              {canStartTask && !isCompleted ? 'Watch Video' : 'Video Watched'}
            </Button>
          ) : (
            <div className="text-center text-white">
              <div className="text-2xl font-bold mb-2">
                {formatDuration(watchTime)} / {formatDuration(task.duration)}
              </div>
              <Button
                onClick={handleStopWatching}
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                Stop Watching
              </Button>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-lg">{task.title}</h3>
            <div className="flex items-center text-green-600 font-bold">
              <DollarSign className="h-4 w-4" />
              {task.reward_amount.toFixed(2)}
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3">{task.description}</p>

          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {formatDuration(task.duration)}
            </div>
            
            <div className={`flex items-center font-medium ${getStatusColor(currentUserTask?.status)}`}>
              {currentUserTask?.status === 'verified' && <CheckCircle className="h-4 w-4 mr-1" />}
              {getStatusText(currentUserTask?.status)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
