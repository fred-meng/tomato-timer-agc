'use client';

import React, { useState } from 'react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import { Task } from '@/types';

const TasksTab = () => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleEditComplete = () => {
    setEditingTask(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">任务管理</h1>
      <div className="max-w-2xl mx-auto">
        <TaskForm editingTask={editingTask} onEditComplete={handleEditComplete} />
        <TaskList onEditTask={handleEditTask} />
      </div>
    </div>
  );
};

export default TasksTab;