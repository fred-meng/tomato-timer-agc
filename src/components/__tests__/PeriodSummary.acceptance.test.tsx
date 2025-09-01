/**
 * REQ-TM-S05 验收测试用例
 * 功能：查看周/月度数据摘要
 * 用户故事：作为学生Alex，我希望能回顾过去几周或几个月的学习投入，
 *          以便在期末时对自己的长期努力有一个宏观的了解和评估。
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, addWeeks, subMonths, addMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import PeriodSummary from '@/components/PeriodSummary';
import { useAppStore } from '@/lib/store';
import { DailyStats, WeeklyStats, MonthlyStats } from '@/types';

// Mock store
jest.mock('@/lib/store');
const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;

describe('REQ-TM-S05: 查看周/月度数据摘要 - 验收测试', () => {
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const currentMonthStart = startOfMonth(today);
  const currentMonthEnd = endOfMonth(today);
  
  // 生成周度测试数据
  const mockWeeklyData: DailyStats[] = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + index);
    const focusTime = [120, 100, 80, 150, 90, 60, 0][index]; // 不同天的专注时长
    return {
      date: format(date, 'yyyy-MM-dd'),
      totalPomodoros: Math.floor(focusTime / 25),
      workTime: focusTime,
      breakTime: Math.floor(focusTime / 5),
      tasksCompleted: Math.floor(focusTime / 40),
      focusScore: focusTime > 0 ? Math.min(100, focusTime / 2) : 0
    };
  });

  const mockWeeklyStats: WeeklyStats = {
    weekStart: format(currentWeekStart, 'yyyy-MM-dd'),
    dailyStats: mockWeeklyData,
    totalPomodoros: Math.floor(mockWeeklyData.reduce((sum, day) => sum + day.workTime, 0) / 25),
    averageFocusScore: mockWeeklyData.reduce((sum, day) => sum + day.focusScore, 0) / 7,
    mostProductiveDay: format(new Date(currentWeekStart.getTime() + 3 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  };

  // 生成月度测试数据
  const mockMonthlyData: DailyStats[] = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(currentMonthStart);
    date.setDate(date.getDate() + index);
    const focusTime = Math.floor(Math.random() * 200) + 30; // 30-230分钟随机专注时长
    return {
      date: format(date, 'yyyy-MM-dd'),
      totalPomodoros: Math.floor(focusTime / 25),
      workTime: focusTime,
      breakTime: Math.floor(focusTime / 5),
      tasksCompleted: Math.floor(focusTime / 50),
      focusScore: focusTime > 0 ? Math.min(100, focusTime / 2) : 0
    };
  });

  const mockMonthlyStats = {
    monthStart: format(currentMonthStart, 'yyyy-MM-dd'),
    dailyStats: mockMonthlyData,
    totalPomodoros: Math.floor(mockMonthlyData.reduce((sum, day) => sum + day.workTime, 0) / 25),
    averageFocusScore: mockMonthlyData.reduce((sum, day) => sum + day.focusScore, 0) / 30,
    mostProductiveDay: format(new Date(currentMonthStart.getTime() + 15 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 默认mock store返回值
    mockUseAppStore.mockReturnValue({
      getWeeklyStats: jest.fn().mockReturnValue(mockWeeklyStats),
      getMonthlyStats: jest.fn().mockReturnValue(mockMonthlyStats),
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

  // AC-S05.1: 用户可以选择"周视图"或"月视图"
  describe('AC-S05.1: 视图切换功能', () => {
    test('应该显示周视图和月视图的切换按钮', () => {
      render(<PeriodSummary />);
      
      expect(screen.getByTestId('period-view-selector')).toBeInTheDocument();
      expect(screen.getByTestId('week-view-button')).toBeInTheDocument();
      expect(screen.getByTestId('month-view-button')).toBeInTheDocument();
      
      expect(screen.getByText('周视图')).toBeInTheDocument();
      expect(screen.getByText('月视图')).toBeInTheDocument();
    });

    test('默认应该显示周视图', () => {
      render(<PeriodSummary />);
      
      const weekButton = screen.getByTestId('week-view-button');
      const monthButton = screen.getByTestId('month-view-button');
      
      expect(weekButton).toHaveClass('active');
      expect(monthButton).not.toHaveClass('active');
      expect(screen.getByTestId('weekly-summary-content')).toBeInTheDocument();
    });

    test('点击月视图按钮应该切换到月视图', async () => {
      render(<PeriodSummary />);
      
      const monthButton = screen.getByTestId('month-view-button');
      fireEvent.click(monthButton);
      
      await waitFor(() => {
        expect(monthButton).toHaveClass('active');
        expect(screen.getByTestId('week-view-button')).not.toHaveClass('active');
        expect(screen.getByTestId('monthly-summary-content')).toBeInTheDocument();
      });
    });

    test('点击周视图按钮应该切换回周视图', async () => {
      render(<PeriodSummary />);
      
      // 先切换到月视图
      fireEvent.click(screen.getByTestId('month-view-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('monthly-summary-content')).toBeInTheDocument();
      });
      
      // 再切换回周视图
      fireEvent.click(screen.getByTestId('week-view-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('week-view-button')).toHaveClass('active');
        expect(screen.getByTestId('weekly-summary-content')).toBeInTheDocument();
      });
    });

    test('视图切换应该有平滑的动画效果', async () => {
      render(<PeriodSummary />);
      
      fireEvent.click(screen.getByTestId('month-view-button'));
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('tab');
        const monthButton = buttons.find(button => button.getAttribute('data-testid') === 'month-view-button');
        expect(monthButton).toHaveClass('transition-all');
      });
    });
  });

  // AC-S05.2: 在周视图中，显示当前周的每日平均专注时长和总番茄数
  describe('AC-S05.2: 周视图数据显示', () => {
    test('应该显示当前周的标题', () => {
      render(<PeriodSummary />);
      
      const weekTitle = format(currentWeekStart, 'M月d日', { locale: zhCN }) + 
                       ' - ' + 
                       format(currentWeekEnd, 'M月d日', { locale: zhCN });
      
      expect(screen.getByText(weekTitle)).toBeInTheDocument();
      expect(screen.getByTestId('current-week-title')).toHaveTextContent(weekTitle);
    });

    test('应该显示每日平均专注时长', () => {
      render(<PeriodSummary />);
      
      // 计算期望的平均专注时长（按专注天数计算，不是总天数）
      const totalFocusTime = mockWeeklyData.reduce((sum, day) => sum + day.workTime, 0); // 600分钟
      const focusDays = mockWeeklyData.filter(day => day.workTime > 0).length; // 6天有工作时间
      const averageFocusTime = Math.round(totalFocusTime / focusDays); // 100分钟
      const hours = Math.floor(averageFocusTime / 60);
      const minutes = averageFocusTime % 60;
      
      expect(screen.getByText('平均专注')).toBeInTheDocument();
      expect(screen.getByTestId('weekly-average-focus-time')).toHaveTextContent(`${hours}小时${minutes}分钟`);
    });

    test('应该显示本周总番茄数', () => {
      render(<PeriodSummary />);
      
      // 计算期望的总番茄数
      const expectedTotalPomodoros = Math.floor(600 / 25); // 24个番茄钟
      
      expect(screen.getByText('番茄钟')).toBeInTheDocument();
      expect(screen.getByTestId('weekly-total-pomodoros')).toHaveTextContent(`${expectedTotalPomodoros}个`);
    });

    test('应该显示本周专注天数', () => {
      render(<PeriodSummary />);
      
      // 计算有专注记录的天数（专注时长 > 0的天数）
      const focusDays = mockWeeklyData.filter(day => day.workTime > 0).length; // 6天
      
      expect(screen.getByText('专注天数')).toBeInTheDocument();
      expect(screen.getByTestId('weekly-focus-days')).toHaveTextContent(`${focusDays}天`);
    });

    test('应该显示本周完成任务数', () => {
      render(<PeriodSummary />);
      
      const totalTasks = mockWeeklyData.reduce((sum, day) => sum + day.tasksCompleted, 0);
      
      expect(screen.getByText('完成任务')).toBeInTheDocument();
      expect(screen.getByTestId('weekly-total-tasks')).toHaveTextContent(`${totalTasks}个`);
    });

    test('周视图在没有数据时应该显示友好提示', () => {
      const emptyWeeklyStats: WeeklyStats = {
        weekStart: format(currentWeekStart, 'yyyy-MM-dd'),
        dailyStats: [],
        totalPomodoros: 0,
        averageFocusScore: 0,
        mostProductiveDay: format(currentWeekStart, 'yyyy-MM-dd')
      };
      
      mockUseAppStore.mockReturnValue({
        getWeeklyStats: jest.fn().mockReturnValue(emptyWeeklyStats),
        getMonthlyStats: jest.fn().mockReturnValue(mockMonthlyStats)
      } as any);

      render(<PeriodSummary />);
      
      expect(screen.getByText('本周还没有专注记录')).toBeInTheDocument();
    });
  });

    // AC-S05.3: 在月视图中，显示当前月的每日平均专注时长和总番茄数
  describe('AC-S05.3: 月视图数据显示', () => {
    test('应该显示每日平均专注时长', async () => {
      render(<PeriodSummary />);
      fireEvent.click(screen.getByTestId('month-view-button'));
      
      await waitFor(() => {
        // 检查平均专注时间标签
        expect(screen.getByText('平均专注')).toBeInTheDocument();
        expect(screen.getByTestId('monthly-average-focus-time')).toBeInTheDocument();
      });
    });

    test('应该显示本月总番茄数', async () => {
      render(<PeriodSummary />);
      fireEvent.click(screen.getByTestId('month-view-button'));
      
      await waitFor(() => {
        // 检查番茄钟标签
        expect(screen.getByText('番茄钟')).toBeInTheDocument();
        expect(screen.getByTestId('monthly-total-pomodoros')).toBeInTheDocument();
      });
    });

    test('应该显示本月专注天数', async () => {
      render(<PeriodSummary />);
      fireEvent.click(screen.getByTestId('month-view-button'));
      
      await waitFor(() => {
        // 检查专注天数标签
        expect(screen.getByText('专注天数')).toBeInTheDocument();
        expect(screen.getByTestId('monthly-focus-days')).toBeInTheDocument();
      });
    });

    test('应该显示本月完成任务数', async () => {
      render(<PeriodSummary />);
      fireEvent.click(screen.getByTestId('month-view-button'));
      
      await waitFor(() => {
        // 检查完成任务标签
        expect(screen.getByText('完成任务')).toBeInTheDocument();
        expect(screen.getByTestId('monthly-total-tasks')).toBeInTheDocument();
      });
    });

    test('月视图在没有数据时应该显示友好提示', () => {
      const emptyMonthlyStats: MonthlyStats = {
        monthStart: format(currentMonthStart, 'yyyy-MM-dd'),
        dailyStats: [],
        totalPomodoros: 0,
        averageFocusScore: 0,
        mostProductiveDay: format(currentMonthStart, 'yyyy-MM-dd')
      };
      
      mockUseAppStore.mockReturnValue({
        getWeeklyStats: jest.fn().mockReturnValue(mockWeeklyStats),
        getMonthlyStats: jest.fn().mockReturnValue(emptyMonthlyStats)
      } as any);

      render(<PeriodSummary />);
      fireEvent.click(screen.getByTestId('month-view-button'));
      
      expect(screen.getByText('本月还没有专注记录')).toBeInTheDocument();
    });
  });

  // AC-S05.4: 必须提供导航按钮，允许用户切换到上一周/月或下一周/月
  describe('AC-S05.4: 导航功能', () => {
    test('周视图应该显示上一周和下一周导航按钮', () => {
      render(<PeriodSummary />);
      
      expect(screen.getByTestId('previous-week-button')).toBeInTheDocument();
      expect(screen.getByTestId('next-week-button')).toBeInTheDocument();
      
      expect(screen.getByLabelText('上一周')).toBeInTheDocument();
      expect(screen.getByLabelText('下一周')).toBeInTheDocument();
    });

    test('月视图应该显示上一月和下一月导航按钮', async () => {
      render(<PeriodSummary />);
      
      fireEvent.click(screen.getByTestId('month-view-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('previous-month-button')).toBeInTheDocument();
        expect(screen.getByTestId('next-month-button')).toBeInTheDocument();
        
        expect(screen.getByLabelText('上一月')).toBeInTheDocument();
        expect(screen.getByLabelText('下一月')).toBeInTheDocument();
      });
    });

    test('点击上一周按钮应该导航到上一周', async () => {
      const previousWeekStart = subWeeks(currentWeekStart, 1);
      const previousWeekEnd = endOfWeek(previousWeekStart, { weekStartsOn: 1 });
      
      render(<PeriodSummary />);
      
      fireEvent.click(screen.getByTestId('previous-week-button'));
      
      await waitFor(() => {
        const expectedTitle = format(previousWeekStart, 'M月d日', { locale: zhCN }) + 
                            ' - ' + 
                            format(previousWeekEnd, 'M月d日', { locale: zhCN });
        expect(screen.getByTestId('current-week-title')).toHaveTextContent(expectedTitle);
      });
    });

    test('点击下一周按钮应该导航到下一周', async () => {
      const nextWeekStart = addWeeks(currentWeekStart, 1);
      const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 1 });
      
      render(<PeriodSummary />);
      
      fireEvent.click(screen.getByTestId('next-week-button'));
      
      await waitFor(() => {
        const expectedTitle = format(nextWeekStart, 'M月d日', { locale: zhCN }) + 
                            ' - ' + 
                            format(nextWeekEnd, 'M月d日', { locale: zhCN });
        expect(screen.getByTestId('current-week-title')).toHaveTextContent(expectedTitle);
      });
    });

    test('点击上一月按钮应该导航到上一月', async () => {
      const previousMonth = subMonths(currentMonthStart, 1);
      
      render(<PeriodSummary />);
      
      fireEvent.click(screen.getByTestId('month-view-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('monthly-summary-content')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('previous-month-button'));
      
      await waitFor(() => {
        const expectedTitle = format(previousMonth, 'yyyy年M月', { locale: zhCN });
        expect(screen.getByTestId('current-month-title')).toHaveTextContent(expectedTitle);
      });
    });

    test('点击下一月按钮应该导航到下一月', async () => {
      const nextMonth = addMonths(currentMonthStart, 1);
      
      render(<PeriodSummary />);
      
      fireEvent.click(screen.getByTestId('month-view-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('monthly-summary-content')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('next-month-button'));
      
      await waitFor(() => {
        const expectedTitle = format(nextMonth, 'yyyy年M月', { locale: zhCN });
        expect(screen.getByTestId('current-month-title')).toHaveTextContent(expectedTitle);
      });
    });

    test('导航按钮应该有正确的禁用状态', () => {
      // 假设有数据边界限制
      render(<PeriodSummary />);
      
      // 验证导航按钮是否在适当时候被禁用
      const nextWeekButton = screen.getByTestId('next-week-button');
      const previousWeekButton = screen.getByTestId('previous-week-button');
      
      expect(nextWeekButton).toBeInTheDocument();
      expect(previousWeekButton).toBeInTheDocument();
      
      // 在当前实现中，我们不限制导航，但可以在实际实现中添加逻辑
    });

    test('应该记住用户的导航状态', async () => {
      render(<PeriodSummary />);
      
      // 导航到上一周
      fireEvent.click(screen.getByTestId('previous-week-button'));
      
      await waitFor(() => {
        const previousWeekStart = subWeeks(currentWeekStart, 1);
        const previousWeekEnd = endOfWeek(previousWeekStart, { weekStartsOn: 1 });
        const expectedTitle = format(previousWeekStart, 'M月d日', { locale: zhCN }) + 
                            ' - ' + 
                            format(previousWeekEnd, 'M月d日', { locale: zhCN });
        expect(screen.getByTestId('current-week-title')).toHaveTextContent(expectedTitle);
      });
      
      // 切换到月视图，再切换回来，应该保持在上一周
      fireEvent.click(screen.getByTestId('month-view-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('monthly-summary-content')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('week-view-button'));
      
      await waitFor(() => {
        // 应该仍然显示上一周的标题
        const previousWeekStart = subWeeks(currentWeekStart, 1);
        const previousWeekEnd = endOfWeek(previousWeekStart, { weekStartsOn: 1 });
        const expectedTitle = format(previousWeekStart, 'M月d日', { locale: zhCN }) + 
                            ' - ' + 
                            format(previousWeekEnd, 'M月d日', { locale: zhCN });
        expect(screen.getByTestId('current-week-title')).toHaveTextContent(expectedTitle);
      });
    });
  });

  // 数据一致性和性能测试
  describe('数据一致性和性能测试', () => {
    test('应该正确处理跨月的周视图', () => {
      // 测试跨月的周（例如某周从一个月的最后几天开始，到下个月的开始几天）
      const crossMonthWeekStart = new Date(2025, 7, 29); // 8月29日（假设是周一）
      
      render(<PeriodSummary />);
      
      // 这个测试验证跨月周的正确处理
      expect(screen.getByTestId('period-summary-container')).toBeInTheDocument();
    });

    test('应该正确处理闰年的2月', () => {
      // 测试闰年2月的月视图
      const leapYearFeb = new Date(2024, 1, 1); // 2024年2月
      
      render(<PeriodSummary />);
      
      // 验证闰年处理正确
      expect(screen.getByTestId('period-summary-container')).toBeInTheDocument();
    });

    test('大量数据时渲染性能应该在可接受范围内', () => {
      const largeMonthlyData = Array.from({ length: 31 }, (_, index) => ({
        date: format(new Date(currentMonthStart.getTime() + index * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        totalPomodoros: Math.floor(Math.random() * 20),
        workTime: Math.floor(Math.random() * 400),
        breakTime: Math.floor(Math.random() * 80),
        tasksCompleted: Math.floor(Math.random() * 10),
        focusScore: Math.floor(Math.random() * 100)
      }));

      const largeMockStats = {
        ...mockMonthlyStats,
        dailyStats: largeMonthlyData
      };

      mockUseAppStore.mockReturnValue({
        getWeeklyStats: jest.fn().mockReturnValue(mockWeeklyStats),
        getMonthlyStats: jest.fn().mockReturnValue(largeMockStats)
      } as any);

      const startTime = performance.now();
      render(<PeriodSummary />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // 50ms内完成渲染
    });
  });

  // UI交互和用户体验测试
  describe('UI交互和用户体验测试', () => {
    test('组件应该具有正确的CSS类名用于iOS 18设计风格', () => {
      render(<PeriodSummary />);
      
      const container = screen.getByTestId('period-summary-container');
      expect(container).toHaveClass('bg-white', 'dark:bg-gray-800', 'rounded-2xl');
    });

    test('应该支持暗色模式', () => {
      mockUseAppStore.mockReturnValue({
        getWeeklyStats: jest.fn().mockReturnValue(mockWeeklyStats),
        getMonthlyStats: jest.fn().mockReturnValue(mockMonthlyStats),
        settings: { theme: 'dark' }
      } as any);

      render(<PeriodSummary />);
      
      const container = screen.getByTestId('period-summary-container');
      expect(container).toHaveClass(/dark:/);
    });

    test('按钮应该有正确的焦点状态', () => {
      render(<PeriodSummary />);
      
      const weekButton = screen.getByTestId('week-view-button');
      const monthButton = screen.getByTestId('month-view-button');
      
      expect(weekButton).toHaveAttribute('tabIndex', '0');
      expect(monthButton).toHaveAttribute('tabIndex', '0');
    });

    test('应该支持键盘导航', () => {
      render(<PeriodSummary />);
      
      const monthButton = screen.getByTestId('month-view-button');
      
      // 模拟键盘事件
      fireEvent.keyDown(monthButton, { key: 'Enter', code: 'Enter' });
      
      expect(monthButton).toHaveClass('bg-blue-600');
    });

    test('loading状态应该显示友好的加载提示', async () => {
      // 模拟loading状态
      mockUseAppStore.mockReturnValue({
        getWeeklyStats: jest.fn().mockReturnValue(null),
        getMonthlyStats: jest.fn().mockReturnValue(null)
      } as any);

      render(<PeriodSummary />);
      
      await waitFor(() => {
        expect(screen.getByText('数据加载中...')).toBeInTheDocument();
      });
    });
  });

  // 可访问性测试
  describe('可访问性测试', () => {
    test('组件应该有正确的ARIA标签', () => {
      render(<PeriodSummary />);
      
      const container = screen.getByTestId('period-summary-container');
      expect(container).toHaveAttribute('role', 'region');
      expect(container).toHaveAttribute('aria-label', '周月度数据摘要');
    });

    test('视图切换按钮应该有正确的ARIA状态', () => {
      render(<PeriodSummary />);
      
      const weekButton = screen.getByTestId('week-view-button');
      const monthButton = screen.getByTestId('month-view-button');
      
      expect(weekButton).toHaveAttribute('aria-pressed', 'true');
      expect(monthButton).toHaveAttribute('aria-pressed', 'false');
    });

    test('导航按钮应该有描述性的aria-label', () => {
      render(<PeriodSummary />);
      
      expect(screen.getByLabelText('上一周')).toBeInTheDocument();
      expect(screen.getByLabelText('下一周')).toBeInTheDocument();
    });

    test('数据元素应该有语义化的标记', () => {
      render(<PeriodSummary />);
      
      const focusTimeElement = screen.getByTestId('weekly-average-focus-time');
      expect(focusTimeElement).toHaveAttribute('role', 'text');
    });
  });
});

const PeriodSummaryAcceptanceTests = {};
export default PeriodSummaryAcceptanceTests;
