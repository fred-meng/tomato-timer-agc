/**
 * Store 基础功能测试
 * 确保Store基本功能正常运行
 */

// Mock localStorage for persist middleware first
const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock zustand/middleware before importing store
jest.mock('zustand/middleware', () => ({
  persist: jest.fn((fn) => fn),
  createJSONStorage: jest.fn(() => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }))
}))

import { useAppStore } from '../store'

describe('Store Basic Coverage Tests', () => {
  beforeEach(() => {
    useAppStore.getState()
    jest.clearAllMocks()
  })

  it('should have initial state', () => {
    const state = useAppStore.getState()
    
    expect(state).toBeDefined()
    expect(state.timer).toBeDefined()
    expect(state.tasks).toBeDefined()
    expect(state.settings).toBeDefined()
    expect(state.ui).toBeDefined()
    expect(state.stats).toBeDefined()
  })

  it('should have timer actions', () => {
    const state = useAppStore.getState()
    
    expect(typeof state.startTimer).toBe('function')
    expect(typeof state.pauseTimer).toBe('function')
    expect(typeof state.stopTimer).toBe('function')
    expect(typeof state.updateTimer).toBe('function')
  })

  it('should have task actions', () => {
    const state = useAppStore.getState()
    
    expect(typeof state.addTask).toBe('function')
    expect(typeof state.updateTask).toBe('function')
    expect(typeof state.deleteTask).toBe('function')
    expect(typeof state.toggleTaskCompletion).toBe('function')
  })

  it('should have settings actions', () => {
    const state = useAppStore.getState()
    
    expect(typeof state.updateSettings).toBe('function')
  })

  it('should have UI actions', () => {
    const state = useAppStore.getState()
    
    expect(typeof state.setActiveTab).toBe('function')
    expect(typeof state.toggleSettings).toBe('function')
    expect(typeof state.toggleTaskModal).toBe('function')
  })

  it('should have stats actions', () => {
    const state = useAppStore.getState()
    
    expect(typeof state.addDailyStats).toBe('function')
    expect(typeof state.updateDailyStats).toBe('function')
    expect(typeof state.getTodayStats).toBe('function')
    expect(typeof state.getWeeklyStats).toBe('function')
    expect(typeof state.getMonthlyStats).toBe('function')
  })
})
