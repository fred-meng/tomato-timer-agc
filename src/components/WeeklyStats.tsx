/**
 * 本周整体表现组件
 * REQ-TM-S02: 查看本周整体表现
 * 用户故事：作为市场经理Sarah，我希望看到本周（最近7天）的整体表现图表，
 *          以便快速评估我本周的工作投入节奏，并为周报提供数据支持。
 */

'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { BarChart3, Clock, Target, TrendingUp } from 'lucide-react';
import { useWeeklyStats, formatStatValues } from '@/hooks/useWeeklyStats';
import { generateWeekLabels, formatDuration } from '@/lib/statsCalculator';
import { format, subDays, addDays } from 'date-fns';

// 常量定义
const CHART_CONFIG = {
  DAYS_PER_WEEK: 7,
  CHART_HEIGHT: 64, // h-64 对应 256px
  ICON_SIZE: 6, // w-6 h-6
  STATS_ICON_SIZE: 12, // w-12 h-12
} as const;

const CHART_COLORS = {
  BAR_BACKGROUND: 'rgba(239, 68, 68, 0.8)',
  BAR_BORDER: 'rgba(239, 68, 68, 1)',
  BORDER_WIDTH: 1,
  BORDER_RADIUS: 4,
} as const;

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * 空状态组件
 */
const EmptyStateDisplay: React.FC = () => (
  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
    <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
    <p className="text-lg font-medium mb-1">本周还没有专注记录</p>
    <p className="text-sm">开始你的第一个番茄钟吧！</p>
  </div>
);

/**
 * 最佳表现日组件
 */
interface BestPerformanceDayProps {
  mostProductiveDay?: string;
}

const BestPerformanceDay: React.FC<BestPerformanceDayProps> = ({ mostProductiveDay }) => {
  if (!mostProductiveDay) return null;
  
  return (
    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          本周最佳表现
        </p>
        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
          {format(new Date(mostProductiveDay), 'M月d日')}
        </p>
      </div>
    </div>
  );
};

/**
 * 统计指标项配置
 */
interface StatItemConfig {
  icon: React.ComponentType<any>;
  iconBgColor: string;
  iconColor: string;
  title: string;
  value: string;
}

/**
 * 统计指标项组件
 */
const StatItem: React.FC<StatItemConfig> = ({ 
  icon: Icon, 
  iconBgColor, 
  iconColor, 
  title, 
  value 
}) => (
  <div className="text-center">
    <div className={`flex items-center justify-center w-12 h-12 ${iconBgColor} rounded-xl mb-3 mx-auto`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
      {title}
    </h3>
    <p className="text-2xl font-bold text-gray-800 dark:text-white">
      {value}
    </p>
  </div>
);

/**
 * 创建图表配置选项
 */
const createChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      mode: 'index' as const,
      intersect: false,
      callbacks: {
        label: (context: any) => {
          const minutes = context.raw;
          const duration = formatDuration(minutes);
          const label = context.label; // 这里包含了日期信息，如"周一 7/22"
          return `${label}: ${duration}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: '分钟',
      },
    },
  },
});

/**
 * 创建图表数据
 */
const createChartData = (weeklyStats: any, weekStart: Date) => ({
  labels: generateWeekLabels(weekStart),
  datasets: [
    {
      label: '专注时长 (分钟)',
      data: Array.from({ length: CHART_CONFIG.DAYS_PER_WEEK }, (_, index) => {
        const targetDate = format(addDays(weekStart, index), 'yyyy-MM-dd');
        const dayStats = weeklyStats.dailyStats.find((stat: any) => stat.date === targetDate);
        return dayStats ? dayStats.workTime : 0;
      }),
      backgroundColor: CHART_COLORS.BAR_BACKGROUND,
      borderColor: CHART_COLORS.BAR_BORDER,
      borderWidth: CHART_COLORS.BORDER_WIDTH,
      borderRadius: CHART_COLORS.BORDER_RADIUS,
    },
  ],
});

const WeeklyStats: React.FC = () => {
  // 使用自定义Hook获取数据
  const { weeklyStats, isEmptyWeek, weekStart, totalWorkTime, error } = useWeeklyStats();

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
          <h2 className="text-lg font-semibold">本周表现</h2>
        </div>
        <p className="text-red-500">加载数据时出错: {error}</p>
      </div>
    );
  }

  if (!weeklyStats) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
          <h2 className="text-lg font-semibold">本周表现</h2>
        </div>
        <p className="text-gray-500">本周还没有专注记录</p>
      </div>
    );
  }

  // 格式化统计值
  const statValues = formatStatValues(weeklyStats, totalWorkTime);

  // 创建图表数据和配置
  const chartData = createChartData(weeklyStats, weekStart);
  const chartOptions = createChartOptions();

  return (
    <div 
      data-testid="weekly-stats-container"
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 transition-colors duration-300"
    >
      {/* 标题 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-blue-500" />
          本周表现
        </h2>
        {!isEmptyWeek && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {format(weekStart, 'M月d日')} - {format(subDays(weekStart, -6), 'M月d日')}
          </div>
        )}
      </div>

      {/* 空状态提示 */}
      {isEmptyWeek && <EmptyStateDisplay />}

      {/* 图表区域 */}
      {!isEmptyWeek && (
        <div className="mb-6">
          <div className="h-64 mb-4">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* 统计指标 */}
      <div className="grid grid-cols-3 gap-4">
        <StatItem
          icon={Clock}
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
          title="本周总专注时长"
          value={statValues.totalWorkTimeFormatted}
        />
        
        <StatItem
          icon={Target}
          iconBgColor="bg-red-100 dark:bg-red-900/30"
          iconColor="text-red-600 dark:text-red-400"
          title="本周番茄钟"
          value={statValues.totalPomodorosFormatted}
        />
        
        <StatItem
          icon={TrendingUp}
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
          title="平均专注分数"
          value={statValues.averageFocusScoreFormatted}
        />
      </div>

      {/* 最佳表现日 */}
      {!isEmptyWeek && (
        <BestPerformanceDay mostProductiveDay={weeklyStats.mostProductiveDay} />
      )}
    </div>
  );
};

export default WeeklyStats;
