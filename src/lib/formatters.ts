/**
 * 格式化工具函数模块
 * 提供各种数据格式化功能
 */

/**
 * 格式化番茄钟数量显示
 * @param count 番茄钟数量
 * @returns 格式化后的字符串
 */
export const formatPomodoroCount = (count: number): string => {
  // 处理边界情况
  const validCount = Math.max(0, isNaN(count) ? 0 : count);
  return `${validCount}个番茄钟`;
};
