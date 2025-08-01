'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Task, Priority } from '@/types';
import TaskItem from './TaskItem';
import { AnimatePresence } from 'framer-motion';
import { ListFilter, ArrowDownUp, Inbox } from 'lucide-react';

type SortKey = 'createdAt' | 'priority';
type FilterKey = 'all' | 'pending' | 'completed';

interface TaskListProps {
  onEditTask: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ onEditTask }) => {
  const tasks = useAppStore((state) => state.tasks);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [filterKey, setFilterKey] = useState<FilterKey>('all');

  const handleSortByPriority = () => {
    setSortKey('priority');
  };

  const sortedAndFilteredTasks = useMemo(() => {
    let filtered = tasks;
    if (filterKey === 'pending') {
      filtered = tasks.filter(task => !task.completed);
    } else if (filterKey === 'completed') {
      filtered = tasks.filter(task => task.completed);
    }

    return filtered.sort((a, b) => {
      if (sortKey === 'priority') {
        const priorityOrder = { [Priority.HIGH]: 0, [Priority.MEDIUM]: 1, [Priority.LOW]: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // Default sort by creation time (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, sortKey, filterKey]);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mt-8">
        <Inbox size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">暂无任务</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">点击上方表单添加一个新任务吧！</p>
      </div>
    );
  }

  const filterButtonClasses = (key: FilterKey) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
      filterKey === key
        ? 'bg-blue-600 text-white'
        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
    }`;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">任务列表</h3>
        <div className="flex items-center space-x-2">
          {/* Filter Buttons */}
          <button onClick={() => setFilterKey('all')} className={filterButtonClasses('all')} aria-label="显示全部任务">全部</button>
          <button onClick={() => setFilterKey('pending')} className={filterButtonClasses('pending')} aria-label="显示待办任务">待办</button>
          <button onClick={() => setFilterKey('completed')} className={filterButtonClasses('completed')} aria-label="显示已完成任务">已完成</button>
          
          {/* Sort Button */}
          <button 
            onClick={handleSortByPriority} 
            aria-label="按优先级排序"
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowDownUp size={18} />
          </button>
        </div>
      </div>
      <div>
        <AnimatePresence>
          {sortedAndFilteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} onEditTask={onEditTask} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskList;