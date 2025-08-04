/**
 * REQ-TM-S01 验收测试用例
 * 功能：查看今日关键指标
 * 用户故事：作为学生Alex，我希望能快速看到今天完成了多少个番茄钟和任务，
 *          这会给我巨大的即时满足感和继续学习的动力。
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { format } from 'date-fns';
import TodayStatsComponent from '@/components/TodayStats';
import { useAppStore } from '@/lib/store';
import { DailyStats, Task, PomodoroSession, Priority } from '@/types';

// Mock store
jest.mock('@/lib/store');
const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;

describe('REQ-TM-S01: 查看今日关键指标 - 验收测试', () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // 测试数据准备
  const mockTodayStats: DailyStats = {
    date: today,
    totalPomodoros: 5,
    workTime: 125, // 5个番茄钟 * 25分钟
    breakTime: 20,
    tasksCompleted: 3,
    focusScore: 85
  };

  const mockCompletedTasks: Task[] = [
    {
      id: '1',
      title: '完成数据结构作业',
      completed: true,
      createdAt: new Date(),
      pomodorosUsed: 2,
      estimatedPomodoros: 3,
      priority: Priority.HIGH
    },
    {
      id: '2', 
      title: '阅读算法导论第三章',
      completed: true,
      createdAt: new Date(),
      pomodorosUsed: 2,
      estimatedPomodoros: 2,
      priority: Priority.MEDIUM
    },
    {
      id: '3',
      title: '整理课堂笔记',
      completed: true,
      createdAt: new Date(),
      pomodorosUsed: 1,
      estimatedPomodoros: 1,
      priority: Priority.LOW
    }
  ];

  const mockPomodoroSessions: PomodoroSession[] = [
    {
      id: '1',
      type: 'work',
      duration: 25,
      startTime: new Date('2025-07-28T09:00:00'),
      endTime: new Date('2025-07-28T09:25:00'),
      taskId: '1',
      completed: true
    },
    {
      id: '2',
      type: 'work', 
      duration: 25,
      startTime: new Date('2025-07-28T09:30:00'),
      endTime: new Date('2025-07-28T09:55:00'),
      taskId: '1',
      completed: true
    },
    {
      id: '3',
      type: 'work',
      duration: 25,
      startTime: new Date('2025-07-28T10:15:00'),
      endTime: new Date('2025-07-28T10:40:00'),
      taskId: '2',
      completed: true
    },
    {
      id: '4',
      type: 'work',
      duration: 25,
      startTime: new Date('2025-07-28T11:00:00'),
      endTime: new Date('2025-07-28T11:25:00'),
      taskId: '2',
      completed: true
    },
    {
      id: '5',
      type: 'work',
      duration: 25,
      startTime: new Date('2025-07-28T14:00:00'),
      endTime: new Date('2025-07-28T14:25:00'),
      taskId: '3',
      completed: true
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AC-S01.1: 显示今日总专注时长', () => {
    test('应该显示正确的今日总专注时长（有数据时）', async () => {
      mockUseAppStore.mockReturnValue({
        stats: { daily: [mockTodayStats] },
        tasks: mockCompletedTasks,
        pomodoroSessions: mockPomodoroSessions,
        getTodayStats: jest.fn().mockReturnValue(mockTodayStats)
      } as any);

      render(<TodayStatsComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('today-focus-time')).toBeInTheDocument();
      });

      const focusTimeElement = screen.getByTestId('today-focus-time');
      expect(focusTimeElement).toHaveTextContent('2小时5分钟');
    });

    test('应该正确格式化显示时长', async () => {
      const mockStats = {
        ...mockTodayStats,
        workTime: 65 // 1小时5分钟
      };

      mockUseAppStore.mockReturnValue({
        stats: { daily: [mockStats] },
        getTodayStats: jest.fn().mockReturnValue(mockStats)
      } as any);

      render(<TodayStatsComponent />);

      await waitFor(() => {
        const focusTimeElement = screen.getByTestId('today-focus-time');
        expect(focusTimeElement).toHaveTextContent('1小时5分钟');
      });
    });
  });

  describe('AC-S01.2: 显示今日完成的番茄钟数量', () => {
    test('应该显示正确的番茄钟数量（有数据时）', async () => {
      mockUseAppStore.mockReturnValue({
        stats: { daily: [mockTodayStats] },
        getTodayStats: jest.fn().mockReturnValue(mockTodayStats)
      } as any);

      render(<TodayStatsComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('today-pomodoros')).toBeInTheDocument();
      });

      const pomodorosElement = screen.getByTestId('today-pomodoros');
      expect(pomodorosElement).toHaveTextContent('5');
    });

    test('应该显示番茄钟图标和标签', async () => {
      mockUseAppStore.mockReturnValue({
        stats: { daily: [mockTodayStats] },
        getTodayStats: jest.fn().mockReturnValue(mockTodayStats)
      } as any);

      render(<TodayStatsComponent />);

      await waitFor(() => {
        expect(screen.getByText('完成番茄钟')).toBeInTheDocument();
      });
    });
  });

  describe('AC-S01.3: 显示今日完成的任务数量', () => {
    test('应该显示正确的任务数量（有数据时）', async () => {
      mockUseAppStore.mockReturnValue({
        stats: { daily: [mockTodayStats] },
        tasks: mockCompletedTasks,
        getTodayStats: jest.fn().mockReturnValue(mockTodayStats)
      } as any);

      render(<TodayStatsComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('today-tasks')).toBeInTheDocument();
      });

      const tasksElement = screen.getByTestId('today-tasks');
      expect(tasksElement).toHaveTextContent('3');
    });

    test('应该显示任务图标和标签', async () => {
      mockUseAppStore.mockReturnValue({
        stats: { daily: [mockTodayStats] },
        getTodayStats: jest.fn().mockReturnValue(mockTodayStats)
      } as any);

      render(<TodayStatsComponent />);

      await waitFor(() => {
        expect(screen.getByText('完成任务')).toBeInTheDocument();
      });
    });
  });

  describe('AC-S01.4: 无数据时的友好提示', () => {
    test('应该显示0值当没有今日数据时', async () => {
      const emptyStats: DailyStats = {
        date: today,
        totalPomodoros: 0,
        workTime: 0,
        breakTime: 0,
        tasksCompleted: 0,
        focusScore: 0
      };

      mockUseAppStore.mockReturnValue({
        stats: { daily: [emptyStats] },
        tasks: [],
        getTodayStats: jest.fn().mockReturnValue(emptyStats)
      } as any);

      render(<TodayStatsComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('today-focus-time')).toHaveTextContent('0分钟');
        expect(screen.getByTestId('today-pomodoros')).toHaveTextContent('0');
        expect(screen.getByTestId('today-tasks')).toHaveTextContent('0');
      });
    });

    test('应该显示激励性提示信息当没有任何活动时', async () => {
      const emptyStats: DailyStats = {
        date: today,
        totalPomodoros: 0,
        workTime: 0,
        breakTime: 0,
        tasksCompleted: 0,
        focusScore: 0
      };

      mockUseAppStore.mockReturnValue({
        stats: { daily: [emptyStats] },
        tasks: [],
        getTodayStats: jest.fn().mockReturnValue(emptyStats)
      } as any);

      render(<TodayStatsComponent />);

      await waitFor(() => {
        expect(screen.getByText(/今天还没有开始专注/i)).toBeInTheDocument();
      });
    });

    test('应该在没有统计数据时显示默认值', async () => {
      mockUseAppStore.mockReturnValue({
        stats: { daily: [] },
        tasks: [],
        getTodayStats: jest.fn().mockReturnValue(null)
      } as any);

      render(<TodayStatsComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('today-focus-time')).toHaveTextContent('0分钟');
        expect(screen.getByTestId('today-pomodoros')).toHaveTextContent('0');
        expect(screen.getByTestId('today-tasks')).toHaveTextContent('0');
      });
    });
  });

  describe('数据一致性验证', () => {
    test('番茄钟数量应该与专注时长匹配', async () => {
      const consistentStats: DailyStats = {
        date: today,
        totalPomodoros: 4,
        workTime: 100, // 4个番茄钟 * 25分钟
        breakTime: 15,
        tasksCompleted: 2,
        focusScore: 90
      };

      mockUseAppStore.mockReturnValue({
        stats: { daily: [consistentStats] },
        getTodayStats: jest.fn().mockReturnValue(consistentStats)
      } as any);

      render(<TodayStatsComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('today-pomodoros')).toHaveTextContent('4');
        expect(screen.getByTestId('today-focus-time')).toHaveTextContent('1小时40分钟');
      });
    });
  });

  describe('UI样式和用户体验', () => {
    test('应该具有正确的CSS类名用于iOS 18设计风格', async () => {
      mockUseAppStore.mockReturnValue({
        stats: { daily: [mockTodayStats] },
        getTodayStats: jest.fn().mockReturnValue(mockTodayStats)
      } as any);

      render(<TodayStatsComponent />);

      await waitFor(() => {
        const container = screen.getByTestId('today-stats-container');
        expect(container).toHaveClass('bg-white', 'dark:bg-gray-800', 'rounded-2xl');
      });
    });

    test('应该支持暗色模式', async () => {
      mockUseAppStore.mockReturnValue({
        stats: { daily: [mockTodayStats] },
        getTodayStats: jest.fn().mockReturnValue(mockTodayStats),
        settings: { theme: 'dark' }
      } as any);

      render(<TodayStatsComponent />);

      await waitFor(() => {
        const numbers = screen.getAllByTestId(/today-/);
        numbers.forEach(element => {
          expect(element).toHaveClass(/dark:/);
        });
      });
    });
  });
});

const TodayStatsAcceptanceTests = {};
export default TodayStatsAcceptanceTests;
