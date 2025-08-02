/**
 * useDailyFocusData Hook
 * 处理每日专注数据的获取和状态管理
 */

import { useState, useEffect } from 'react';
import { getHourlyFocusDistribution } from '../../lib/statsCalculator';

interface UseDailyFocusDataProps {
  selectedDate: string;
  getSessionsData?: () => Promise<any[]>;
}

interface UseDailyFocusDataReturn {
  data: Record<number, number>;
  loading: boolean;
  error: string | null;
}

export const useDailyFocusData = ({ 
  selectedDate, 
  getSessionsData 
}: UseDailyFocusDataProps): UseDailyFocusDataReturn => {
  const [data, setData] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取专注时长分布数据
  const fetchFocusData = async (date: string) => {
    try {
      setLoading(true);
      setError(null);

      let sessions = [];
      if (getSessionsData) {
        sessions = await getSessionsData();
      } else {
        // 从 localStorage 获取默认数据
        const storedSessions = localStorage.getItem('pomodoroSessions');
        sessions = storedSessions ? JSON.parse(storedSessions) : [];
      }

      const result = getHourlyFocusDistribution(date, sessions);
      setData(result);
    } catch (err) {
      console.error('获取专注时长分布数据失败:', err);
      setError('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化和日期变化时获取数据
  useEffect(() => {
    fetchFocusData(selectedDate);
  }, [selectedDate, getSessionsData]);

  return { data, loading, error };
};
