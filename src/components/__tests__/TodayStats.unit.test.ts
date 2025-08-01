/**
 * REQ-TM-S01 单元测试用例  
 * 功能：查看今日关键指标 - 统计计算逻辑
 * 测试目标：>95%代码覆盖率
 */

import { format } from 'date-fns';
import { 
  calculateTodayStats,
  formatDuration,
  getTodayCompletedTasks,
  getTodayPomodoroSessions,
  createEmptyDailyStats 
} from '@/lib/statsCalculator';
import { DailyStats, Task, PomodoroSession, Priority } from '@/types';

describe('REQ-TM-S01: 今日关键指标计算逻辑 - 单元测试', () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(new Date(Date.now() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
  
  describe('calculateTodayStats() 函数', () => {
    test('应该正确计算今日统计数据（完整数据集）', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: '任务1',
          completed: true,
          createdAt: new Date(),
          completedAt: new Date(), // 添加今日完成时间
          pomodorosUsed: 2,
          estimatedPomodoros: 3,
          priority: 'HIGH' as Priority
        },
        {
          id: '2',
          title: '任务2', 
          completed: true,
          createdAt: new Date(),
          completedAt: new Date(), // 添加今日完成时间
          pomodorosUsed: 1,
          estimatedPomodoros: 1,
          priority: 'MEDIUM' as Priority
        }
      ];

      const sessions: PomodoroSession[] = [
        {
          id: '1',
          type: 'work',
          duration: 25,
          startTime: new Date(),
          endTime: new Date(Date.now() + 25 * 60 * 1000),
          taskId: '1',
          completed: true
        },
        {
          id: '2',
          type: 'work',
          duration: 25,
          startTime: new Date(),
          endTime: new Date(Date.now() + 25 * 60 * 1000),
          taskId: '1',
          completed: true
        },
        {
          id: '3',
          type: 'work',
          duration: 25,
          startTime: new Date(),
          endTime: new Date(Date.now() + 25 * 60 * 1000),
          taskId: '2',
          completed: true
        },
        {
          id: '4',
          type: 'shortBreak',
          duration: 5,
          startTime: new Date(),
          endTime: new Date(Date.now() + 5 * 60 * 1000),
          completed: true
        }
      ];

      const result = calculateTodayStats(tasks, sessions);

      expect(result.date).toBe(today);
      expect(result.totalPomodoros).toBe(3);
      expect(result.workTime).toBe(75); // 3 * 25分钟
      expect(result.breakTime).toBe(5);
      expect(result.tasksCompleted).toBe(2);
      expect(result.focusScore).toBeGreaterThan(0);
    });

    test('应该返回空统计当没有数据时', () => {
      const result = calculateTodayStats([], []);
      
      expect(result.date).toBe(today);
      expect(result.totalPomodoros).toBe(0);
      expect(result.workTime).toBe(0);
      expect(result.breakTime).toBe(0);
      expect(result.tasksCompleted).toBe(0);
      expect(result.focusScore).toBe(0);
    });

    test('应该只计算已完成的会话', () => {
      const sessions: PomodoroSession[] = [
        {
          id: '1',
          type: 'work',
          duration: 25,
          startTime: new Date(),
          endTime: new Date(Date.now() + 25 * 60 * 1000),
          taskId: '1',
          completed: true
        },
        {
          id: '2',
          type: 'work',
          duration: 25,
          startTime: new Date(),
          endTime: new Date(Date.now() + 20 * 60 * 1000),
          taskId: '1',
          completed: false // 未完成
        }
      ];

      const result = calculateTodayStats([], sessions);

      expect(result.totalPomodoros).toBe(1);
      expect(result.workTime).toBe(25);
    });

    test('应该只计算今日的会话', () => {
      const yesterdaySession: PomodoroSession = {
        id: '1',
        type: 'work',
        duration: 25,
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
        taskId: '1',
        completed: true
      };

      const todaySession: PomodoroSession = {
        id: '2',
        type: 'work',
        duration: 25,
        startTime: new Date(),
        endTime: new Date(Date.now() + 25 * 60 * 1000),
        taskId: '1',
        completed: true
      };

      const result = calculateTodayStats([], [yesterdaySession, todaySession]);

      expect(result.totalPomodoros).toBe(1);
      expect(result.workTime).toBe(25);
    });

    test('应该正确计算专注分数', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: '任务1',
          completed: true,
          createdAt: new Date(),
          completedAt: new Date(), // 添加今日完成时间
          pomodorosUsed: 2,
          estimatedPomodoros: 2, // 完全按计划完成
          priority: 'HIGH' as Priority
        }
      ];

      const sessions: PomodoroSession[] = [
        {
          id: '1',
          type: 'work',
          duration: 25,
          startTime: new Date(),
          endTime: new Date(Date.now() + 25 * 60 * 1000),
          taskId: '1',
          completed: true
        },
        {
          id: '2',
          type: 'work',
          duration: 25,
          startTime: new Date(),
          endTime: new Date(Date.now() + 25 * 60 * 1000),
          taskId: '1',
          completed: true
        }
      ];

      const result = calculateTodayStats(tasks, sessions);

      expect(result.focusScore).toBeGreaterThanOrEqual(50); // 高质量完成应该有高分
    });
  });

  describe('formatDuration() 函数', () => {
    test('应该正确格式化小时和分钟', () => {
      expect(formatDuration(65)).toBe('1小时5分钟');
      expect(formatDuration(125)).toBe('2小时5分钟');
      expect(formatDuration(180)).toBe('3小时0分钟');
    });

    test('应该正确格式化只有分钟', () => {
      expect(formatDuration(30)).toBe('30分钟');
      expect(formatDuration(5)).toBe('5分钟');
      expect(formatDuration(59)).toBe('59分钟');
    });

    test('应该处理0分钟', () => {
      expect(formatDuration(0)).toBe('0分钟');
    });

    test('应该处理负数（返回0分钟）', () => {
      expect(formatDuration(-10)).toBe('0分钟');
    });

    test('应该处理小数（向下取整）', () => {
      expect(formatDuration(65.7)).toBe('1小时5分钟');
      expect(formatDuration(30.9)).toBe('30分钟');
    });
  });

  describe('getTodayCompletedTasks() 函数', () => {
    test('应该返回今日完成的任务', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: '今日完成的任务',
          completed: true,
          createdAt: new Date(),
          pomodorosUsed: 1,
          estimatedPomodoros: 1,
          priority: 'HIGH' as Priority,
          completedAt: new Date()
        },
        {
          id: '2', 
          title: '今日未完成的任务',
          completed: false,
          createdAt: new Date(),
          pomodorosUsed: 0,
          estimatedPomodoros: 2,
          priority: 'MEDIUM' as Priority
        },
        {
          id: '3',
          title: '昨日完成的任务', 
          completed: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          pomodorosUsed: 1,
          estimatedPomodoros: 1,
          priority: 'LOW' as Priority,
          completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ];

      const result = getTodayCompletedTasks(tasks);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].title).toBe('今日完成的任务');
    });

    test('应该返回空数组当没有今日完成的任务时', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: '未完成任务',
          completed: false,
          createdAt: new Date(),
          pomodorosUsed: 0,
          estimatedPomodoros: 1,
          priority: 'HIGH' as Priority
        }
      ];

      const result = getTodayCompletedTasks(tasks);

      expect(result).toHaveLength(0);
    });

    test('应该处理没有completedAt字段的任务', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: '完成的任务',
          completed: true,
          createdAt: new Date(),
          pomodorosUsed: 1,
          estimatedPomodoros: 1,
          priority: 'HIGH' as Priority
          // 没有completedAt字段
        }
      ];

      const result = getTodayCompletedTasks(tasks);

      expect(result).toHaveLength(0); // 应该被过滤掉
    });
  });

  describe('getTodayPomodoroSessions() 函数', () => {
    test('应该返回今日的番茄钟会话', () => {
      const sessions: PomodoroSession[] = [
        {
          id: '1',
          type: 'work',
          duration: 25,
          startTime: new Date(),
          endTime: new Date(Date.now() + 25 * 60 * 1000),
          taskId: '1',
          completed: true
        },
        {
          id: '2',
          type: 'work',
          duration: 25,
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
          taskId: '1',
          completed: true
        }
      ];

      const result = getTodayPomodoroSessions(sessions);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    test('应该返回空数组当没有今日会话时', () => {
      const sessions: PomodoroSession[] = [
        {
          id: '1',
          type: 'work',
          duration: 25,
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
          taskId: '1',
          completed: true
        }
      ];

      const result = getTodayPomodoroSessions(sessions);

      expect(result).toHaveLength(0);
    });
  });

  describe('createEmptyDailyStats() 函数', () => {
    test('应该创建正确的空统计对象', () => {
      const result = createEmptyDailyStats();

      expect(result.date).toBe(today);
      expect(result.totalPomodoros).toBe(0);
      expect(result.workTime).toBe(0);
      expect(result.breakTime).toBe(0);
      expect(result.tasksCompleted).toBe(0);
      expect(result.focusScore).toBe(0);
    });

    test('应该创建指定日期的空统计对象', () => {
      const customDate = '2025-07-27';
      const result = createEmptyDailyStats(customDate);

      expect(result.date).toBe(customDate);
      expect(result.totalPomodoros).toBe(0);
    });
  });

  describe('边界情况和错误处理', () => {
    test('应该处理null/undefined输入', () => {
      expect(() => calculateTodayStats(null as any, null as any)).not.toThrow();
      expect(() => formatDuration(null as any)).not.toThrow();
      expect(() => getTodayCompletedTasks(null as any)).not.toThrow();
      expect(() => getTodayPomodoroSessions(null as any)).not.toThrow();
    });

    test('应该处理空数组输入', () => {
      expect(calculateTodayStats([], [])).toBeDefined();
      expect(getTodayCompletedTasks([])).toEqual([]);
      expect(getTodayPomodoroSessions([])).toEqual([]);
    });

    test('应该处理无效的会话数据', () => {
      const invalidSessions: PomodoroSession[] = [
        {
          id: '1',
          type: 'work',
          duration: -5, // 无效时长
          startTime: new Date(),
          endTime: new Date(Date.now() - 1000), // 结束时间早于开始时间
          taskId: '1',
          completed: true
        }
      ];

      const result = calculateTodayStats([], invalidSessions);
      expect(result.workTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('性能测试', () => {
    test('应该能处理大量数据', () => {
      const largeTasks: Task[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `task-${i}`,
        title: `任务 ${i}`,
        completed: i % 2 === 0,
        createdAt: new Date(),
        pomodorosUsed: Math.floor(Math.random() * 5),
        estimatedPomodoros: Math.floor(Math.random() * 5) + 1,
        priority: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)] as Priority,
        completedAt: i % 2 === 0 ? new Date() : undefined
      }));

      const largeSessions: PomodoroSession[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `session-${i}`,
        type: i % 4 === 0 ? 'shortBreak' : 'work',
        duration: i % 4 === 0 ? 5 : 25,
        startTime: new Date(Date.now() - i * 60 * 1000),
        endTime: new Date(Date.now() - i * 60 * 1000 + (i % 4 === 0 ? 5 : 25) * 60 * 1000),
        taskId: `task-${Math.floor(i / 4)}`,
        completed: true
      }));

      const startTime = performance.now();
      const result = calculateTodayStats(largeTasks, largeSessions);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
      expect(result).toBeDefined();
    });
  });
});

export default {};
