/**
 * WeeklyStats 业务逻辑 Hook
 * 处理本周统计数据的获取和计算逻辑
 */


import { useMemo, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { formatDurationWithHours } from '@/lib/statsCalculator';

// 定义强类型接口
export interface WeeklyStatsData {
  weekStart: string;
  dailyStats: DailyStats[];
  totalPomodoros: number;
  averageFocusScore: number;
  mostProductiveDay?: string;
}

export interface DailyStats {
  date: string;
  workTime: number;
  totalPomodoros: number;
  breakTime: number;
  tasksCompleted: number;
  focusScore: number;
}

export interface UseWeeklyStatsResult {
  weeklyStats: WeeklyStatsData | null;
  isEmptyWeek: boolean;
  weekStart: Date;
  totalWorkTime: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * 计算总工作时间的纯函数
 */
const calculateTotalWorkTime = (dailyStats: DailyStats[]): number => {
  if (!Array.isArray(dailyStats)) return 0;
  return dailyStats.reduce((sum, day) => sum + (day?.workTime || 0), 0);
};

/**
 * 验证周统计数据的有效性
 */
const validateWeeklyStats = (data: any): data is WeeklyStatsData => {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.weekStart === 'string' &&
    Array.isArray(data.dailyStats) &&
    typeof data.totalPomodoros === 'number' &&
    typeof data.averageFocusScore === 'number'
  );
};

/**
 * 使用本周统计数据的Hook
 */
export const useWeeklyStats = (): UseWeeklyStatsResult => {
  const { getWeeklyStats } = useAppStore();
  
  // 使用 useCallback 优化数据获取函数
  const fetchWeeklyStats = useCallback(() => {
    if (!getWeeklyStats) return null;
    try {
      return getWeeklyStats();
    } catch (error) {
      console.error('Failed to fetch weekly stats:', error);
      return null;
    }
  }, [getWeeklyStats]);

  // 使用 useMemo 优化计算结果
  const result = useMemo((): UseWeeklyStatsResult => {
    try {
      const rawStats = fetchWeeklyStats();
      
      // 数据验证
      if (!rawStats || !validateWeeklyStats(rawStats)) {
        return {
          weeklyStats: null,
          isEmptyWeek: true,
          weekStart: new Date(),
          totalWorkTime: 0,
          isLoading: false,
          error: rawStats ? 'Invalid data format' : null,
          refetch: fetchWeeklyStats,
        };
      }

      const weeklyStats = rawStats as WeeklyStatsData;
      const isEmptyWeek = weeklyStats.totalPomodoros === 0;
      const weekStart = new Date(weeklyStats.weekStart);
      const totalWorkTime = calculateTotalWorkTime(weeklyStats.dailyStats);

      return {
        weeklyStats,
        isEmptyWeek,
        weekStart,
        totalWorkTime,
        isLoading: false,
        error: null,
        refetch: fetchWeeklyStats,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error in useWeeklyStats:', error);
      
      return {
        weeklyStats: null,
        isEmptyWeek: true,
        weekStart: new Date(),
        totalWorkTime: 0,
        isLoading: false,
        error: errorMessage,
        refetch: fetchWeeklyStats,
      };
    }
  }, [fetchWeeklyStats]);

  return result;
};

/**
 * 格式化统计指标值
 * 使用 useMemo 优化的格式化函数
 */
export const useFormattedStatValues = (
  weeklyStats: WeeklyStatsData | null, 
  totalWorkTime: number
) => {
  return useMemo(() => ({
    totalWorkTimeFormatted: formatDurationWithHours(totalWorkTime),
    totalPomodorosFormatted: `${weeklyStats?.totalPomodoros || 0}个`,
    averageFocusScoreFormatted: `${Math.round(weeklyStats?.averageFocusScore || 0)}分`,
  }), [weeklyStats?.totalPomodoros, weeklyStats?.averageFocusScore, totalWorkTime]);
};

/**
 * 旧版本兼容的格式化函数（已废弃，建议使用 useFormattedStatValues）
 * @deprecated 请使用 useFormattedStatValues Hook 以获得更好的性能
 */
export const formatStatValues = (weeklyStats: any, totalWorkTime: number) => ({
  totalWorkTimeFormatted: formatDurationWithHours(totalWorkTime),
  totalPomodorosFormatted: `${weeklyStats?.totalPomodoros || 0}个`,
  averageFocusScoreFormatted: `${Math.round(weeklyStats?.averageFocusScore || 0)}分`,
});
