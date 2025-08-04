/**
 * 每日任务项组件
 * 专用于DailyTasksList，显示任务信息和番茄钟数量
 */

import React from 'react';
import { Clock } from 'lucide-react';
import { Task } from '@/types';

interface DailyTaskItemProps {
  task: Task & { pomodorosUsed: number };
  formatPomodoroCount: (count: number) => string;
}

const TASK_ITEM_STYLES = {
  CONTAINER: 'task-item flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer',
  POMODORO_BADGE: 'flex items-center bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-lg',
  ICON_SIZE: 'w-4 h-4'
} as const;

const DailyTaskItem: React.FC<DailyTaskItemProps> = ({ task, formatPomodoroCount }) => {
  return (
    <div
      data-testid={`task-${task.id}-item`}
      className={TASK_ITEM_STYLES.CONTAINER}
      role="listitem"
      tabIndex={0}
    >
      {/* 任务信息 */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-medium text-gray-800 dark:text-white truncate">
          {task.title || ''}
        </h3>
        {task.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
            {task.description}
          </p>
        )}
      </div>

      {/* 番茄钟数量 */}
      <div className="flex items-center ml-4">
        <div className={TASK_ITEM_STYLES.POMODORO_BADGE}>
          <Clock className={`${TASK_ITEM_STYLES.ICON_SIZE} text-orange-600 dark:text-orange-400 mr-1.5`} />
          <span 
            data-testid={`task-${task.id}-pomodoros`}
            className="text-sm font-medium text-orange-600 dark:text-orange-400"
          >
            {formatPomodoroCount(task.pomodorosUsed)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DailyTaskItem;
