
import React from 'react';
import { TaskDashboard } from '@/components/tasks/TaskDashboard';

export default function Tasks() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Earn Money</h1>
        <p className="text-muted-foreground">Complete video tasks to earn rewards</p>
      </div>
      
      <TaskDashboard />
    </div>
  );
}
