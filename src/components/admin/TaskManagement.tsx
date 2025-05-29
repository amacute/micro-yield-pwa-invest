
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  fetchPendingTasks, 
  verifyTask, 
  rejectTask, 
  createTask, 
  fetchAllTasks,
  UserTask,
  Task 
} from '@/services/tasks';
import { Loader2, CheckCircle, XCircle, Plus, Eye } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export function TaskManagement() {
  const [pendingTasks, setPendingTasks] = useState<UserTask[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form state for creating new tasks
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    video_url: '',
    duration: 30, // seconds
    reward_amount: 5.00,
    status: 'active' as const
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [pending, tasks] = await Promise.all([
        fetchPendingTasks(),
        fetchAllTasks()
      ]);
      setPendingTasks(pending);
      setAllTasks(tasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyTask = async (userTaskId: string, userId: string, rewardAmount: number) => {
    setProcessing(userTaskId);
    try {
      const success = await verifyTask(userTaskId, userId, rewardAmount);
      if (success) {
        await loadData();
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectTask = async (userTaskId: string) => {
    setProcessing(userTaskId);
    try {
      const success = await rejectTask(userTaskId, 'Task not completed properly');
      if (success) {
        await loadData();
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const created = await createTask(newTask);
    if (created) {
      setNewTask({
        title: '',
        description: '',
        video_url: '',
        duration: 30,
        reward_amount: 5.00,
        status: 'active'
      });
      setShowCreateDialog(false);
      await loadData();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Task Management</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <Textarea
                placeholder="Task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <Input
                placeholder="Video URL (optional)"
                value={newTask.video_url}
                onChange={(e) => setNewTask({ ...newTask, video_url: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Duration (seconds)</label>
                  <Input
                    type="number"
                    value={newTask.duration}
                    onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Reward Amount ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newTask.reward_amount}
                    onChange={(e) => setNewTask({ ...newTask, reward_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <Button onClick={handleCreateTask} className="w-full">
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Verification ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="all">All Tasks ({allTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Tasks Awaiting Verification</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTasks.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No tasks pending verification</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Watch Duration</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingTasks.map((userTask) => (
                      <TableRow key={userTask.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{userTask.users?.name || 'Unknown User'}</p>
                            <p className="text-sm text-gray-500">{userTask.users?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{userTask.tasks?.title}</p>
                            <p className="text-sm text-gray-500">
                              Required: {formatDuration(userTask.tasks?.duration || 0)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            userTask.watch_duration >= (userTask.tasks?.duration || 0) * 0.8 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {formatDuration(userTask.watch_duration)}
                          </span>
                        </TableCell>
                        <TableCell>${userTask.tasks?.reward_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          {userTask.completed_at ? new Date(userTask.completed_at).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleVerifyTask(
                                userTask.id, 
                                userTask.user_id, 
                                userTask.tasks?.reward_amount || 0
                              )}
                              disabled={processing === userTask.id}
                            >
                              {processing === userTask.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectTask(userTask.id)}
                              disabled={processing === userTask.id}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-500">{task.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDuration(task.duration)}</TableCell>
                      <TableCell>${task.reward_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {task.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(task.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
