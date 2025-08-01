/**
 * REQ-TM-S02 单元测试
 * 功能：查看本周整体表现 - WeeklyStats组件单元测试
 */

import { formatDuration, generateWeekLabels, calculateWeeklyStats } from '@/lib/statsCalculator';
import { format, subDays, startOfWeek } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { DailyStats, WeeklyStats } from '@/types';

describe('WeeklyStats相关工具函数单元测试', () => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  // 测试数据
  const mockDailyStats: DailyStats[] = Array.from({ length: 7 }, (_, index) => {
    const date = subDays(today, 6 - index);
    const focusTime = [120, 90, 150, 180, 75, 60, 0][index];
    return {
      date: format(date, 'yyyy-MM-dd'),
      totalPomodoros: Math.floor(focusTime / 25),
      workTime: focusTime,
      breakTime: Math.floor(focusTime / 5),
      tasksCompleted: Math.floor(focusTime / 50),
      focusScore: focusTime > 0 ? Math.min(100, focusTime / 2) : 0
    };
  });

  describe('generateWeekLabels', () => {
    test('应该生成7个包含星期和日期的标签', () => {
      const labels = generateWeekLabels(weekStart);
      
      expect(labels).toHaveLength(7);
      
      // 验证第一个标签格式
      expect(labels[0]).toMatch(/^周[一二三四五六日]\s\d{1,2}\/\d{1,2}$/);
    });

    test('应该按照周一到周日的顺序生成标签', () => {
      const labels = generateWeekLabels(weekStart);
      const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      
      labels.forEach((label: string, index: number) => {
        expect(label).toContain(weekdays[index]);
      });
    });

    test('应该使用正确的日期格式', () => {
      const testDate = new Date('2024-07-22'); // 周一
      const labels = generateWeekLabels(testDate);
      
      expect(labels[0]).toBe('周一 7/22');
      expect(labels[1]).toBe('周二 7/23');
      expect(labels[6]).toBe('周日 7/28');
    });
  });

  describe('calculateWeeklyStats', () => {
    test('应该正确计算总番茄钟数', () => {
      const weeklyStats = calculateWeeklyStats(mockDailyStats, weekStart);
      
      const expectedTotal = mockDailyStats.reduce((sum, day) => sum + day.totalPomodoros, 0);
      expect(weeklyStats.totalPomodoros).toBe(expectedTotal);
    });

    test('应该正确计算平均专注分数', () => {
      const weeklyStats = calculateWeeklyStats(mockDailyStats, weekStart);
      
      const expectedAverage = mockDailyStats.reduce((sum, day) => sum + day.focusScore, 0) / 7;
      expect(weeklyStats.averageFocusScore).toBeCloseTo(expectedAverage, 1);
    });

    test('应该找到最高效的一天', () => {
      const weeklyStats = calculateWeeklyStats(mockDailyStats, weekStart);
      
      // 根据测试数据，180分钟那天应该是最高效的
      const mostProductiveDay = mockDailyStats.find(day => day.workTime === 180);
      expect(weeklyStats.mostProductiveDay).toBe(mostProductiveDay?.date);
    });

    test('应该包含正确的周开始日期', () => {
      const weeklyStats = calculateWeeklyStats(mockDailyStats, weekStart);
      
      expect(weeklyStats.weekStart).toBe(format(weekStart, 'yyyy-MM-dd'));
    });

    test('应该包含所有每日统计数据', () => {
      const weeklyStats = calculateWeeklyStats(mockDailyStats, weekStart);
      
      expect(weeklyStats.dailyStats).toHaveLength(7);
      expect(weeklyStats.dailyStats).toEqual(mockDailyStats);
    });
  });

  describe('边界情况测试', () => {
    test('空数据数组应该返回合理的默认值', () => {
      const emptyStats: DailyStats[] = [];
      const weeklyStats = calculateWeeklyStats(emptyStats, weekStart);
      
      expect(weeklyStats.totalPomodoros).toBe(0);
      expect(weeklyStats.averageFocusScore).toBe(0);
      expect(weeklyStats.mostProductiveDay).toBe('');
      expect(weeklyStats.dailyStats).toEqual([]);
    });

    test('所有天数都没有专注时间的情况', () => {
      const zeroStats: DailyStats[] = Array.from({ length: 7 }, (_, index) => ({
        date: format(subDays(today, 6 - index), 'yyyy-MM-dd'),
        totalPomodoros: 0,
        workTime: 0,
        breakTime: 0,
        tasksCompleted: 0,
        focusScore: 0
      }));

      const weeklyStats = calculateWeeklyStats(zeroStats, weekStart);
      
      expect(weeklyStats.totalPomodoros).toBe(0);
      expect(weeklyStats.averageFocusScore).toBe(0);
      expect(weeklyStats.mostProductiveDay).toBe('');
    });

    test('只有一天有数据的情况', () => {
      const singleDayStats: DailyStats[] = [
        {
          date: format(today, 'yyyy-MM-dd'),
          totalPomodoros: 5,
          workTime: 125,
          breakTime: 25,
          tasksCompleted: 2,
          focusScore: 80
        }
      ];

      const weeklyStats = calculateWeeklyStats(singleDayStats, weekStart);
      
      expect(weeklyStats.totalPomodoros).toBe(5);
      expect(weeklyStats.averageFocusScore).toBeCloseTo(80, 1); // 单日数据的分数
      expect(weeklyStats.mostProductiveDay).toBe(format(today, 'yyyy-MM-dd'));
    });
  });

  describe('formatDuration单元测试', () => {
    test('应该正确格式化小时和分钟', () => {
      expect(formatDuration(125)).toBe('2小时5分钟');
      expect(formatDuration(60)).toBe('1小时0分钟');
      expect(formatDuration(30)).toBe('30分钟');
      expect(formatDuration(0)).toBe('0分钟');
    });

    test('应该处理大于24小时的情况', () => {
      expect(formatDuration(1500)).toBe('25小时0分钟'); // 25小时
      expect(formatDuration(1440)).toBe('24小时0分钟'); // 24小时
    });

    test('应该处理负数或无效输入', () => {
      expect(formatDuration(-30)).toBe('0分钟');
      expect(formatDuration(NaN)).toBe('0分钟');
    });
  });
});

describe('WeeklyStats组件逻辑单元测试', () => {
  describe('图表数据生成', () => {
    test('应该正确生成Chart.js数据格式', () => {
      const dailyStats: DailyStats[] = [
        { date: '2024-07-22', totalPomodoros: 4, workTime: 100, breakTime: 20, tasksCompleted: 2, focusScore: 80 },
        { date: '2024-07-23', totalPomodoros: 6, workTime: 150, breakTime: 30, tasksCompleted: 3, focusScore: 90 }
      ];
      
      const chartData = generateChartData(dailyStats, new Date('2024-07-22'));
      
      expect(chartData.labels).toHaveLength(7);
      expect(chartData.datasets[0].data).toEqual([100, 150, 0, 0, 0, 0, 0]);
      expect(chartData.datasets[0].label).toBe('专注时长 (分钟)');
    });

    test('应该使用正确的图表样式配置', () => {
      const chartData = generateChartData([], new Date());
      
      expect(chartData.datasets[0].backgroundColor).toBe('rgba(59, 130, 246, 0.8)');
      expect(chartData.datasets[0].borderColor).toBe('rgba(59, 130, 246, 1)');
      expect(chartData.datasets[0].borderWidth).toBe(1);
      expect(chartData.datasets[0].borderRadius).toBe(8);
    });
  });

  describe('图表选项配置', () => {
    test('应该配置正确的图表选项', () => {
      const options = getChartOptions();
      
      expect(options.responsive).toBe(true);
      expect(options.maintainAspectRatio).toBe(false);
      expect(options.plugins.legend.display).toBe(false);
      expect(options.plugins.tooltip.enabled).toBe(true);
      expect(options.scales.x.grid.display).toBe(false);
      expect(options.scales.y.beginAtZero).toBe(true);
    });

    test('tooltip回调应该正确格式化时长', () => {
      const options = getChartOptions();
      const tooltipCallback = options.plugins.tooltip.callbacks.label;
      
      const mockContext = {
        dataset: { label: '专注时长 (分钟)' },
        raw: 125,
        label: '周一 7/22'
      };
      
      const result = tooltipCallback(mockContext);
      expect(result).toBe('专注时长: 2小时5分钟');
    });
  });

  describe('数据聚合功能', () => {
    test('应该正确计算总工作时间', () => {
      const dailyStats: DailyStats[] = [
        { date: '2024-07-22', totalPomodoros: 4, workTime: 100, breakTime: 20, tasksCompleted: 2, focusScore: 80 },
        { date: '2024-07-23', totalPomodoros: 6, workTime: 150, breakTime: 30, tasksCompleted: 3, focusScore: 90 },
        { date: '2024-07-24', totalPomodoros: 0, workTime: 0, breakTime: 0, tasksCompleted: 0, focusScore: 0 }
      ];
      
      const totalWorkTime = calculateTotalWorkTime(dailyStats);
      expect(totalWorkTime).toBe(250); // 100 + 150 + 0
    });

    test('应该正确计算总番茄钟数', () => {
      const dailyStats: DailyStats[] = [
        { date: '2024-07-22', totalPomodoros: 4, workTime: 100, breakTime: 20, tasksCompleted: 2, focusScore: 80 },
        { date: '2024-07-23', totalPomodoros: 6, workTime: 150, breakTime: 30, tasksCompleted: 3, focusScore: 90 }
      ];
      
      const totalPomodoros = calculateTotalPomodoros(dailyStats);
      expect(totalPomodoros).toBe(10); // 4 + 6
    });

    test('应该正确计算平均专注分数', () => {
      const dailyStats: DailyStats[] = [
        { date: '2024-07-22', totalPomodoros: 4, workTime: 100, breakTime: 20, tasksCompleted: 2, focusScore: 80 },
        { date: '2024-07-23', totalPomodoros: 6, workTime: 150, breakTime: 30, tasksCompleted: 3, focusScore: 90 },
        { date: '2024-07-24', totalPomodoros: 0, workTime: 0, breakTime: 0, tasksCompleted: 0, focusScore: 0 }
      ];
      
      const averageScore = calculateAverageFocusScore(dailyStats);
      expect(averageScore).toBeCloseTo(56.67, 1); // (80 + 90 + 0) / 3
    });
  });
});

// 辅助函数模拟（这些会在实际实现中定义）
function generateChartData(dailyStats: DailyStats[], weekStart: Date) {
  const labels = generateWeekLabels(weekStart);
  const data = Array.from({ length: 7 }, (_, index) => {
    const targetDate = format(subDays(weekStart, -index), 'yyyy-MM-dd');
    const dayStats = dailyStats.find(stat => stat.date === targetDate);
    return dayStats?.workTime || 0;
  });

  return {
    labels,
    datasets: [{
      label: '专注时长 (分钟)',
      data,
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
      borderRadius: 8
    }]
  };
}

function getChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            const minutes = context.raw;
            const duration = formatDuration(minutes);
            return `专注时长: ${duration}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '分钟'
        }
      }
    }
  };
}

function calculateTotalWorkTime(dailyStats: DailyStats[]): number {
  return dailyStats.reduce((sum, day) => sum + day.workTime, 0);
}

function calculateTotalPomodoros(dailyStats: DailyStats[]): number {
  return dailyStats.reduce((sum, day) => sum + day.totalPomodoros, 0);
}

function calculateAverageFocusScore(dailyStats: DailyStats[]): number {
  if (dailyStats.length === 0) return 0;
  const totalScore = dailyStats.reduce((sum, day) => sum + day.focusScore, 0);
  return totalScore / dailyStats.length;
}
