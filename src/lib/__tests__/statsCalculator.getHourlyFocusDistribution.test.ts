/**
 * REQ-TM-S03: getHourlyFocusDistribution 工具函数单元测试
 */

import { getHourlyFocusDistribution } from '../statsCalculator';
import { PomodoroSession } from '../../types';

describe('getHourlyFocusDistribution 单元测试', () => {
  // 测试数据
  const mockSessions: PomodoroSession[] = [
    {
      id: '1',
      type: 'work',
      duration: 25,
      startTime: new Date('2024-08-01T09:00:00.000Z'),
      endTime: new Date('2024-08-01T09:25:00.000Z'),
      completed: true,
      taskId: 'task1'
    },
    {
      id: '2',
      type: 'work',
      duration: 25,
      startTime: new Date('2024-08-01T09:30:00.000Z'),
      endTime: new Date('2024-08-01T09:55:00.000Z'),
      completed: true,
      taskId: 'task2'
    },
    {
      id: '3',
      type: 'work',
      duration: 25,
      startTime: new Date('2024-08-01T14:00:00.000Z'),
      endTime: new Date('2024-08-01T14:25:00.000Z'),
      completed: true,
      taskId: 'task3'
    },
    {
      id: '4',
      type: 'shortBreak',
      duration: 5,
      startTime: new Date('2024-08-01T09:25:00.000Z'),
      endTime: new Date('2024-08-01T09:30:00.000Z'),
      completed: true
    },
    {
      id: '5',
      type: 'work',
      duration: 25,
      startTime: new Date('2024-08-01T10:00:00.000Z'),
      completed: false
    },
    {
      id: '6',
      type: 'work',
      duration: 30,
      startTime: new Date('2024-08-02T09:00:00.000Z'),
      completed: true
    }
  ];

  describe('正常数据处理', () => {
    it('应该正确计算指定日期的小时专注分布', () => {
      const result = getHourlyFocusDistribution('2024-08-01', mockSessions);
      
      expect(result).toEqual({
        9: 50,  // 两个25分钟的工作会话
        14: 25  // 一个25分钟的工作会话
      });
    });

    it('应该正确过滤指定日期的会话', () => {
      const result = getHourlyFocusDistribution('2024-08-02', mockSessions);
      
      expect(result).toEqual({
        9: 30  // 一个30分钟的工作会话
      });
    });

    it('应该只计算已完成的工作会话', () => {
      const result = getHourlyFocusDistribution('2024-08-01', mockSessions);
      
      expect(result[10]).toBeUndefined();
    });

    it('应该忽略非工作类型的会话', () => {
      const result = getHourlyFocusDistribution('2024-08-01', mockSessions);
      
      expect(result[9]).toBe(50);
    });
  });

  describe('边界情况', () => {
    it('应该处理空会话数组', () => {
      const result = getHourlyFocusDistribution('2024-08-01', []);
      
      expect(result).toEqual({});
    });

    it('应该处理无匹配日期的情况', () => {
      const result = getHourlyFocusDistribution('2024-12-31', mockSessions);
      
      expect(result).toEqual({});
    });

    it('应该处理无效日期字符串', () => {
      const result = getHourlyFocusDistribution('invalid-date', mockSessions);
      
      expect(result).toEqual({});
    });
  });
});
