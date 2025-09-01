/**
 * usePomodoroClock hook 测试
 */

import { renderHook, act } from '@testing-library/react'
import { usePomodoroClock } from '../usePomodoroClock'

// Mock store
const mockStartTimer = jest.fn()
const mockPauseTimer = jest.fn()
const mockStopTimer = jest.fn()
const mockUpdateTimer = jest.fn()
const mockCompleteSession = jest.fn()
const mockUpdateDailyStats = jest.fn()

jest.mock('@/lib/store', () => ({
  useAppStore: () => ({
    timer: {
      sessionType: 'work',
      currentTime: 1500,
      totalTime: 1500, // Add totalTime for progress calculation
      isRunning: false,
      isPaused: false,
      sessionsCompleted: 0,
    },
    settings: {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      soundEnabled: true,
      vibrationEnabled: true,
      notificationsEnabled: true,
    },
    startTimer: mockStartTimer,
    pauseTimer: mockPauseTimer,
    stopTimer: mockStopTimer,
    updateTimer: mockUpdateTimer,
    completeSession: mockCompleteSession,
    updateDailyStats: mockUpdateDailyStats,
  }),
}))

// Mock utils
jest.mock('@/lib/utils', () => ({
  playNotificationSound: jest.fn(),
  triggerVibration: jest.fn(),
  sendNotification: jest.fn(),
}))

describe('usePomodoroClock Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should provide timer control functions', () => {
    const { result } = renderHook(() => usePomodoroClock())
    
    expect(result.current.start).toBeInstanceOf(Function)
    expect(result.current.pause).toBeInstanceOf(Function)
    expect(result.current.stop).toBeInstanceOf(Function)
    expect(result.current.reset).toBeInstanceOf(Function)
  })

  it('should provide timer state', () => {
    const { result } = renderHook(() => usePomodoroClock())
    
    expect(result.current.timer).toBeDefined()
    expect(result.current.isRunning).toBe(false)
    expect(result.current.isPaused).toBe(false)
  })

  it('should call startTimer when start is called', () => {
    const { result } = renderHook(() => usePomodoroClock())
    
    act(() => {
      result.current.start()
    })
    
    expect(mockStartTimer).toHaveBeenCalledTimes(1)
  })

  it('should call pauseTimer when pause is called', () => {
    const { result } = renderHook(() => usePomodoroClock())
    
    act(() => {
      result.current.pause()
    })
    
    expect(mockPauseTimer).toHaveBeenCalledTimes(1)
  })

  it('should call stopTimer when stop is called', () => {
    const { result } = renderHook(() => usePomodoroClock())
    
    act(() => {
      result.current.stop()
    })
    
    expect(mockStopTimer).toHaveBeenCalledTimes(1)
  })

  it('should calculate progress correctly', () => {
    const { result } = renderHook(() => usePomodoroClock())
    
    // Progress should be a number between 0 and 1
    expect(typeof result.current.progress).toBe('number')
    expect(result.current.progress).toBeGreaterThanOrEqual(0)
    expect(result.current.progress).toBeLessThanOrEqual(1)
  })

  it('should have consistent timer state', () => {
    const { result } = renderHook(() => usePomodoroClock())
    
    expect(result.current.timer.sessionType).toBe('work')
    expect(result.current.timer.currentTime).toBe(1500)
    expect(result.current.timer.isRunning).toBe(false)
    expect(result.current.timer.isPaused).toBe(false)
  })
})
