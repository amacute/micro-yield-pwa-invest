
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoTaskCard } from './VideoTaskCard';
import { fetchAvailableTasks, fetchUserTasks, Task, UserTask } from '@/services/tasks';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, PlayCircle, DollarSign, Clock } from 'lucide-react';

export function TaskDashboard() {
  const { user } = useAuth();
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasks, userTaskHistory] = await Promise.all([
        fetchAvailableTasks(),
        user ? fetchUserTasks(user.id) : []
      ]);
      
      setAvailableTasks(tasks);
      setUserTasks(userTaskHistory);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const getUserTaskForTask = (taskId: string) => {
    return userTasks.find(ut => ut.task_id === taskId);
  };

  const totalEarnings = userTasks
    .filter(ut => ut.status === 'verified')
    .reduce((sum, ut) => sum + (ut.tasks?.reward_amount || 0), 0);

  const completedTasks = userTasks.filter(ut => ut.status === 'verified').length;
  const pendingTasks = userTasks.filter(ut => ut.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <PlayCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold">{completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                <p className="text-2xl font-bold">{pendingTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available Tasks</TabsTrigger>
          <TabsTrigger value="history">My Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Available Video Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableTasks.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No tasks available at the moment</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableTasks.map(task => (
                    <VideoTaskCard
                      key={task.id}
                      task={task}
                      userTask={getUserTaskForTask(task.id)}
                      onTaskUpdate={loadData}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Task History</CardTitle>
            </CardHeader>
            <CardContent>
              {userTasks.length === 0 ? (
                <p className="text-center text-gray-500 py-8">You haven't started any tasks yet</p>
              ) : (
                <div className="space-y-4">
                  {userTasks.map(userTask => (
                    userTask.tasks && (
                      <div key={userTask.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{userTask.tasks.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            userTask.status === 'verified' ? 'bg-green-100 text-green-700' :
                            userTask.status === 'completed' ? 'bg-yellow-100 text-yellow-700' :
                            userTask.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {userTask.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Reward: ${userTask.tasks.reward_amount.toFixed(2)}</span>
                          <span>Completed: {userTask.completed_at ? new Date(userTask.completed_at).toLocaleDateString() : 'Not completed'}</span>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
