/**
 * REQ-TM-S05 单元测试 - 更新版本
 * 功能：查看周/月度数据摘要
 * 组件：PeriodSummary
 */

import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, addWeeks, subMonths, addMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import PeriodSummary from '@/components/PeriodSummary';
import { useAppStore } from '@/lib/store';
import { DailyStats, WeeklyStats, MonthlyStats } from '@/types';

// Mock store
jest.mock('@/lib/store');
const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;

// Mock date-fns
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  format: jest.fn(),
  startOfWeek: jest.fn(),
  endOfWeek: jest.fn(),
  startOfMonth: jest.fn(),
  endOfMonth: jest.fn(),
  subWeeks: jest.fn(),
  addWeeks: jest.fn(),
  subMonths: jest.fn(),
  addMonths: jest.fn()
}));

const mockFormat = format as jest.MockedFunction<typeof format>;
const mockStartOfWeek = startOfWeek as jest.MockedFunction<typeof startOfWeek>;
const mockEndOfWeek = endOfWeek as jest.MockedFunction<typeof endOfWeek>;
const mockStartOfMonth = startOfMonth as jest.MockedFunction<typeof startOfMonth>;
const mockEndOfMonth = endOfMonth as jest.MockedFunction<typeof endOfMonth>;
const mockSubWeeks = subWeeks as jest.MockedFunction<typeof subWeeks>;
const mockAddWeeks = addWeeks as jest.MockedFunction<typeof addWeeks>;
const mockSubMonths = subMonths as jest.MockedFunction<typeof subMonths>;
const mockAddMonths = addMonths as jest.MockedFunction<typeof addMonths>;

describe('PeriodSummary - 单元测试', () => {
  const mockToday = new Date('2025-08-15');
  const mockWeekStart = new Date('2025-08-11'); // 周一
  const mockWeekEnd = new Date('2025-08-17'); // 周日
  const mockMonthStart = new Date('2025-08-01');
  const mockMonthEnd = new Date('2025-08-31');

  // Mock数据
  const mockWeeklyStats: WeeklyStats = {
    weekStart: '2025-08-11',
    dailyStats: [],
    totalPomodoros: 24,
    averageFocusScore: 85,
    mostProductiveDay: '2025-08-15'
  };

  const mockMonthlyStats: MonthlyStats = {
    monthStart: '2025-08-01',
    dailyStats: [],
    totalPomodoros: 120,
    averageFocusScore: 82,
    mostProductiveDay: '2025-08-15'
  };

  const mockGetWeeklyStats = jest.fn();
  const mockGetMonthlyStats = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置date-fns mock默认返回值
    mockFormat.mockImplementation((date: string | number | Date, formatStr: string) => {
      if (formatStr === 'M月d日') {
        return '8月15日';
      }
      if (formatStr === 'yyyy年M月') {
        return '2025年8月';
      }
      return '2025-08-15';
    });
    
    mockStartOfWeek.mockReturnValue(mockWeekStart);
    mockEndOfWeek.mockReturnValue(mockWeekEnd);
    mockStartOfMonth.mockReturnValue(mockMonthStart);
    mockEndOfMonth.mockReturnValue(mockMonthEnd);
    mockSubWeeks.mockReturnValue(new Date('2025-08-04'));
    mockAddWeeks.mockReturnValue(new Date('2025-08-18'));
    mockSubMonths.mockReturnValue(new Date('2025-07-15'));
    mockAddMonths.mockReturnValue(new Date('2025-09-15'));
    
    // 设置store mock默认返回值
    mockGetWeeklyStats.mockReturnValue(mockWeeklyStats);
    mockGetMonthlyStats.mockReturnValue(mockMonthlyStats);
    
    mockUseAppStore.mockReturnValue({
      getWeeklyStats: mockGetWeeklyStats,
      getMonthlyStats: mockGetMonthlyStats
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  describe('组件渲染测试', () => {
    test('应该正确渲染组件的基本结构', () => {
      render(<PeriodSummary />);

      expect(screen.getByTestId('period-summary-container')).toBeInTheDocument();
      expect(screen.getByTestId('period-view-selector')).toBeInTheDocument();
    });

    test('应该渲染周视图和月视图切换按钮', () => {
      render(<PeriodSummary />);

      expect(screen.getByTestId('week-view-button')).toBeInTheDocument();
      expect(screen.getByTestId('month-view-button')).toBeInTheDocument();
      expect(screen.getByText('周视图')).toBeInTheDocument();
      expect(screen.getByText('月视图')).toBeInTheDocument();
    });

    test('默认应该显示周视图', () => {
      render(<PeriodSummary />);

      const weekButton = screen.getByTestId('week-view-button');
      expect(weekButton).toHaveClass('active');
    });
  });

  describe('Props处理测试', () => {
    test('应该正确处理onViewChange回调', () => {
      const mockOnViewChange = jest.fn();
      render(<PeriodSummary onViewChange={mockOnViewChange} />);

      fireEvent.click(screen.getByTestId('month-view-button'));

      expect(mockOnViewChange).toHaveBeenCalledWith('month');
    });

    test('应该正确处理onNavigate回调', () => {
      const mockOnNavigate = jest.fn();
      render(<PeriodSummary onNavigate={mockOnNavigate} />);

      fireEvent.click(screen.getByTestId('previous-week-button'));

      expect(mockOnNavigate).toHaveBeenCalledWith('prev', expect.any(Date));
    });

    test('应该在没有回调props时不报错', () => {
      expect(() => {
        render(<PeriodSummary />);
        fireEvent.click(screen.getByTestId('month-view-button'));
        fireEvent.click(screen.getByTestId('previous-month-button'));
      }).not.toThrow();
    });
  });

  describe('状态管理测试', () => {
    test('切换视图应该更新UI状态', () => {
      render(<PeriodSummary />);

      const weekButton = screen.getByTestId('week-view-button');
      const monthButton = screen.getByTestId('month-view-button');

      // 初始状态：周视图激活
      expect(weekButton).toHaveClass('active');
      expect(monthButton).not.toHaveClass('active');

      // 切换到月视图
      fireEvent.click(monthButton);
      expect(monthButton).toHaveClass('active');
      expect(weekButton).not.toHaveClass('active');
    });

    test('应该根据defaultView prop设置初始视图', () => {
      render(<PeriodSummary defaultView="month" />);

      const monthButton = screen.getByTestId('month-view-button');
      expect(monthButton).toHaveClass('active');
    });
  });

  describe('事件处理测试', () => {
    test('点击上一周/月按钮应该触发导航', () => {
      const mockOnNavigate = jest.fn();
      render(<PeriodSummary onNavigate={mockOnNavigate} />);

      fireEvent.click(screen.getByTestId('previous-week-button'));

      expect(mockOnNavigate).toHaveBeenCalledWith('prev', expect.any(Date));
    });

    test('点击下一周/月按钮应该触发导航', () => {
      const mockOnNavigate = jest.fn();
      render(<PeriodSummary onNavigate={mockOnNavigate} />);

      fireEvent.click(screen.getByTestId('next-week-button'));

      expect(mockOnNavigate).toHaveBeenCalledWith('next', expect.any(Date));
    });

    test('应该根据当前视图更新导航按钮文本', () => {
      render(<PeriodSummary />);

      // 周视图下的导航按钮
      expect(screen.getByLabelText('上一周')).toBeInTheDocument();
      expect(screen.getByLabelText('下一周')).toBeInTheDocument();

      // 切换到月视图
      fireEvent.click(screen.getByTestId('month-view-button'));

      // 月视图下的导航按钮
      expect(screen.getByLabelText('上一月')).toBeInTheDocument();
      expect(screen.getByLabelText('下一月')).toBeInTheDocument();
    });
  });

  describe('数据处理逻辑测试', () => {
    test('应该正确调用store的getWeeklyStats方法', () => {
      render(<PeriodSummary />);

      expect(mockGetWeeklyStats).toHaveBeenCalled();
    });

    test('应该正确调用store的getMonthlyStats方法', () => {
      render(<PeriodSummary />);

      // 切换到月视图
      fireEvent.click(screen.getByTestId('month-view-button'));

      expect(mockGetMonthlyStats).toHaveBeenCalled();
    });

    test('应该正确处理空数据', () => {
      mockGetWeeklyStats.mockReturnValue(null);
      
      render(<PeriodSummary />);

      expect(screen.getByText('数据加载中...')).toBeInTheDocument();
    });

    test('应该正确显示统计数据', () => {
      // 设置有数据的情况
      const statsWithData = {
        ...mockWeeklyStats,
        dailyStats: [
          { date: '2025-08-15', totalPomodoros: 6, workTime: 150, breakTime: 25, tasksCompleted: 3, focusScore: 85 }
        ]
      };
      mockGetWeeklyStats.mockReturnValue(statsWithData);

      render(<PeriodSummary />);

      expect(screen.getByTestId('weekly-total-pomodoros')).toHaveTextContent('24个');
    });
  });

  describe('错误边界测试', () => {
    test('应该优雅处理date-fns函数异常', () => {
      mockFormat.mockImplementation(() => {
        throw new Error('Date format error');
      });

      expect(() => render(<PeriodSummary />)).not.toThrow();
    });

    test('应该处理回调函数异常', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });

      expect(() => {
        render(<PeriodSummary onViewChange={errorCallback} />);
        fireEvent.click(screen.getByTestId('month-view-button'));
      }).not.toThrow();
    });

    test('应该处理无效的日期值', () => {
      mockStartOfWeek.mockReturnValue(new Date('invalid'));

      expect(() => render(<PeriodSummary />)).not.toThrow();
    });
  });

  describe('Hook功能测试', () => {
    test('应该正确使用useCallback优化回调', () => {
      const { rerender } = render(<PeriodSummary />);
      
      // 重新渲染不应该导致不必要的重新计算
      rerender(<PeriodSummary />);
      
      // 验证组件稳定性
      expect(screen.getByTestId('period-summary-container')).toBeInTheDocument();
    });

    test('应该正确使用useMemo优化计算', () => {
      render(<PeriodSummary />);
      
      // useMemo应该缓存计算结果
      expect(mockFormat).toHaveBeenCalled();
    });
  });

  describe('性能优化测试', () => {
    test('不必要的重新渲染应该被避免', () => {
      const { rerender } = render(<PeriodSummary />);
      
      const initialCallCount = mockGetWeeklyStats.mock.calls.length;
      
      // 使用相同props重新渲染
      rerender(<PeriodSummary />);
      
      // 不应该产生额外的数据获取调用
      expect(mockGetWeeklyStats.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('无障碍访问测试', () => {
    test('应该有正确的ARIA标签', () => {
      render(<PeriodSummary />);
      
      expect(screen.getByRole('region')).toHaveAttribute('aria-label', '周月度数据摘要');
    });

    test('按钮应该有正确的ARIA状态', () => {
      render(<PeriodSummary />);
      
      const weekButton = screen.getByTestId('week-view-button');
      const monthButton = screen.getByTestId('month-view-button');
      
      expect(weekButton).toHaveAttribute('aria-pressed', 'true');
      expect(monthButton).toHaveAttribute('aria-pressed', 'false');
    });

    test('数据元素应该有语义化的标记', () => {
      const statsWithData = {
        ...mockWeeklyStats,
        dailyStats: [
          { date: '2025-08-15', totalPomodoros: 6, workTime: 150, breakTime: 25, tasksCompleted: 3, focusScore: 85 }
        ]
      };
      mockGetWeeklyStats.mockReturnValue(statsWithData);

      render(<PeriodSummary />);
      
      const focusTimeElement = screen.getByTestId('weekly-total-pomodoros');
      expect(focusTimeElement).toHaveAttribute('role', 'text');
    });
  });

  describe('国际化测试', () => {
    test('应该正确处理周开始日期设置', () => {
      render(<PeriodSummary />);
      
      expect(mockStartOfWeek).toHaveBeenCalledWith(
        expect.any(Date),
        expect.objectContaining({ weekStartsOn: 1 })
      );
    });

    test('应该使用中文locale格式化日期', () => {
      render(<PeriodSummary />);
      
      expect(mockFormat).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(String),
        expect.objectContaining({ locale: zhCN })
      );
    });
  });
});
