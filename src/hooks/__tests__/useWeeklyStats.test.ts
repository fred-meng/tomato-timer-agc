/**
 * useWeeklyStats hook 测试
 */

import { renderHook } from '@testing-library/react'
import { useWeeklyStats, useFormattedStatValues } from '../useWeeklyStats'

// Mock store
const mockGetWeeklyStats = jest.fn()

jest.mock('@/lib/store', () => ({
  useAppStore: () => ({
    getWeeklyStats: mockGetWeeklyStats,
  }),
}))

// Mock stats calculator
jest.mock('@/lib/statsCalculator', () => ({
  formatDurationWithHours: jest.fn((time) => `${Math.floor(time / 60)}h ${time % 60}m`),
}))

const mockWeeklyStatsData = {
  weekStart: '2024-01-01',
  dailyStats: [
    {
      date: '2024-01-01',
      workTime: 120,
      totalPomodoros: 4,
      breakTime: 20,
      tasksCompleted: 2,
      focusScore: 85,
    },
    {
      date: '2024-01-02',
      workTime: 150,
      totalPomodoros: 6,
      breakTime: 25,
      tasksCompleted: 3,
      focusScore: 90,
    },
  ],
  totalPomodoros: 10,
  averageFocusScore: 87.5,
  mostProductiveDay: '2024-01-02',
}

describe('useWeeklyStats Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return weekly stats data when available', () => {
    mockGetWeeklyStats.mockReturnValue(mockWeeklyStatsData)
    
    const { result } = renderHook(() => useWeeklyStats())
    
    expect(result.current.weeklyStats).toEqual(mockWeeklyStatsData)
    expect(result.current.isEmptyWeek).toBe(false)
    expect(result.current.totalWorkTime).toBe(270) // 120 + 150
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should handle empty week data', () => {
    const emptyWeekData = {
      ...mockWeeklyStatsData,
      totalPomodoros: 0,
      dailyStats: [],
    }
    mockGetWeeklyStats.mockReturnValue(emptyWeekData)
    
    const { result } = renderHook(() => useWeeklyStats())
    
    expect(result.current.isEmptyWeek).toBe(true)
    expect(result.current.totalWorkTime).toBe(0)
  })

  it('should handle null data from store', () => {
    mockGetWeeklyStats.mockReturnValue(null)
    
    const { result } = renderHook(() => useWeeklyStats())
    
    expect(result.current.weeklyStats).toBe(null)
    expect(result.current.isEmptyWeek).toBe(true)
    expect(result.current.totalWorkTime).toBe(0)
    expect(result.current.error).toBe(null)
  })

  it('should handle invalid data format', () => {
    mockGetWeeklyStats.mockReturnValue({ invalid: 'data' })
    
    const { result } = renderHook(() => useWeeklyStats())
    
    expect(result.current.weeklyStats).toBe(null)
    expect(result.current.isEmptyWeek).toBe(true)
    expect(result.current.error).toBe('Invalid data format')
  })

  it('should handle store errors gracefully', () => {
    mockGetWeeklyStats.mockImplementation(() => {
      throw new Error('Store error')
    })
    
    const { result } = renderHook(() => useWeeklyStats())
    
    expect(result.current.weeklyStats).toBe(null)
    expect(result.current.isEmptyWeek).toBe(true)
    // Error is handled internally and logged, hook returns null for error
    expect(result.current.error).toBe(null)
  })

  it('should provide refetch function', () => {
    mockGetWeeklyStats.mockReturnValue(mockWeeklyStatsData)
    
    const { result } = renderHook(() => useWeeklyStats())
    
    expect(result.current.refetch).toBeInstanceOf(Function)
  })

  it('should calculate weekStart as Date object', () => {
    mockGetWeeklyStats.mockReturnValue(mockWeeklyStatsData)
    
    const { result } = renderHook(() => useWeeklyStats())
    
    expect(result.current.weekStart).toBeInstanceOf(Date)
    expect(result.current.weekStart.toISOString().split('T')[0]).toBe('2024-01-01')
  })
})

describe('useFormattedStatValues Hook', () => {
  it('should format stat values correctly', () => {
    const { result } = renderHook(() => 
      useFormattedStatValues(mockWeeklyStatsData, 270)
    )
    
    expect(result.current.totalWorkTimeFormatted).toBe('4h 30m')
    expect(result.current.totalPomodorosFormatted).toBe('10个')
    expect(result.current.averageFocusScoreFormatted).toBe('88分')
  })

  it('should handle null weekly stats', () => {
    const { result } = renderHook(() => 
      useFormattedStatValues(null, 0)
    )
    
    expect(result.current.totalWorkTimeFormatted).toBe('0h 0m')
    expect(result.current.totalPomodorosFormatted).toBe('0个')
    expect(result.current.averageFocusScoreFormatted).toBe('0分')
  })

  it('should round average focus score', () => {
    const statsWithDecimal = {
      ...mockWeeklyStatsData,
      averageFocusScore: 87.6,
    }
    
    const { result } = renderHook(() => 
      useFormattedStatValues(statsWithDecimal, 270)
    )
    
    expect(result.current.averageFocusScoreFormatted).toBe('88分')
  })
})
