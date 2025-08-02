/**
 * REQ-TM-S03: DailyFocusDistribution 组件单元测试
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { format } from 'date-fns';

// Mock function needs to be defined before the mock
const mockGetHourlyFocusDistribution = jest.fn();

// Mock the stats calculator module
jest.mock('../../lib/statsCalculator', () => ({
  getHourlyFocusDistribution: (...args: any[]) => mockGetHourlyFocusDistribution(...args)
}));

import { DailyFocusDistribution } from '../DailyFocusDistribution';

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

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock returns the data directly, not a promise
    mockGetHourlyFocusDistribution.mockReturnValue(mockHourlyData);
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]));
  });

  describe('组件初始化和渲染', () => {
    it('应该正确渲染组件的基本结构', async () => {
      render(<DailyFocusDistribution />);
      
      expect(screen.getByTestId('daily-focus-distribution')).toBeInTheDocument();
      expect(screen.getByTestId('date-picker')).toBeInTheDocument();
      
      // 等待加载完成
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });
    });

    it('应该使用今天作为默认日期', () => {
      render(<DailyFocusDistribution />);
      
      const datePicker = screen.getByTestId('date-picker') as HTMLInputElement;
      const today = format(new Date(), 'yyyy-MM-dd');
      expect(datePicker.value).toBe(today);
    });

    it('应该正确设置组件的可访问性属性', () => {
      render(<DailyFocusDistribution />);
      
      const component = screen.getByTestId('daily-focus-distribution');
      expect(component).toHaveAttribute('role', 'region');
      expect(component).toHaveAttribute('aria-label', expect.stringContaining('专注时长分布'));
    });
  });

  describe('Props 处理', () => {
    it('应该接受并使用 initialDate prop', () => {
      const initialDate = '2024-07-15';
      render(<DailyFocusDistribution initialDate={initialDate} />);
      
      const datePicker = screen.getByTestId('date-picker') as HTMLInputElement;
      expect(datePicker.value).toBe(initialDate);
    });

    it('应该接受并使用 className prop', () => {
      const customClass = 'custom-distribution';
      render(<DailyFocusDistribution className={customClass} />);
      
      const component = screen.getByTestId('daily-focus-distribution');
      expect(component).toHaveClass(customClass);
    });
  });

  describe('数据加载和显示', () => {
    it('应该显示加载状态', async () => {
      // 模拟异步加载 - 由于组件使用localStorage，我们需要模拟getSessionsData函数
      const mockGetSessionsData = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve([]), 100))
      );

      render(<DailyFocusDistribution getSessionsData={mockGetSessionsData} />);
      
      // 在异步操作完成前应该显示加载状态
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
      
      // 等待加载完成
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });
    });

    it('应该在有数据时显示图表', async () => {
      render(<DailyFocusDistribution />);
      
      await waitFor(() => {
        expect(screen.getByTestId('focus-distribution-chart')).toBeInTheDocument();
      });
    });

    it('应该在无数据时显示空状态', async () => {
      mockGetHourlyFocusDistribution.mockReturnValue({});
      
      render(<DailyFocusDistribution />);
      
      await waitFor(() => {
        expect(screen.getByTestId('empty-data-state')).toBeInTheDocument();
      });
    });
  });

  describe('日期选择', () => {
    it('应该在日期变化时更新数据', async () => {
      render(<DailyFocusDistribution />);
      
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.change(datePicker, { target: { value: '2024-07-16' } });
      
      await waitFor(() => {
        expect(mockGetHourlyFocusDistribution).toHaveBeenCalledWith('2024-07-16', []);
      });
    });

    it('应该正确显示当前日期', async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      render(<DailyFocusDistribution />);
      
      await waitFor(() => {
        expect(screen.getByTestId('current-date-display')).toHaveTextContent('今天');
      });
    });
  });

  describe('图表渲染', () => {
    it('应该渲染24小时的图表', async () => {
      render(<DailyFocusDistribution />);
      
      await waitFor(() => {
        // 检查是否有24个小时的标签
        for (let hour = 0; hour < 24; hour++) {
          expect(screen.getByTestId(`hour-${hour}`)).toBeInTheDocument();
        }
      });
    });

    it('应该为有数据的时段显示柱状图', async () => {
      render(<DailyFocusDistribution />);
      
      await waitFor(() => {
        // 检查有数据的小时是否有柱状图
        expect(screen.getByTestId('chart-bar-9')).toBeInTheDocument();
        expect(screen.getByTestId('chart-bar-14')).toBeInTheDocument();
      });
    });
  });
});
