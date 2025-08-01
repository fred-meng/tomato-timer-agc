/**
 * 今日关键指标组件
 * REQ-TM-S01: 查看今日关键指标
 * 用户故事：作为学生Alex，我希望能快速看到今天完成了多少个番茄钟和任务，
 *          这会给我巨大的即时满足感和继续学习的动力。
 */

'use client';

import React from 'react';
import { Clock, Target, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatDuration } from '@/lib/statsCalculator';

const TodayStats: React.FC = () => {
  const { getTodayStats } = useAppStore();
  const todayStats = getTodayStats ? getTodayStats() : null;

  // 如果没有统计数据，显示默认值
  const stats = todayStats || {
    totalPomodoros: 0,
    workTime: 0,
    tasksCompleted: 0,
    focusScore: 0
  };

  const isEmptyDay = stats.totalPomodoros === 0 && stats.tasksCompleted === 0;

  return (
    <div 
      data-testid="today-stats-container"
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 transition-colors duration-300"
    >
      {/* 标题 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          今日成果
        </h2>
        {!isEmptyDay && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            专注分数: {stats.focusScore}
          </div>
        )}
      </div>

      {/* 统计指标 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 专注时长 */}
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-3 mx-auto">
            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div 
            data-testid="today-focus-time"
            className="text-2xl font-bold text-gray-800 dark:text-white mb-1"
          >
            {formatDuration(stats.workTime)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            专注时长
          </div>
        </div>

        {/* 完成番茄钟 */}
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl mb-3 mx-auto">
            <Target className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div 
            data-testid="today-pomodoros"
            className="text-2xl font-bold text-gray-800 dark:text-white mb-1"
          >
            {stats.totalPomodoros}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            完成番茄钟
          </div>
        </div>

        {/* 完成任务 */}
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl mb-3 mx-auto">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div 
            data-testid="today-tasks"
            className="text-2xl font-bold text-gray-800 dark:text-white mb-1"
          >
            {stats.tasksCompleted}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            完成任务
          </div>
        </div>
      </div>

      {/* 空状态提示 */}
      {isEmptyDay && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            今天还没有开始专注，开始你的第一个番茄钟吧！💪
          </p>
        </div>
      )}

      {/* 成就感展示 */}
      {!isEmptyDay && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl">
          <p className="text-gray-700 dark:text-gray-200 text-sm text-center">
            {stats.totalPomodoros >= 4 && stats.tasksCompleted >= 2 
              ? "太棒了！今天的专注效果很不错！🎉" 
              : stats.totalPomodoros >= 2 || stats.tasksCompleted >= 1
              ? "不错的开始，继续保持专注！📚"
              : "每一步都是进步，加油！💪"
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default TodayStats;
