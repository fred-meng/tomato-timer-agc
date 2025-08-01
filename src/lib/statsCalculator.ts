/**
 * 统计数据计算函数库
 * REQ-TM-S01: 查看今日关键指标
 * REQ-TM-S02: 查看本周整体表现
 */

import { format, isToday, startOfDay, endOfDay, subDays, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { DailyStats, WeeklyStats, Task, PomodoroSession } from '@/types';

/**
 * 计算今日统计数据
 * @param tasks 所有任务列表
 * @param sessions 所有番茄钟会话列表
 * @returns 今日统计数据
 */
export function calculateTodayStats(
  tasks: Task[] | null | undefined,
  sessions: PomodoroSession[] | null | undefined
): DailyStats {
  // 安全检查
  const safeTasks = tasks || [];
  const safeSessions = sessions || [];

  const today = format(new Date(), 'yyyy-MM-dd');
  
  // 获取今日完成的任务
  const todayCompletedTasks = getTodayCompletedTasks(safeTasks);
  
  // 获取今日的番茄钟会话
  const todaySessions = getTodayPomodoroSessions(safeSessions);
  const completedTodaySessions = todaySessions.filter(session => session.completed);
  
  // 计算工作时间和休息时间
  const workSessions = completedTodaySessions.filter(session => session.type === 'work');
  const breakSessions = completedTodaySessions.filter(session => 
    session.type === 'shortBreak' || session.type === 'longBreak'
  );
  
  const workTime = workSessions.reduce((total, session) => {
    // 确保时长为正数
    const duration = Math.max(0, session.duration || 0);
    return total + duration;
  }, 0);
  
  const breakTime = breakSessions.reduce((total, session) => {
    // 确保时长为正数
    const duration = Math.max(0, session.duration || 0);
    return total + duration;
  }, 0);
  
  // 计算专注分数 (基于任务完成效率和番茄钟完成情况)
  const focusScore = calculateFocusScore(todayCompletedTasks, workSessions);
  
  return {
    date: today,
    totalPomodoros: workSessions.length,
    workTime,
    breakTime,
    tasksCompleted: todayCompletedTasks.length,
    focusScore
  };
}

/**
 * 格式化时长为可读字符串
 * @param minutes 分钟数
 * @returns 格式化的时长字符串
 */
export function formatDuration(minutes: number | null | undefined): string {
  // 安全检查和边界处理
  if (minutes === null || minutes === undefined || minutes < 0 || isNaN(minutes)) {
    return '0分钟';
  }
  
  const safeMinutes = Math.floor(minutes);
  
  if (safeMinutes === 0) {
    return '0分钟';
  }
  
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}分钟`;
  }
  
  return `${hours}小时${remainingMinutes}分钟`;
}

/**
 * 获取今日完成的任务
 * @param tasks 所有任务列表
 * @returns 今日完成的任务列表
 */
export function getTodayCompletedTasks(tasks: Task[] | null | undefined): Task[] {
  // 安全检查
  if (!tasks || !Array.isArray(tasks)) {
    return [];
  }
  
  return tasks.filter(task => {
    // 必须是已完成的任务
    if (!task.completed) {
      return false;
    }
    
    // 必须有completedAt字段且是今天
    if (!task.completedAt) {
      return false;
    }
    
    return isToday(new Date(task.completedAt));
  });
}

/**
 * 获取今日的番茄钟会话
 * @param sessions 所有会话列表
 * @returns 今日的会话列表
 */
export function getTodayPomodoroSessions(sessions: PomodoroSession[] | null | undefined): PomodoroSession[] {
  // 安全检查
  if (!sessions || !Array.isArray(sessions)) {
    return [];
  }
  
  return sessions.filter(session => {
    if (!session.startTime) {
      return false;
    }
    
    return isToday(new Date(session.startTime));
  });
}

/**
 * 创建空的今日统计数据
 * @param date 可选的日期，默认为今天
 * @returns 空的统计数据对象
 */
export function createEmptyDailyStats(date?: string): DailyStats {
  const targetDate = date || format(new Date(), 'yyyy-MM-dd');
  
  return {
    date: targetDate,
    totalPomodoros: 0,
    workTime: 0,
    breakTime: 0,
    tasksCompleted: 0,
    focusScore: 0
  };
}

/**
 * 计算专注分数
 * @param completedTasks 今日完成的任务
 * @param workSessions 今日工作会话
 * @returns 专注分数 (0-100)
 */
function calculateFocusScore(completedTasks: Task[], workSessions: PomodoroSession[]): number {
  // 如果没有任何活动，返回0
  if (completedTasks.length === 0 && workSessions.length === 0) {
    return 0;
  }
  
  let score = 0;
  
  // 基础分数：完成的番茄钟数量 (每个15分)
  score += Math.min(workSessions.length * 15, 60);
  
  // 任务完成分数：每个完成的任务20分
  score += Math.min(completedTasks.length * 20, 40);
  
  // 效率分数：基于预估vs实际使用的番茄钟数量
  if (completedTasks.length > 0) {
    const totalEstimated = completedTasks.reduce((sum, task) => sum + (task.estimatedPomodoros || 0), 0);
    const totalUsed = completedTasks.reduce((sum, task) => sum + (task.pomodorosUsed || 0), 0);
    
    if (totalEstimated > 0) {
      const efficiency = totalUsed / totalEstimated;
      if (efficiency <= 1.0) {
        // 按时或提前完成，获得效率奖励（最高30分）
        score += Math.min(30 * (1.2 - efficiency), 30);
      } else {
        // 超时完成，轻微扣分
        score -= Math.min(10 * (efficiency - 1.0), 10);
      }
    }
  }
  
  // 确保分数在0-100范围内
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 生成周视图的日期标签
 * REQ-TM-S02: AC-S02.2 图表应清晰标注日期（如 "周一", "7/22"）
 * @param weekStart 周开始日期
 * @returns 7天的标签数组
 */
export function generateWeekLabels(weekStart: Date): string[] {
  const labels: string[] = [];
  const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const weekday = weekdays[i];
    const monthDay = format(date, 'M/d');
    labels.push(`${weekday} ${monthDay}`);
  }
  
  return labels;
}

/**
 * 计算周统计数据
 * REQ-TM-S02: 查看本周整体表现
 * @param dailyStats 每日统计数据数组
 * @param weekStart 周开始日期
 * @returns 周统计数据
 */
export function calculateWeeklyStats(dailyStats: DailyStats[], weekStart: Date): WeeklyStats {
  // 安全检查
  if (!dailyStats || !Array.isArray(dailyStats)) {
    return createEmptyWeeklyStats(weekStart);
  }
  
  if (dailyStats.length === 0) {
    return createEmptyWeeklyStats(weekStart);
  }
  
  // 计算总番茄钟数
  const totalPomodoros = dailyStats.reduce((sum, day) => sum + day.totalPomodoros, 0);
  
  // 计算平均专注分数 - 修复：应该只计算有数据的天数的平均值
  const totalScore = dailyStats.reduce((sum, day) => sum + day.focusScore, 0);
  const averageFocusScore = totalScore / dailyStats.length;
  
  // 找出最高效的一天
  const mostProductiveDay = findMostProductiveDay(dailyStats);
  
  return {
    weekStart: format(weekStart, 'yyyy-MM-dd'),
    dailyStats,
    totalPomodoros,
    averageFocusScore: Math.round(averageFocusScore * 10) / 10, // 保留一位小数
    mostProductiveDay
  };
}

/**
 * 创建空的周统计数据
 * @param weekStart 周开始日期
 * @returns 空的周统计数据
 */
function createEmptyWeeklyStats(weekStart: Date): WeeklyStats {
  return {
    weekStart: format(weekStart, 'yyyy-MM-dd'),
    dailyStats: [],
    totalPomodoros: 0,
    averageFocusScore: 0,
    mostProductiveDay: ''
  };
}

/**
 * 找出最高效的一天
 * @param dailyStats 每日统计数据
 * @returns 最高效一天的日期字符串
 */
function findMostProductiveDay(dailyStats: DailyStats[]): string {
  if (dailyStats.length === 0) {
    return '';
  }
  
  // 按工作时间排序，找出最高效的一天
  const sortedDays = [...dailyStats].sort((a, b) => b.workTime - a.workTime);
  const mostProductive = sortedDays[0];
  
  // 如果最高效的一天工作时间为0，说明本周没有专注记录
  if (mostProductive.workTime === 0) {
    return '';
  }
  
  return mostProductive.date;
}

/**
 * 扩展formatDuration函数以支持小时分钟格式
 * REQ-TM-S02: AC-S02.4 显示本周总专注时长
 * @param minutes 分钟数
 * @returns 格式化的时长字符串（如："2小时5分钟"）
 */
export function formatDurationWithHours(minutes: number | null | undefined): string {
  // 安全检查和边界处理
  if (minutes === null || minutes === undefined || minutes < 0 || isNaN(minutes)) {
    return '0小时0分钟';
  }
  
  const safeMinutes = Math.floor(minutes);
  
  if (safeMinutes === 0) {
    return '0小时0分钟';
  }
  
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;
  
  return `${hours}小时${remainingMinutes}分钟`;
}
