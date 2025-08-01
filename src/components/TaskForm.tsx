'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Task, Priority } from '@/types';
import { Plus, Minus, Send, X, Check } from 'lucide-react';

interface TaskFormProps {
  editingTask?: Task | null;
  onEditComplete?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ editingTask, onEditComplete }) => {
  const { addTask, updateTask } = useAppStore((state) => ({
    addTask: state.addTask,
    updateTask: state.updateTask,
  }));
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);

  // Initialize form with editing task data
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setEstimatedPomodoros(editingTask.estimatedPomodoros);
      setPriority(editingTask.priority);
    } else {
      // Reset form when not editing
      setTitle('');
      setDescription('');
      setEstimatedPomodoros(1);
      setPriority(Priority.MEDIUM);
    }
  }, [editingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      return;
    }

    if (editingTask) {
      // Update existing task
      updateTask(editingTask.id, {
        title,
        description,
        estimatedPomodoros,
        priority,
      });
      onEditComplete?.();
    } else {
      // Create new task
      addTask({
        title,
        description,
        estimatedPomodoros,
        priority,
        completed: false,
        pomodorosUsed: 0,
      });
      // Reset form after submission
      setTitle('');
      setDescription('');
      setEstimatedPomodoros(1);
      setPriority(Priority.MEDIUM);
    }
  };

  const handleCancel = () => {
    if (editingTask && onEditComplete) {
      onEditComplete();
    }
  };

  const inputClasses = "w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-300";
  const labelClasses = "text-sm font-medium text-gray-600 dark:text-gray-400 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-lg" data-testid="task-form">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {editingTask ? '编辑任务' : '创建新任务'}
        </h2>
        {editingTask && (
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            aria-label="取消编辑"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      <div>
        <label htmlFor="title" className={labelClasses}>任务标题</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：完成项目报告"
          className={inputClasses}
          required
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClasses}>详细描述 (可选)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="添加更多细节..."
          className={`${inputClasses} h-24`}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="estimatedPomodoros" className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">预估番茄数</label>
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button 
              type="button" 
              onClick={() => setEstimatedPomodoros(p => Math.max(1, p - 1))}
              aria-label="减少番茄钟"
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              data-testid="decrement-button"
            >
              <Minus size={20} />
            </button>
            <input
              id="estimatedPomodoros"
              type="number"
              value={estimatedPomodoros}
              onChange={(e) => setEstimatedPomodoros(parseInt(e.target.value, 10) || 1)}
              className="w-full text-center bg-transparent text-lg font-semibold focus:outline-none"
            />
            <button 
              type="button" 
              onClick={() => setEstimatedPomodoros(p => p + 1)}
              aria-label="增加番茄钟"
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              data-testid="increment-button"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="priority" className={labelClasses}>优先级</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className={inputClasses}
          >
            <option value={Priority.LOW}>低</option>
            <option value={Priority.MEDIUM}>中</option>
            <option value={Priority.HIGH}>高</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          aria-label={editingTask ? "更新任务" : "保存任务"}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold text-lg py-3 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
          data-testid="submit-button"
        >
          {editingTask ? <Check size={20} /> : <Send size={20} />}
          <span>{editingTask ? '更新任务' : '保存任务'}</span>
        </button>
        {editingTask && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
          >
            取消
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;
