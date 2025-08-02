/**
 * REQ-TM-S03: DailyFocusDistribution 组件单元测试
 * 
 * 测试策略：
 * 1. 组件渲染测试
 * 2. Props 处理测试
 * 3. 状态管理测试
 * 4. 事件处理测试
 * 5. 数据转换测试
 * 6. Hook 集成测试
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { format } from 'date-fns';
import { DailyFocusDistribution } from '../DailyFocusDistribution';

// Mock function
const mockGetHourlyFocusDistribution = jest.fn();

// Mock the stats calculator module
jest.mock('../../lib/statsCalculator', () => ({
  getHourlyFocusDistribution: mockGetHourlyFocusDistribution
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('DailyFocusDistribution 单元测试', () => {
  // Test data
  const mockHourlyData = {
    9: 50,
    10: 25,
    14: 100,
    15: 75,
    16: 30,
    20: 45
  };

  const emptyHourlyData = {};

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetHourlyFocusDistribution.mockResolvedValue(mockHourlyData);
  });

  describe('组件初始化和渲染', () => {
    it('应该正确渲染组件的基本结构', () => {
      render(<MockDailyFocusDistribution />);
      
      expect(screen.getByTestId('daily-focus-distribution')).toBeInTheDocument();
      expect(screen.getByTestId('date-picker')).toBeInTheDocument();
    });

    it('应该使用今天作为默认日期', () => {
      render(<MockDailyFocusDistribution />);
      
      const datePicker = screen.getByTestId('date-picker') as HTMLInputElement;
      const today = format(new Date(), 'yyyy-MM-dd');
      expect(datePicker.value).toBe(today);
    });

    it('应该在初始化时调用数据获取函数', async () => {
      render(<MockDailyFocusDistribution />);
      
      const today = format(new Date(), 'yyyy-MM-dd');
      await waitFor(() => {
        expect(mockGetHourlyFocusDistribution).toHaveBeenCalledWith(today);
      });
    });

    it('应该正确设置组件的可访问性属性', () => {
      render(<MockDailyFocusDistribution />);
      
      const component = screen.getByTestId('daily-focus-distribution');
      expect(component).toHaveAttribute('role', 'region');
      expect(component).toHaveAttribute('aria-label', expect.stringContaining('专注时长分布'));
    });
  });

  describe('Props 处理', () => {
    it('应该接受并使用 initialDate prop', () => {
      const initialDate = '2024-07-15';
      render(<MockDailyFocusDistribution initialDate={initialDate} />);
      
      const datePicker = screen.getByTestId('date-picker') as HTMLInputElement;
      expect(datePicker.value).toBe(initialDate);
    });

    it('应该接受并使用 className prop', () => {
      const customClass = 'custom-distribution';
      render(<MockDailyFocusDistribution className={customClass} />);
      
      const component = screen.getByTestId('daily-focus-distribution');
      expect(component).toHaveClass(customClass);
    });

    it('应该在 initialDate 变化时更新数据', async () => {
      const { rerender } = render(<MockDailyFocusDistribution initialDate="2024-07-15" />);
      
      await waitFor(() => {
        expect(mockGetHourlyFocusDistribution).toHaveBeenCalledWith('2024-07-15');
      });

      rerender(<MockDailyFocusDistribution initialDate="2024-07-16" />);
      
      await waitFor(() => {
        expect(mockGetHourlyFocusDistribution).toHaveBeenCalledWith('2024-07-16');
      });
    });
  });

  describe('状态管理', () => {
    it('应该正确管理加载状态', async () => {
      // 模拟延迟响应
      mockGetHourlyFocusDistribution.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockHourlyData), 100))
      );

      render(<MockDailyFocusDistribution />);
      
      // 初始状态应该显示加载
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
      
      // 等待加载完成
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });
    });

    it('应该正确管理错误状态', async () => {
      const errorMessage = 'Failed to fetch data';
      mockGetHourlyFocusDistribution.mockRejectedValue(new Error(errorMessage));

      render(<MockDailyFocusDistribution />);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByTestId('error-message')).toHaveTextContent(/获取数据失败/);
      });
    });

    it('应该正确管理空数据状态', async () => {
      mockGetHourlyFocusDistribution.mockResolvedValue(emptyHourlyData);

      render(<MockDailyFocusDistribution />);
      
      await waitFor(() => {
        expect(screen.getByTestId('empty-data-state')).toBeInTheDocument();
        expect(screen.getByTestId('empty-data-state')).toHaveTextContent(/暂无数据/);
      });
    });

    it('应该正确管理当前选中的日期状态', async () => {
      render(<MockDailyFocusDistribution />);
      
      const datePicker = screen.getByTestId('date-picker') as HTMLInputElement;
      const newDate = '2024-07-20';
      
      fireEvent.change(datePicker, { target: { value: newDate } });
      
      await waitFor(() => {
        expect(datePicker.value).toBe(newDate);
        expect(screen.getByTestId('current-date-display')).toHaveTextContent(newDate);
      });
    });
  });

  describe('事件处理', () => {
    it('应该正确处理日期变更事件', async () => {
      render(<MockDailyFocusDistribution />);
      
      const datePicker = screen.getByTestId('date-picker');
      const newDate = '2024-07-20';
      
      fireEvent.change(datePicker, { target: { value: newDate } });
      
      await waitFor(() => {
        expect(mockGetHourlyFocusDistribution).toHaveBeenCalledWith(newDate);
      });
    });

    it('应该正确处理键盘导航', async () => {
      render(<MockDailyFocusDistribution />);
      
      const datePicker = screen.getByTestId('date-picker');
      
      // 测试 Tab 键导航
      datePicker.focus();
      expect(document.activeElement).toBe(datePicker);
      
      // 测试 Enter 键
      fireEvent.keyDown(datePicker, { key: 'Enter', code: 'Enter' });
      expect(datePicker).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('数据转换和处理', () => {
    it('应该正确转换24小时数据格式', async () => {
      render(<MockDailyFocusDistribution />);
      
      await waitFor(() => {
        // 检查所有24小时都被正确渲染
        for (let hour = 0; hour < 24; hour++) {
          const hourElement = screen.getByTestId(`hour-${hour}`);
          expect(hourElement).toBeInTheDocument();
        }
      });
    });

    it('应该正确计算最大值用于缩放', async () => {
      render(<MockDailyFocusDistribution />);
      
      await waitFor(() => {
        // 最大值应该是100分钟（14点的数据）
        const maxBar = screen.getByTestId('chart-bar-14');
        expect(maxBar).toHaveStyle('height: 100%');
      });
    });

    it('应该正确计算相对高度', async () => {
      render(<MockDailyFocusDistribution />);
      
      await waitFor(() => {
        // 50分钟应该是50%的高度（相对于100分钟的最大值）
        const halfBar = screen.getByTestId('chart-bar-9');
        expect(halfBar).toHaveStyle('height: 50%');
      });
    });

    it('应该正确格式化显示文本', async () => {
      render(<MockDailyFocusDistribution />);
      
      await waitFor(() => {
        expect(screen.getByText(/50分钟/)).toBeInTheDocument();
        expect(screen.getByText(/100分钟/)).toBeInTheDocument();
      });
    });
  });

  describe('用户体验优化', () => {
    it('应该支持主题切换', () => {
      const { rerender } = render(<MockDailyFocusDistribution theme="light" />);
      
      const component = screen.getByTestId('daily-focus-distribution');
      expect(component).toHaveClass('theme-light');
      
      rerender(<MockDailyFocusDistribution theme="dark" />);
      expect(component).toHaveClass('theme-dark');
    });

    it('应该在数据更新时提供平滑过渡动画', async () => {
      render(<MockDailyFocusDistribution />);
      
      await waitFor(() => {
        const chartContainer = screen.getByTestId('focus-distribution-chart');
        expect(chartContainer).toHaveClass('animate-fadeIn');
      });
    });
  });

  describe('边界情况处理', () => {
    it('应该正确处理无效日期输入', async () => {
      render(<MockDailyFocusDistribution />);
      
      const datePicker = screen.getByTestId('date-picker');
      
      // 输入无效日期
      fireEvent.change(datePicker, { target: { value: 'invalid-date' } });
      
      await waitFor(() => {
        // 应该保持原来的日期
        const today = format(new Date(), 'yyyy-MM-dd');
        expect((datePicker as HTMLInputElement).value).toBe(today);
      });
    });

    it('应该正确处理跨年日期', async () => {
      render(<MockDailyFocusDistribution />);
      
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.change(datePicker, { target: { value: '2023-12-31' } });
      
      await waitFor(() => {
        expect(mockGetHourlyFocusDistribution).toHaveBeenCalledWith('2023-12-31');
      });
    });
  });
});
