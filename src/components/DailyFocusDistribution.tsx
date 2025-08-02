/**
 * REQ-TM-S03: 每日专注时长分布组件
 * 
 * 功能：
 * 1. 显示24小时的专注时长分布
 * 2. 日期选择器
 * 3. 可视化图表展示
 * 4. 响应式设计
 * 5. 主题支持
 */

'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  LoadingIndicator, 
  ErrorMessage, 
  EmptyState, 
  FocusChart, 
  StatsSummary 
} from './DailyFocusDistribution/SubComponents';
import { useDailyFocusData } from './DailyFocusDistribution/useDailyFocusData';

// 主题样式工具函数
const createThemeStyles = (theme: 'light' | 'dark') => ({
  container: theme === 'dark' 
    ? 'bg-gray-900 text-white' 
    : 'bg-white text-gray-900',
  
  dateInput: theme === 'dark' 
    ? 'bg-gray-800 border-gray-600 text-white' 
    : 'bg-white border-gray-300 text-gray-900',
});

// 统计数据计算工具函数
const calculateStats = (data: Record<number, number>) => {
  const values = Object.values(data);
  const keys = Object.keys(data);
  
  const totalFocusTime = values.reduce((sum, value) => sum + value, 0);
  const activeHours = keys.length;
  const maxValue = values.length > 0 ? Math.max(...values) : 0;
  
  const peakHour = maxValue > 0 
    ? keys.find(hour => data[Number(hour)] === maxValue) || '0'
    : null;
    
  const averageTime = activeHours > 0 
    ? Math.round(totalFocusTime / activeHours)
    : 0;
  
  return {
    totalFocusTime,
    activeHours,
    maxValue,
    peakHour,
    averageTime
  };
};

export interface DailyFocusDistributionProps {
  /** 初始显示日期，格式：YYYY-MM-DD */
  initialDate?: string;
  /** 自定义CSS类名 */
  className?: string;
  /** 主题 */
  theme?: 'light' | 'dark';
  /** 获取会话数据的函数 */
  getSessionsData?: () => Promise<any[]>;
}

export const DailyFocusDistribution: React.FC<DailyFocusDistributionProps> = ({
  initialDate,
  className = '',
  theme = 'light',
  getSessionsData
}) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(initialDate || today);
  
  // 使用自定义Hook获取数据
  const { data, loading, error } = useDailyFocusData({ 
    selectedDate, 
    getSessionsData 
  });

  // 处理日期选择
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (newDate && newDate !== 'invalid-date') {
      setSelectedDate(newDate);
    }
  };

  // 获取最大值用于图表比例计算和统计数据
  const stats = calculateStats(data);

  // 获取主题样式
  const themeStyles = createThemeStyles(theme);

  return (
    <div 
      data-testid="daily-focus-distribution"
      className={`daily-focus-distribution ${themeStyles.container} ${className}`}
      role="region"
      aria-label="专注时长分布图表"
    >
      {/* 标题和日期选择器 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-2 sm:space-y-0">
        <h3 className="text-lg font-semibold">每日专注时长分布</h3>
        <div className="flex items-center space-x-3">
          <label htmlFor="date-picker" className="text-sm font-medium">
            选择日期:
          </label>
          <input
            id="date-picker"
            data-testid="date-picker"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeStyles.dateInput}`}
            aria-expanded="false"
          />
        </div>
      </div>

      {/* 当前日期显示 */}
      <div data-testid="current-date-display" className="mb-4 text-sm text-gray-600">
        {selectedDate === today ? '今天' : selectedDate}
      </div>

      {/* 加载状态 */}
      {loading && <LoadingIndicator />}

      {/* 错误状态 */}
      {error && <ErrorMessage error={error} />}

      {/* 空数据状态 */}
      {!loading && !error && Object.keys(data).length === 0 && <EmptyState />}

      {/* 专注分布图表 */}
      {!loading && !error && Object.keys(data).length > 0 && (
        <>
          <FocusChart data={data} maxValue={stats.maxValue} />
          <StatsSummary 
            totalFocusTime={stats.totalFocusTime}
            activeHours={stats.activeHours}
            peakHour={stats.peakHour}
            averageTime={stats.averageTime}
          />
        </>
      )}
    </div>
  );
};
