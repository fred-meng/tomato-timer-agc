/**
 * REQ-TM-S03: DailyFocusDistribution 组件集成测试
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

describe('DailyFocusDistribution 集成测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage 返回一些测试数据
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify([
      {
        id: '1',
        type: 'work',
        duration: 25,
        startTime: new Date('2025-08-01T09:00:00.000Z').toISOString(),
        completed: true
      },
      {
        id: '2',
        type: 'work',
        duration: 30,
        startTime: new Date('2025-08-01T14:00:00.000Z').toISOString(),
        completed: true
      }
    ]));
  });

  it('应该正确显示组件基本结构', async () => {
    render(<DailyFocusDistribution />);
    
    expect(screen.getByTestId('daily-focus-distribution')).toBeInTheDocument();
    expect(screen.getByTestId('date-picker')).toBeInTheDocument();
    expect(screen.getByTestId('current-date-display')).toBeInTheDocument();
    
    // 等待数据加载
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('应该处理空数据状态', async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]));
    
    render(<DailyFocusDistribution />);
    
    await waitFor(() => {
      expect(screen.getByTestId('empty-data-state')).toBeInTheDocument();
    });
  });

  it('应该处理初始化props', () => {
    render(
      <DailyFocusDistribution 
        initialDate="2024-07-15"
        className="test-class"
        theme="dark"
      />
    );
    
    const datePicker = screen.getByTestId('date-picker') as HTMLInputElement;
    expect(datePicker.value).toBe('2024-07-15');
    
    const component = screen.getByTestId('daily-focus-distribution');
    expect(component).toHaveClass('test-class');
  });

  it('应该有正确的可访问性属性', () => {
    render(<DailyFocusDistribution />);
    
    const component = screen.getByTestId('daily-focus-distribution');
    expect(component).toHaveAttribute('role', 'region');
    expect(component).toHaveAttribute('aria-label', '专注时长分布图表');
  });

  it('应该正确提供日期选择器', () => {
    render(<DailyFocusDistribution />);
    
    const datePicker = screen.getByTestId('date-picker');
    expect(datePicker).toBeInTheDocument();
    expect(datePicker).toHaveAttribute('type', 'date');
  });
});
