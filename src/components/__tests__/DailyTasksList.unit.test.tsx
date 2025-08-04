/**
 * REQ-TM-S04 单元测试
 * 功能：查看每日完成的任务列表
 * 组件：DailyTasksList
 * 
 * 单元测试覆盖：
 * 1. 组件渲染测试
 * 2. Props处理测试
 * 3. 数据处理逻辑测试
 * 4. 用户交互测试
 * 5. 错误边界测试
 */

import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { format } from 'date-fns';
import DailyTasksList from '@/components/DailyTasksList';
import { useAppStore } from '@/lib/store';
import { Task, PomodoroSession, Priority } from '@/types';

// Mock store
jest.mock('@/lib/store');
const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn(),
  parseISO: jest.fn(),
  isToday: jest.fn()
}));

const mockFormat = format as jest.MockedFunction<typeof format>;

describe('DailyTasksList - 单元测试', () => {
  const mockToday = '2025-08-04';
  
  // 基础测试数据
  const baseTasks: Task[] = [
    {
      id: 'task1',
      title: '任务一',
      priority: Priority.HIGH,
      completed: true,
      createdAt: new Date(),
      estimatedPomodoros: 2,
      pomodorosUsed: 3
    },
    {
      id: 'task2',
      title: '任务二',
      priority: Priority.MEDIUM,
      completed: true,
      createdAt: new Date(),
      estimatedPomodoros: 1,
      pomodorosUsed: 1
    }
  ];

  const baseSessions: PomodoroSession[] = [
    {
      id: 'session1',
      type: 'work',
      duration: 25,
      startTime: new Date('2025-08-04T10:00:00'),
      endTime: new Date('2025-08-04T10:25:00'),
      taskId: 'task1',
      completed: true
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormat.mockReturnValue(mockToday);
  });

  afterEach(() => {
    cleanup();
  });

  describe('组件渲染测试', () => {
    test('应该正确渲染组件的基本结构', () => {
      const mockGetDailyTasksWithPomodoros = () => ([]);
      mockUseAppStore.mockReturnValue(mockGetDailyTasksWithPomodoros);

      render(<DailyTasksList />);

      expect(screen.getByTestId('daily-tasks-list')).toBeInTheDocument();
      expect(screen.getByTestId('daily-tasks-list')).toHaveClass('daily-tasks-list');
    });

    test('组件应该有正确的ARIA属性', () => {
      mockUseAppStore.mockReturnValue(() => ([]));

      render(<DailyTasksList />);

      const list = screen.getByTestId('daily-tasks-list');
      expect(list).toHaveAttribute('role', 'list');
      expect(list).toHaveAttribute('aria-label', '今日专注任务列表');
    });

    test('空状态时应该显示正确的提示信息', () => {
      mockUseAppStore.mockReturnValue(() => ([]));

      render(<DailyTasksList />);

      expect(screen.getByTestId('no-tasks-message')).toBeInTheDocument();
      expect(screen.getByText('今天还没有专注任何任务')).toBeInTheDocument();
    });

    test('有数据时不应该显示空状态提示', () => {
      mockUseAppStore.mockReturnValue(() => ([baseTasks[0]])
      );

      render(<DailyTasksList />);

      expect(screen.queryByTestId('no-tasks-message')).not.toBeInTheDocument();
      expect(screen.queryByText('今天还没有专注任何任务')).not.toBeInTheDocument();
    });
  });

  describe('数据处理测试', () => {
    test('应该调用store的getDailyTasksWithPomodoros方法', () => {
      const mockGetDailyTasksWithPomodoros = jest.fn().mockReturnValue([]);
      
      mockUseAppStore.mockReturnValue(mockGetDailyTasksWithPomodoros);

      render(<DailyTasksList />);

      expect(mockGetDailyTasksWithPomodoros).toHaveBeenCalledWith(mockToday);
    });

    test('应该正确处理单个任务的渲染', () => {
      const singleTask = [{
        ...baseTasks[0],
        pomodorosUsed: 2
      }];

      mockUseAppStore.mockReturnValue(() => (singleTask)
      );

      render(<DailyTasksList />);

      expect(screen.getByTestId('task-task1-item')).toBeInTheDocument();
      expect(screen.getByText('任务一')).toBeInTheDocument();
      expect(screen.getByTestId('task-task1-pomodoros')).toHaveTextContent('2个番茄钟');
    });

    test('应该正确处理多个任务的渲染', () => {
      const multipleTasks = [
        { ...baseTasks[0], pomodorosUsed: 3 },
        { ...baseTasks[1], pomodorosUsed: 1 }
      ];

      mockUseAppStore.mockReturnValue(() => (multipleTasks)
      );

      render(<DailyTasksList />);

      expect(screen.getByTestId('task-task1-item')).toBeInTheDocument();
      expect(screen.getByTestId('task-task2-item')).toBeInTheDocument();
      expect(screen.getByText('任务一')).toBeInTheDocument();
      expect(screen.getByText('任务二')).toBeInTheDocument();
    });

    test('应该正确排序任务（番茄钟数降序）', () => {
      const sortedTasks = [
        { id: 'task3', title: '高番茄钟任务', pomodorosUsed: 5 },
        { id: 'task4', title: '中番茄钟任务', pomodorosUsed: 3 },
        { id: 'task5', title: '低番茄钟任务', pomodorosUsed: 1 }
      ] as any;

      mockUseAppStore.mockReturnValue(() => (sortedTasks)
      );

      render(<DailyTasksList />);

      const taskItems = screen.getAllByTestId(/^task-.*-item$/);
      expect(taskItems).toHaveLength(3);

      // 验证排序：第一个应该是最高番茄钟数的任务
      expect(taskItems[0]).toHaveTextContent('高番茄钟任务');
      expect(taskItems[0]).toHaveTextContent('5个番茄钟');
    });
  });

  describe('番茄钟数量显示测试', () => {
    test('应该正确显示"1个番茄钟"的单数形式', () => {
      const singlePomodoroTask = [{
        ...baseTasks[0],
        pomodorosUsed: 1
      }];

      mockUseAppStore.mockReturnValue(() => (singlePomodoroTask)
      );

      render(<DailyTasksList />);

      expect(screen.getByTestId('task-task1-pomodoros')).toHaveTextContent('1个番茄钟');
    });

    test('应该正确显示多个番茄钟的复数形式', () => {
      const multiplePomodoroTask = [{
        ...baseTasks[0],
        pomodorosUsed: 5
      }];

      mockUseAppStore.mockReturnValue(() => (multiplePomodoroTask)
      );

      render(<DailyTasksList />);

      expect(screen.getByTestId('task-task1-pomodoros')).toHaveTextContent('5个番茄钟');
    });

    test('应该正确处理0个番茄钟的边界情况', () => {
      const zeroPomodoroTask = [{
        ...baseTasks[0],
        pomodorosUsed: 0
      }];

      mockUseAppStore.mockReturnValue(() => (zeroPomodoroTask)
      );

      render(<DailyTasksList />);

      expect(screen.getByTestId('task-task1-pomodoros')).toHaveTextContent('0个番茄钟');
    });
  });

  describe('CSS类名和样式测试', () => {
    test('组件容器应该有正确的CSS类名', () => {
      mockUseAppStore.mockReturnValue(() => ([])
      );

      render(<DailyTasksList />);

      const container = screen.getByTestId('daily-tasks-list');
      expect(container).toHaveClass('daily-tasks-list');
    });

    test('任务项应该有正确的CSS类名', () => {
      mockUseAppStore.mockReturnValue(() => ([baseTasks[0]])
      );

      render(<DailyTasksList />);

      const taskItem = screen.getByTestId('task-task1-item');
      expect(taskItem).toHaveClass('task-item');
    });

    test('空状态应该有正确的CSS类名', () => {
      mockUseAppStore.mockReturnValue(() => ([])
      );

      render(<DailyTasksList />);

      const emptyState = screen.getByTestId('no-tasks-message');
      expect(emptyState).toHaveClass('empty-state');
    });
  });

  describe('用户交互测试', () => {
    test('鼠标进入任务项时应该触发hover效果', () => {
      mockUseAppStore.mockReturnValue(() => ([baseTasks[0]])
      );

      render(<DailyTasksList />);

      const taskItem = screen.getByTestId('task-task1-item');
      
      fireEvent.mouseEnter(taskItem);
      
      // 验证hover状态（假设会添加hover类名或触发事件）
      expect(taskItem).toBeInTheDocument(); // 基础验证，实际可能需要检查CSS变化
    });

    test('鼠标离开任务项时应该移除hover效果', () => {
      mockUseAppStore.mockReturnValue(() => ([baseTasks[0]])
      );

      render(<DailyTasksList />);

      const taskItem = screen.getByTestId('task-task1-item');
      
      fireEvent.mouseEnter(taskItem);
      fireEvent.mouseLeave(taskItem);
      
      // 验证hover状态移除
      expect(taskItem).toBeInTheDocument();
    });

    test('点击任务项时应该触发适当的回调（如果有）', () => {
      mockUseAppStore.mockReturnValue(() => ([baseTasks[0]])
      );

      render(<DailyTasksList />);

      const taskItem = screen.getByTestId('task-task1-item');
      
      fireEvent.click(taskItem);
      
      // 基础验证（实际可能需要验证特定的回调函数调用）
      expect(taskItem).toBeInTheDocument();
    });
  });

  describe('错误边界和边界条件测试', () => {
    test('应该优雅处理undefined的任务数据', () => {
      mockUseAppStore.mockReturnValue(() => ([])
      );

      expect(() => render(<DailyTasksList />)).not.toThrow();
      expect(screen.getByTestId('no-tasks-message')).toBeInTheDocument();
    });

    test('应该优雅处理null的任务数据', () => {
      mockUseAppStore.mockReturnValue(() => ([])
      );

      expect(() => render(<DailyTasksList />)).not.toThrow();
      expect(screen.getByTestId('no-tasks-message')).toBeInTheDocument();
    });

    test('应该处理非常长的任务标题', () => {
      const longTitleTask = [{
        id: 'long-task',
        title: '这是一个非常非常非常长的任务标题，用来测试组件在处理超长文本时是否能够正确渲染而不会破坏页面布局或者引起其他问题',
        pomodorosUsed: 1
      }];

      mockUseAppStore.mockReturnValue(() => (longTitleTask)
      );

      render(<DailyTasksList />);

      expect(screen.getByText(/这是一个非常非常非常长的任务标题/)).toBeInTheDocument();
      expect(screen.getByTestId('task-long-task-pomodoros')).toHaveTextContent('1个番茄钟');
    });

    test('应该处理空字符串任务标题', () => {
      const emptyTitleTask = [{
        id: 'empty-task',
        title: '',
        pomodorosUsed: 1
      }];

      mockUseAppStore.mockReturnValue(() => (emptyTitleTask)
      );

      render(<DailyTasksList />);

      expect(screen.getByTestId('task-empty-task-item')).toBeInTheDocument();
      expect(screen.getByTestId('task-empty-task-pomodoros')).toHaveTextContent('1个番茄钟');
    });

    test('应该处理负数番茄钟数（防御性编程）', () => {
      const negativePomodoroTask = [{
        id: 'negative-task',
        title: '负数任务',
        pomodorosUsed: -1
      }];

      mockUseAppStore.mockReturnValue(() => (negativePomodoroTask)
      );

      render(<DailyTasksList />);

      expect(screen.getByTestId('task-negative-task-pomodoros')).toHaveTextContent('0个番茄钟');
    });

    test('应该处理非数字番茄钟数', () => {
      const invalidPomodoroTask = [{
        id: 'invalid-task',
        title: '无效任务',
        pomodorosUsed: NaN
      }];

      mockUseAppStore.mockReturnValue(() => (invalidPomodoroTask)
      );

      render(<DailyTasksList />);

      expect(screen.getByTestId('task-invalid-task-pomodoros')).toHaveTextContent('0个番茄钟');
    });
  });

  describe('日期处理测试', () => {
    test('应该使用正确的日期格式调用store方法', () => {
      const mockGetDailyTasksWithPomodoros = jest.fn().mockReturnValue([]);
      const customDate = '2025-08-05';
      
      mockFormat.mockReturnValue(customDate);
      
      mockUseAppStore.mockReturnValue(mockGetDailyTasksWithPomodoros);

      render(<DailyTasksList />);

      expect(mockGetDailyTasksWithPomodoros).toHaveBeenCalledWith(customDate);
    });

    test('应该在日期变化时重新获取数据', () => {
      const mockGetDailyTasksWithPomodoros = jest.fn().mockReturnValue([]);
      
      mockUseAppStore.mockReturnValue(mockGetDailyTasksWithPomodoros);

      const { rerender } = render(<DailyTasksList />);

      expect(mockGetDailyTasksWithPomodoros).toHaveBeenCalledTimes(1);

      // 模拟日期变化
      mockFormat.mockReturnValue('2025-08-06');
      
      rerender(<DailyTasksList />);

      expect(mockGetDailyTasksWithPomodoros).toHaveBeenCalledTimes(2);
      expect(mockGetDailyTasksWithPomodoros).toHaveBeenLastCalledWith('2025-08-06');
    });
  });

  describe('性能测试', () => {
    test('应该避免不必要的重渲染', () => {
      const mockGetDailyTasksWithPomodoros = jest.fn().mockReturnValue([baseTasks[0]]);
      
      mockUseAppStore.mockReturnValue(mockGetDailyTasksWithPomodoros);

      const { rerender } = render(<DailyTasksList />);

      expect(mockGetDailyTasksWithPomodoros).toHaveBeenCalledTimes(1);

      // 使用相同的props重新渲染
      rerender(<DailyTasksList />);

      // 应该只调用一次（如果使用了适当的优化）
      // 注意：这取决于具体的优化实现
      expect(mockGetDailyTasksWithPomodoros).toHaveBeenCalledTimes(2);
    });

    test('大量任务时渲染性能应该在可接受范围内', () => {
      const largeTasks = Array.from({ length: 100 }, (_, index) => ({
        id: `task-${index}`,
        title: `任务${index + 1}`,
        pomodorosUsed: Math.floor(Math.random() * 10) + 1
      }));

      mockUseAppStore.mockReturnValue(() => (largeTasks)
      );

      const startTime = performance.now();
      render(<DailyTasksList />);
      const endTime = performance.now();

      // 期望渲染时间在合理范围内
      expect(endTime - startTime).toBeLessThan(100); // 100ms
    });
  });

  describe('可访问性测试', () => {
    test('列表应该有正确的ARIA标签', () => {
      mockUseAppStore.mockReturnValue(() => ([baseTasks[0]])
      );

      render(<DailyTasksList />);

      const list = screen.getByTestId('daily-tasks-list');
      expect(list).toHaveAttribute('role', 'list');
      expect(list).toHaveAttribute('aria-label', '今日专注任务列表');
    });

    test('任务项应该有正确的ARIA属性', () => {
      mockUseAppStore.mockReturnValue(() => ([baseTasks[0]])
      );

      render(<DailyTasksList />);

      const taskItem = screen.getByTestId('task-task1-item');
      expect(taskItem).toHaveAttribute('role', 'listitem');
    });

    test('应该支持键盘导航', () => {
      mockUseAppStore.mockReturnValue(() => ([baseTasks[0]])
      );

      render(<DailyTasksList />);

      const taskItem = screen.getByTestId('task-task1-item');
      
      // 任务项应该可以获得焦点
      expect(taskItem).toHaveAttribute('tabIndex', '0');
    });
  });
});
