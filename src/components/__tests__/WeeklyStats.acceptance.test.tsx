/**
 * REQ-TM-S02 验收测试用例
 * 功能：查看本周整体表现
 * 用户故事：作为市场经理Sarah，我希望看到本周（最近7天）的整体表现图表，
 *          以便快速评估我本周的工作投入节奏，并为周报提供数据支持。
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import WeeklyStatsComponent from '@/components/WeeklyStats';
import { useAppStore } from '@/lib/store';
import { DailyStats, WeeklyStats } from '@/types';

// 声明全局变量类型
declare global {
  var chartOptions: any;
}

// Mock store
jest.mock('@/lib/store');
const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

jest.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }: any) => {
    // 将options对象存储到全局变量中以便测试访问
    (global as any).chartOptions = options;
    
    return (
      <div data-testid="weekly-chart">
        <div data-testid="chart-data">{JSON.stringify(data)}</div>
        <div data-testid="chart-options">{JSON.stringify({
          ...options,
          plugins: {
            ...options.plugins,
            tooltip: {
              ...options.plugins?.tooltip,
              callbacks: options.plugins?.tooltip?.callbacks ? 'function' : undefined
            }
          }
        })}</div>
        {data?.datasets?.[0]?.data?.map((value: number, index: number) => (
          <div key={index} data-testid={`bar-${index}`} data-value={value}>
            Bar {index}: {value}
          </div>
        ))}
      </div>
    );
  }
}));

describe('REQ-TM-S02: 查看本周整体表现 - 验收测试', () => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 周一开始
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  
  // 生成测试数据：最近7天的专注时长数据
  const mockWeeklyData: DailyStats[] = Array.from({ length: 7 }, (_, index) => {
    // 从weekStart开始，index 0 = 周一，index 6 = 周日
    const date = subDays(weekStart, -index);
    const focusTime = [120, 90, 150, 180, 75, 60, 0][index]; // 不同天的专注时长
    return {
      date: format(date, 'yyyy-MM-dd'),
      totalPomodoros: Math.floor(focusTime / 25),
      workTime: focusTime,
      breakTime: Math.floor(focusTime / 5),
      tasksCompleted: Math.floor(focusTime / 50),
      focusScore: focusTime > 0 ? Math.min(100, focusTime / 2) : 0
    };
  });

  const mockWeeklyStats: WeeklyStats = {
    weekStart: format(weekStart, 'yyyy-MM-dd'),
    dailyStats: mockWeeklyData,
    totalPomodoros: Math.floor(mockWeeklyData.reduce((sum, day) => sum + day.workTime, 0) / 25),
    averageFocusScore: mockWeeklyData.reduce((sum, day) => sum + day.focusScore, 0) / 7,
    mostProductiveDay: format(subDays(today, 3), 'yyyy-MM-dd') // 180分钟那天
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAppStore.mockReturnValue({
      getWeeklyStats: jest.fn().mockReturnValue(mockWeeklyStats),
      getDailyStats: jest.fn(),
      getTodayStats: jest.fn(),
      pomodoroSessions: [],
      tasks: [],
      addTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      addPomodoroSession: jest.fn(),
      settings: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 4,
        soundEnabled: true,
        notificationsEnabled: true,
        vibrationEnabled: false,
        theme: 'light' as const,
        autoStartBreaks: false,
        autoStartPomodoros: false
      },
      updateSettings: jest.fn()
    } as any);
  });

  // AC-S02.1: 必须展示一个包含最近7天的条形图，显示每天的总专注时长
  describe('AC-S02.1: 展示最近7天条形图', () => {
    test('应该渲染一个条形图组件', () => {
      render(<WeeklyStatsComponent />);
      
      const chart = screen.getByTestId('weekly-chart');
      expect(chart).toBeInTheDocument();
    });

    test('条形图应该包含7天的专注时长数据', () => {
      render(<WeeklyStatsComponent />);
      
      const chartData = screen.getByTestId('chart-data');
      const data = JSON.parse(chartData.textContent || '{}');
      
      // 验证数据包含7个数据点
      expect(data.datasets[0].data).toHaveLength(7);
      expect(data.labels).toHaveLength(7);
      
      // 验证数据值正确
      const expectedData = [120, 90, 150, 180, 75, 60, 0];
      expect(data.datasets[0].data).toEqual(expectedData);
    });

    test('条形图应该显示每天的总专注时长', () => {
      render(<WeeklyStatsComponent />);
      
      const chartData = screen.getByTestId('chart-data');
      const data = JSON.parse(chartData.textContent || '{}');
      
      // 验证图表标题
      expect(data.datasets[0].label).toBe('专注时长 (分钟)');
      
      // 验证Y轴配置
      const chartOptions = screen.getByTestId('chart-options');
      const options = JSON.parse(chartOptions.textContent || '{}');
      expect(options.scales.y.title.text).toBe('分钟');
    });
  });

  // AC-S02.2: 图表应清晰标注日期（如 "周一", "7/22"）
  describe('AC-S02.2: 清晰标注日期', () => {
    test('X轴标签应该显示星期和日期格式', () => {
      render(<WeeklyStatsComponent />);
      
      const chartData = screen.getByTestId('chart-data');
      const data = JSON.parse(chartData.textContent || '{}');
      
      // 验证标签格式：应该包含星期几和日期
      const labels = data.labels;
      expect(labels).toHaveLength(7);
      
      // 验证第一个标签格式（应该类似 "周一 7/22"）
      const firstLabel = labels[0];
      expect(firstLabel).toMatch(/^周[一二三四五六日]\s\d{1,2}\/\d{1,2}$/);
    });

    test('所有7天的标签都应该有正确的日期格式', () => {
      render(<WeeklyStatsComponent />);
      
      const chartData = screen.getByTestId('chart-data');
      const data = JSON.parse(chartData.textContent || '{}');
      
      const labels = data.labels;
      
      // 验证每个标签都符合格式要求
      labels.forEach((label: string) => {
        expect(label).toMatch(/^周[一二三四五六日]\s\d{1,2}\/\d{1,2}$/);
      });
      
      // 验证标签按顺序排列（从周一到周日）
      const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      labels.forEach((label: string, index: number) => {
        expect(label).toContain(weekdays[index]);
      });
    });
  });

  // AC-S02.3: 鼠标悬停在条形图的某个条上时，应显示当天的具体专注时长
  describe('AC-S02.3: 悬停显示具体时长', () => {
    test('图表应该配置tooltip显示具体专注时长', () => {
      render(<WeeklyStatsComponent />);
      
      const chartOptions = screen.getByTestId('chart-options');
      const options = JSON.parse(chartOptions.textContent || '{}');
      
      // 验证tooltip配置
      expect(options.plugins.tooltip.enabled).toBe(true);
      expect(options.plugins.tooltip.mode).toBe('index');
      expect(options.plugins.tooltip.intersect).toBe(false);
    });

    test('tooltip应该显示格式化的时长信息', () => {
      render(<WeeklyStatsComponent />);
      
      // 从全局变量获取实际的options对象
      const options = (global as any).chartOptions;
      
      // 验证tooltip回调函数存在
      expect(options.plugins.tooltip.callbacks).toBeDefined();
      expect(typeof options.plugins.tooltip.callbacks.label).toBe('function');
      
      // 测试tooltip格式化函数
      const tooltipCallback = options.plugins.tooltip.callbacks.label;
      const mockContext = {
        dataset: { label: '专注时长 (分钟)' },
        raw: 120,
        label: '周一 7/22'
      };
      
      const result = tooltipCallback(mockContext);
      expect(result).toBe('周一 7/22: 2小时0分钟');
    });
  });

  // AC-S02.4: 必须显示"本周总专注时长"的汇总数据
  describe('AC-S02.4: 显示本周总专注时长', () => {
    test('应该显示本周总专注时长标题', () => {
      render(<WeeklyStatsComponent />);
      
      expect(screen.getByText('本周总专注时长')).toBeInTheDocument();
    });

    test('应该显示正确的总专注时长', () => {
      render(<WeeklyStatsComponent />);
      
      // 计算期望的总时长：120+90+150+180+75+60+0 = 675分钟 = 11小时15分钟
      const totalMinutes = 675;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      const expectedText = `${hours}小时${minutes}分钟`;
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });

    test('应该显示本周总番茄钟数量', () => {
      render(<WeeklyStatsComponent />);
      
      // 计算期望的总番茄钟数：675分钟 / 25分钟 = 27个
      const expectedPomodoros = 27;
      
      expect(screen.getByText('本周番茄钟')).toBeInTheDocument();
      expect(screen.getByText(`${expectedPomodoros}个`)).toBeInTheDocument();
    });

    test('应该显示本周平均专注分数', () => {
      render(<WeeklyStatsComponent />);
      
      expect(screen.getByText('平均专注分数')).toBeInTheDocument();
      
      // 计算期望的平均分数
      const averageScore = Math.round(mockWeeklyStats.averageFocusScore);
      expect(screen.getByText(`${averageScore}分`)).toBeInTheDocument();
    });
  });

  // 额外测试：空数据状态
  describe('边界情况测试', () => {
    test('当本周没有专注数据时，应该显示友好提示', () => {
      const emptyWeeklyStats: WeeklyStats = {
        weekStart: format(weekStart, 'yyyy-MM-dd'),
        dailyStats: Array.from({ length: 7 }, (_, index) => ({
          date: format(subDays(today, 6 - index), 'yyyy-MM-dd'),
          totalPomodoros: 0,
          workTime: 0,
          breakTime: 0,
          tasksCompleted: 0,
          focusScore: 0
        })),
        totalPomodoros: 0,
        averageFocusScore: 0,
        mostProductiveDay: ''
      };

      mockUseAppStore.mockReturnValue({
        getWeeklyStats: jest.fn().mockReturnValue(emptyWeeklyStats),
        getDailyStats: jest.fn(),
        getTodayStats: jest.fn(),
        pomodoroSessions: [],
        tasks: [],
        addTask: jest.fn(),
        updateTask: jest.fn(),
        deleteTask: jest.fn(),
        addPomodoroSession: jest.fn(),
        settings: {
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          longBreakInterval: 4,
          soundEnabled: true,
          notificationsEnabled: true,
          vibrationEnabled: false,
          theme: 'light' as const,
          autoStartBreaks: false,
          autoStartPomodoros: false
        },
        updateSettings: jest.fn()
      } as any);

      render(<WeeklyStatsComponent />);
      
      expect(screen.getByText('本周还没有专注记录')).toBeInTheDocument();
      expect(screen.getByText('0小时0分钟')).toBeInTheDocument();
      expect(screen.getByText('0个')).toBeInTheDocument();
    });

    test('当getWeeklyStats返回null时，应该处理错误状态', () => {
      mockUseAppStore.mockReturnValue({
        getWeeklyStats: jest.fn().mockReturnValue(null),
        getDailyStats: jest.fn(),
        getTodayStats: jest.fn(),
        pomodoroSessions: [],
        tasks: [],
        addTask: jest.fn(),
        updateTask: jest.fn(),
        deleteTask: jest.fn(),
        addPomodoroSession: jest.fn(),
        settings: {
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          longBreakInterval: 4,
          soundEnabled: true,
          notificationsEnabled: true,
          vibrationEnabled: false,
          theme: 'light' as const,
          autoStartBreaks: false,
          autoStartPomodoros: false
        },
        updateSettings: jest.fn()
      } as any);

      render(<WeeklyStatsComponent />);
      
      // 应该显示加载状态或错误提示
      expect(screen.getByText(/数据加载中|本周还没有专注记录/)).toBeInTheDocument();
    });
  });

  // 组件集成测试
  describe('组件集成测试', () => {
    test('WeeklyStats组件应该正确渲染所有必需元素', () => {
      render(<WeeklyStatsComponent />);
      
      // 验证所有主要元素都存在
      expect(screen.getByTestId('weekly-stats-container')).toBeInTheDocument();
      expect(screen.getByTestId('weekly-chart')).toBeInTheDocument();
      expect(screen.getByText('本周表现')).toBeInTheDocument();
      expect(screen.getByText('本周总专注时长')).toBeInTheDocument();
      expect(screen.getByText('本周番茄钟')).toBeInTheDocument();
      expect(screen.getByText('平均专注分数')).toBeInTheDocument();
    });

    test('组件应该在store数据变化时重新渲染', async () => {
      const { rerender } = render(<WeeklyStatsComponent />);
      
      // 验证初始渲染
      expect(screen.getByText('11小时15分钟')).toBeInTheDocument();
      
      // 模拟数据变化
      const updatedStats = {
        ...mockWeeklyStats,
        totalPomodoros: 30,
        dailyStats: mockWeeklyData.map(day => ({ ...day, workTime: day.workTime + 25 }))
      };
      
      mockUseAppStore.mockReturnValue({
        getWeeklyStats: jest.fn().mockReturnValue(updatedStats),
        getDailyStats: jest.fn(),
        getTodayStats: jest.fn(),
        pomodoroSessions: [],
        tasks: [],
        addTask: jest.fn(),
        updateTask: jest.fn(),
        deleteTask: jest.fn(),
        addPomodoroSession: jest.fn(),
        settings: {
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          longBreakInterval: 4,
          soundEnabled: true,
          notificationsEnabled: true,
          vibrationEnabled: false,
          theme: 'light' as const,
          autoStartBreaks: false,
          autoStartPomodoros: false
        },
        updateSettings: jest.fn()
      } as any);
      
      rerender(<WeeklyStatsComponent />);
      
      // 验证数据更新后的渲染
      await waitFor(() => {
        expect(screen.getByText('14小时10分钟')).toBeInTheDocument(); // 675 + 175 = 850分钟
      });
    });
  });
});
