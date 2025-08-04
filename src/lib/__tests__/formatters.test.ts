/**
 * 格式化工具函数单元测试
 */

import { formatPomodoroCount } from '../formatters';

describe('formatters', () => {
  describe('formatPomodoroCount', () => {
    test('应该正确格式化正数', () => {
      expect(formatPomodoroCount(1)).toBe('1个番茄钟');
      expect(formatPomodoroCount(5)).toBe('5个番茄钟');
      expect(formatPomodoroCount(10)).toBe('10个番茄钟');
    });

    test('应该正确处理0', () => {
      expect(formatPomodoroCount(0)).toBe('0个番茄钟');
    });

    test('应该正确处理负数', () => {
      expect(formatPomodoroCount(-1)).toBe('0个番茄钟');
      expect(formatPomodoroCount(-10)).toBe('0个番茄钟');
    });

    test('应该正确处理NaN', () => {
      expect(formatPomodoroCount(NaN)).toBe('0个番茄钟');
    });

    test('应该正确处理无穷大', () => {
      expect(formatPomodoroCount(Infinity)).toBe('Infinity个番茄钟');
      expect(formatPomodoroCount(-Infinity)).toBe('0个番茄钟');
    });

    test('应该正确处理小数', () => {
      expect(formatPomodoroCount(1.5)).toBe('1.5个番茄钟');
      expect(formatPomodoroCount(2.7)).toBe('2.7个番茄钟');
    });
  });
});
