/**
 * REQ-TM-S03 验收测试
 * 测试每日专注时长分布功能的用户故事验收标准
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { format, subDays } from 'date-fns';
import { DailyFocusDistribution } from '../DailyFocusDistribution';

// Mock data for testing
const mockHourlyData: Record<string, Record<number, number>> = {
  '2024-08-01': {
    9: 50,  // 9AM: 50 minutes
    10: 25, // 10AM: 25 minutes
    14: 100, // 2PM: 100 minutes
    15: 75,  // 3PM: 75 minutes
    16: 30,  // 4PM: 30 minutes
    20: 45   // 8PM: 45 minutes
  },
  '2024-07-31': {
    8: 25,   // 8AM: 25 minutes
    13: 50,  // 1PM: 50 minutes
    19: 75   // 7PM: 75 minutes
  },
  '2024-01-01': {}  // Empty data for testing
};

// Mock the stats API
jest.mock('../../lib/statsCalculator', () => ({
  getHourlyFocusDistribution: jest.fn()
}));

const mockGetHourlyFocusDistribution = require('../../lib/statsCalculator').getHourlyFocusDistribution;

describe('REQ-TM-S03: 查看每日专注时长分布 - 验收测试', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Set up default mock implementation
    mockGetHourlyFocusDistribution.mockImplementation((date: string) => {
      return mockHourlyData[date] || {};
    });
  });

  describe('AC-S03.1: 按小时展示专注分钟数', () => {
    it('应该显示24小时（0-23点）的时间轴视图', async () => {
      mockGetHourlyFocusDistribution.mockReturnValue(mockHourlyData['2024-08-01']);
      
      render(<DailyFocusDistribution initialDate="2024-08-01" />);
      
      // 等待数据加载完成
      await waitFor(() => {
        expect(screen.getByTestId('focus-distribution-chart')).toBeInTheDocument();
      });
      
      // 检查是否显示所有24小时的标识
      for (let hour = 0; hour < 24; hour++) {
        const hourElement = screen.getByTestId(`hour-${hour}`);
        expect(hourElement).toBeInTheDocument();
      }
    });

    it('应该在对应小时显示正确的专注分钟数', async () => {
      mockGetHourlyFocusDistribution.mockReturnValue(mockHourlyData['2024-08-01']);
      
      render(<DailyFocusDistribution initialDate="2024-08-01" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('focus-distribution-chart')).toBeInTheDocument();
      });
      
      // 检查有数据的小时是否显示正确的分钟数 (在组件中显示为 "50min" 格式)
      expect(screen.getByText('50min')).toBeInTheDocument(); // 9AM
      expect(screen.getByText('25min')).toBeInTheDocument(); // 10AM
      expect(screen.getByText('100min')).toBeInTheDocument(); // 2PM
      expect(screen.getByText('75min')).toBeInTheDocument(); // 3PM
      expect(screen.getByText('30min')).toBeInTheDocument(); // 4PM
      expect(screen.getByText('45min')).toBeInTheDocument(); // 8PM
    });

    it('应该为没有数据的小时显示空白', async () => {
      mockGetHourlyFocusDistribution.mockReturnValue(mockHourlyData['2024-08-01']);
      
      render(<DailyFocusDistribution initialDate="2024-08-01" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('focus-distribution-chart')).toBeInTheDocument();
      });
      
      // 检查没有数据的小时不显示柱状图
      expect(screen.queryByTestId('chart-bar-0')).not.toBeInTheDocument();
      expect(screen.queryByTestId('chart-bar-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('chart-bar-23')).not.toBeInTheDocument();
    });
  });

  describe('AC-S03.2: 日期选择和数据更新', () => {
    it('应该提供日期选择器', async () => {
      render(<DailyFocusDistribution />);
      
      const datePicker = screen.getByTestId('date-picker');
      expect(datePicker).toBeInTheDocument();
      expect(datePicker).toHaveAttribute('type', 'date');
    });

    it('应该在选择不同日期时更新数据', async () => {
      render(<DailyFocusDistribution initialDate="2024-08-01" />);
      
      // 等待初始数据加载
      await waitFor(() => {
        if (Object.keys(mockHourlyData['2024-08-01']).length > 0) {
          expect(screen.getByTestId('focus-distribution-chart')).toBeInTheDocument();
        }
      });
      
      // 更改日期
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.change(datePicker, { target: { value: '2024-07-31' } });
      
      // 等待新数据加载
      await waitFor(() => {
        expect(mockGetHourlyFocusDistribution).toHaveBeenLastCalledWith('2024-07-31', []);
      });
    });

    it('应该显示当前选中的日期', async () => {
      render(<DailyFocusDistribution initialDate="2024-08-01" />);
      
      const currentDateDisplay = screen.getByTestId('current-date-display');
      expect(currentDateDisplay).toBeInTheDocument();
      expect(currentDateDisplay).toHaveTextContent('2024-08-01');
    });
  });

  describe('AC-S03.3: 数据状态和错误处理', () => {
    it('应该显示空数据状态', async () => {
      mockGetHourlyFocusDistribution.mockReturnValue({});
      
      render(<DailyFocusDistribution initialDate="2024-01-01" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('empty-data-state')).toBeInTheDocument();
      });
      
      expect(screen.getByText('暂无数据')).toBeInTheDocument();
      expect(screen.getByText('在选定日期没有专注时间记录')).toBeInTheDocument();
    });

    it('应该显示统计摘要信息', async () => {
      mockGetHourlyFocusDistribution.mockReturnValue(mockHourlyData['2024-08-01']);
      
      render(<DailyFocusDistribution initialDate="2024-08-01" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('focus-distribution-chart')).toBeInTheDocument();
      });
      
      // 检查统计摘要
      const totalFocusTime = Object.values(mockHourlyData['2024-08-01']).reduce((sum, value) => sum + value, 0);
      expect(screen.getByText(`${totalFocusTime}分钟`)).toBeInTheDocument();
      
      const activeHours = Object.keys(mockHourlyData['2024-08-01']).length;
      expect(screen.getByText(`${activeHours}小时`)).toBeInTheDocument();
    });
  });

  describe('AC-S03.4: 用户交互和可访问性', () => {
    it('应该支持键盘导航', async () => {
      render(<DailyFocusDistribution />);
      
      const datePicker = screen.getByTestId('date-picker');
      expect(datePicker).toBeInTheDocument();
      datePicker.focus();
      expect(datePicker).toHaveFocus();
    });

    it('应该提供适当的ARIA标签', async () => {
      render(<DailyFocusDistribution />);
      
      const chartRegion = screen.getByRole('region', { name: '专注时长分布图表' });
      expect(chartRegion).toBeInTheDocument();
    });

    it('应该在鼠标悬停时显示详细信息', async () => {
      mockGetHourlyFocusDistribution.mockReturnValue(mockHourlyData['2024-08-01']);
      
      render(<DailyFocusDistribution initialDate="2024-08-01" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('focus-distribution-chart')).toBeInTheDocument();
      });
      
      // 检查柱状图的title属性（tooltip）
      const chartBar14 = screen.getByTestId('chart-bar-14');
      expect(chartBar14).toHaveAttribute('title', '14:00: 100分钟');
    });
  });

  describe('AC-S03.5: 主题和样式', () => {
    it('应该支持亮色主题', async () => {
      render(<DailyFocusDistribution theme="light" />);
      
      const container = screen.getByTestId('daily-focus-distribution');
      expect(container).toHaveClass('bg-white', 'text-gray-900');
    });

    it('应该支持暗色主题', async () => {
      render(<DailyFocusDistribution theme="dark" />);
      
      const container = screen.getByTestId('daily-focus-distribution');
      expect(container).toHaveClass('bg-gray-900', 'text-white');
    });

    it('应该响应式地调整布局', async () => {
      mockGetHourlyFocusDistribution.mockReturnValue(mockHourlyData['2024-08-01']);
      
      render(<DailyFocusDistribution initialDate="2024-08-01" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('focus-distribution-chart')).toBeInTheDocument();
      });
      
      const container = screen.getByTestId('daily-focus-distribution');
      expect(container).toHaveClass('daily-focus-distribution');
      
      // 检查网格布局类 - 需要等待图表渲染
      const chartContainer = container.querySelector('.grid');
      expect(chartContainer).toHaveClass('grid-cols-6', 'sm:grid-cols-8', 'md:grid-cols-12', 'lg:grid-cols-24');
    });
  });
});
