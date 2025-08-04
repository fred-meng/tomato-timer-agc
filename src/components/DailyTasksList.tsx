/**
 * 每日完成任务列表组件
 * REQ-TM-S04: 查看每日完成的任务列表
 * 用户故事：作为市场经理Sarah，我需要将我的时间投入与具体的工作产出关联起来。
 *          我想看到今天具体在哪些任务上投入了番茄钟，以便分析我的精力分配是否合理。
 */

'use client';

import React from 'react';
import { Clock, Target } from 'lucide-react';
import { format } from 'date-fns';
import { useAppStore } from '@/lib/store';
import { formatPomodoroCount } from '@/lib/formatters';

// 常量定义 - 重构1：消除魔法数字
const EMPTY_TASK_COUNT = 0;

// 常量定义 - 重构1：CSS样式常量
const ICON_SIZES = {
  SMALL: 'w-4 h-4',
  LARGE: 'w-8 h-8',
  CONTAINER: 'w-16 h-16'
} as const;

const STYLES = {
  CONTAINER_CLASSES: 'daily-tasks-list bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 transition-colors duration-300',
  TASK_ITEM_CLASSES: 'task-item flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer',
  EMPTY_STATE_CLASSES: 'empty-state text-center py-12',
  EMPTY_STATE_ICON_CLASSES: 'flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full mb-4 mx-auto'
} as const;

const DailyTasksList: React.FC = () => {
  const getDailyTasksWithPomodoros = useAppStore(state => state.getDailyTasksWithPomodoros);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const tasksWithPomodoros = getDailyTasksWithPomodoros(today);

  return (
    <div 
      data-testid="daily-tasks-list"
      className={STYLES.CONTAINER_CLASSES}
      role="list"
      aria-label="今日专注任务列表"
    >
      {/* 标题 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          今日专注任务
        </h2>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Target className={ICON_SIZES.SMALL + " mr-1"} />
          {tasksWithPomodoros.length} 项任务
        </div>
      </div>

      {/* 任务列表 */}
      {tasksWithPomodoros.length > EMPTY_TASK_COUNT ? (
        <div className="space-y-3">
          {tasksWithPomodoros.map((task) => (
            <div
              key={task.id}
              data-testid={`task-${task.id}-item`}
              className={STYLES.TASK_ITEM_CLASSES}
              role="listitem"
              tabIndex={0}
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-gray-800 dark:text-white truncate">
                  {task.title}
                </h3>
              </div>
              <div className="flex items-center ml-4">
                <div className="flex items-center bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-lg">
                  <Clock className={ICON_SIZES.SMALL + " text-orange-600 dark:text-orange-400 mr-1.5"} />
                  <span 
                    className="text-sm font-medium text-orange-600 dark:text-orange-400"
                    data-testid={`task-${task.id}-pomodoros`}
                  >
                    {formatPomodoroCount(task.pomodorosUsed)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 空状态 */
        <div 
          data-testid="no-tasks-message"
          className={STYLES.EMPTY_STATE_CLASSES}
        >
          <div className={STYLES.EMPTY_STATE_ICON_CLASSES + " " + ICON_SIZES.CONTAINER}>
            <Target className={ICON_SIZES.LARGE + " text-gray-400 dark:text-gray-500"} />
          </div>
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
            今天还没有专注任何任务
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            开始一个番茄钟，选择一个任务进行专注，这里就会显示你的专注记录了
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyTasksList;
