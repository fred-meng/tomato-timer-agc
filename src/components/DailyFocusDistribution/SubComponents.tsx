/**
 * DailyFocusDistribution 子组件
 * 处理状态显示和图表渲染
 */

import React from 'react';

// 常量定义 (从主组件移出)
export const CHART_CONSTANTS = {
  HOURS_IN_DAY: 24,
  CHART_HEIGHT: 120, // px
  MIN_BAR_HEIGHT: 4, // px
  HOUR_LABEL_INTERVAL: 6, // 每6小时显示完整时间标签
} as const;

export const GRID_LAYOUTS = {
  cols6: 'grid-cols-6',
  sm: 'sm:grid-cols-8', 
  md: 'md:grid-cols-12',
  lg: 'lg:grid-cols-24',
} as const;

// 格式化时间显示
export const formatHour = (hour: number) => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

// 获取柱状图高度百分比
export const getBarHeight = (value: number, maxValue: number) => {
  if (maxValue === 0) return 0;
  return (value / maxValue) * 100;
};

// 加载状态组件
export const LoadingIndicator: React.FC = () => (
  <div data-testid="loading-indicator" className="flex justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <span className="ml-2">加载中...</span>
  </div>
);

// 错误状态组件
export const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <div data-testid="error-message" className="text-red-500 text-center py-8">
    {error}
  </div>
);

// 空数据状态组件
export const EmptyState: React.FC = () => (
  <div data-testid="empty-data-state" className="text-center py-8 text-gray-500">
    <div className="text-4xl mb-2">📊</div>
    <p>暂无数据</p>
    <p className="text-sm mt-1">在选定日期没有专注时间记录</p>
  </div>
);

// 单个小时柱状图组件
interface HourBarProps {
  hour: number;
  value?: number;
  maxValue: number;
}

export const HourBar: React.FC<HourBarProps> = ({ hour, value, maxValue }) => (
  <div className="flex flex-col items-center">
    {/* 柱状图 */}
    <div 
      className="w-full bg-gray-200 rounded-t relative"
      style={{ height: `${CHART_CONSTANTS.CHART_HEIGHT}px` }}
    >
      {value && (
        <div
          data-testid={`chart-bar-${hour}`}
          className="absolute bottom-0 left-0 w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
          style={{ 
            height: `${getBarHeight(value, maxValue)}%`,
            minHeight: value > 0 ? `${CHART_CONSTANTS.MIN_BAR_HEIGHT}px` : '0px'
          }}
          title={`${formatHour(hour)}: ${value}分钟`}
        />
      )}
    </div>
    
    {/* 时间标签 */}
    <div 
      data-testid={`hour-${hour}`}
      className="text-xs mt-1 text-center"
      style={{ fontSize: '10px' }}
    >
      {hour % CHART_CONSTANTS.HOUR_LABEL_INTERVAL === 0 ? formatHour(hour) : hour}
    </div>
    
    {/* 数值显示 */}
    {value && (
      <div className="text-xs text-gray-600 mt-1">
        {value}min
      </div>
    )}
  </div>
);

// 图表组件
interface ChartProps {
  data: Record<number, number>;
  maxValue: number;
}

export const FocusChart: React.FC<ChartProps> = ({ data, maxValue }) => (
  <div data-testid="focus-distribution-chart" className="animate-fadeIn">
    {/* 图表标题 */}
    <div className="flex justify-between items-center mb-4">
      <span className="text-sm font-medium">专注时长 (分钟)</span>
      <span className="text-sm text-gray-500">24小时分布</span>
    </div>

    {/* 24小时柱状图 */}
    <div className={`grid ${GRID_LAYOUTS.cols6} ${GRID_LAYOUTS.sm} ${GRID_LAYOUTS.md} ${GRID_LAYOUTS.lg} gap-1 mb-6`}>
      {Array.from({ length: CHART_CONSTANTS.HOURS_IN_DAY }, (_, hour) => (
        <HourBar 
          key={hour} 
          hour={hour} 
          value={data[hour]} 
          maxValue={maxValue}
        />
      ))}
    </div>
  </div>
);

// 统计摘要组件
interface StatsSummaryProps {
  totalFocusTime: number;
  activeHours: number;
  peakHour: string | null;
  averageTime: number;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ 
  totalFocusTime, 
  activeHours, 
  peakHour, 
  averageTime 
}) => (
  <div className="bg-gray-50 rounded-lg p-4 mt-4">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
      <div>
        <div className="text-gray-500">总专注时长</div>
        <div className="font-semibold text-lg">
          {totalFocusTime}分钟
        </div>
      </div>
      <div>
        <div className="text-gray-500">活跃小时数</div>
        <div className="font-semibold text-lg">
          {activeHours}小时
        </div>
      </div>
      <div>
        <div className="text-gray-500">最高峰时段</div>
        <div className="font-semibold text-lg">
          {peakHour 
            ? formatHour(Number(peakHour))
            : '--:--'
          }
        </div>
      </div>
      <div>
        <div className="text-gray-500">平均时长</div>
        <div className="font-semibold text-lg">
          {averageTime}分钟/时
        </div>
      </div>
    </div>
  </div>
);
