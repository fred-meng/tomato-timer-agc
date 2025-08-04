'use client';

import React from 'react';
import { Task, Priority } from '@/types';
import { useAppStore } from '@/lib/store';
import { CheckSquare, Square, Flag, Trash2, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskItemProps {
  task: Task;
  onEditTask: (task: Task) => void;
}

const priorityConfig = {
  [Priority.HIGH]: { icon: Flag, color: 'text-red-500', label: '高优先级' },
  [Priority.MEDIUM]: { icon: Flag, color: 'text-yellow-500', label: '中优先级' },
  [Priority.LOW]: { icon: Flag, color: 'text-green-500', label: '低优先级' },
  // 兼容小写和其他可能的值
  'high': { icon: Flag, color: 'text-red-500', label: '高优先级' },
  'medium': { icon: Flag, color: 'text-yellow-500', label: '中优先级' },
  'low': { icon: Flag, color: 'text-green-500', label: '低优先级' },
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onEditTask }) => {
  const { toggleTaskCompletion, deleteTask } = useAppStore((state) => ({
    toggleTaskCompletion: state.toggleTaskCompletion,
    deleteTask: state.deleteTask,
  }));

  const priorityInfo = priorityConfig[task.priority] || priorityConfig[Priority.MEDIUM];
  const PriorityIcon = priorityInfo.icon;
  const priorityColor = priorityInfo.color;

  const handleToggle = () => toggleTaskCompletion(task.id);
  const handleDelete = () => {
    if (window.confirm(`确定要删除任务 "${task.title}" 吗？`)) {
      deleteTask(task.id);
    }
  };
  const handleEdit = () => {
    onEditTask(task);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      data-testid="task-item"
      data-priority={task.priority}
      className={`flex items-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-3 transition-colors duration-300 ${
        task.completed ? 'bg-gray-50 dark:bg-gray-800/50' : ''
      }`}
    >
      <button onClick={handleToggle} className="mr-4 flex-shrink-0" aria-label={task.completed ? '标记为未完成' : '标记为已完成'}>
        {task.completed ? (
          <CheckSquare size={24} className="text-blue-500" />
        ) : (
          <Square size={24} className="text-gray-400 dark:text-gray-500" />
        )}
      </button>

      <div className="flex-grow">
        <p className={`font-medium text-gray-800 dark:text-gray-100 ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
          {task.title}
        </p>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
          <span>{task.pomodorosUsed} / {task.estimatedPomodoros}</span>
          <span className="mx-2">·</span>
          <PriorityIcon size={14} className={`${priorityColor} mr-1`} />
          <span>{priorityConfig[task.priority].label}</span>
        </div>
      </div>

      <div className="flex items-center ml-4 space-x-2">
        <button onClick={handleEdit} className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label="编辑任务" data-testid="edit-icon">
          <Edit3 size={18} />
        </button>
        <button onClick={handleDelete} className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors" aria-label="删除任务" data-testid="delete-icon">
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default TaskItem;