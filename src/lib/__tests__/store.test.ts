/**
 * Store 模块测试
 * 测试Zustand store的所有actions和状态管理
 */

import { useAppStore } from '../store'
import { Priority } from '@/types'
import type { Task, PomodoroSession, UserSettings, DailyStats } from '@/types'

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock date-fns functions
jest.mock('date-fns', () => ({
  startOfWeek: jest.fn((date) => new Date('2024-09-01')), // Mock Monday start
  startOfMonth: jest.fn((date) => new Date('2024-09-01')),
  endOfMonth: jest.fn((date) => new Date('2024-09-30')),
  subDays: jest.fn((date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'yyyy-MM-dd') {
      return '2024-09-01'
    }
    return '2024-09-01'
  }),
  eachDayOfInterval: jest.fn(() => [new Date('2024-09-01'), new Date('2024-09-02')])
}))

describe('Store - Timer Actions', () => {
  beforeEach(() => {
    // Reset store state
    useAppStore.setState({
      timer: {
        isRunning: false,
        isPaused: false,
        currentTime: 25 * 60,
        totalTime: 25 * 60,
        sessionType: 'work',
        sessionsCompleted: 0
      },
      tasks: [],
      pomodoroSessions: [],
      settings: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 4,
        soundEnabled: true,
        notificationsEnabled: true,
        vibrationEnabled: true,
        theme: 'system' as const,
        autoStartBreaks: false,
        autoStartPomodoros: false
      },
      stats: { daily: [], weekly: [] },
      ui: { activeTab: 'timer', isSettingsOpen: false, isTaskModalOpen: false }
    }, true)
  })

  describe('Timer Actions', () => {
    it('startTimer should set timer running', () => {
      const { startTimer, timer } = useAppStore.getState()
      
      startTimer()
      
      const newState = useAppStore.getState()
      expect(newState.timer.isRunning).toBe(true)
      expect(newState.timer.isPaused).toBe(false)
    })

    it('pauseTimer should pause timer', () => {
      const { startTimer, pauseTimer } = useAppStore.getState()
      
      startTimer()
      pauseTimer()
      
      const newState = useAppStore.getState()
      expect(newState.timer.isRunning).toBe(false)
      expect(newState.timer.isPaused).toBe(true)
    })

    it('stopTimer should reset timer', () => {
      const { startTimer, stopTimer, settings } = useAppStore.getState()
      
      startTimer()
      stopTimer()
      
      const newState = useAppStore.getState()
      expect(newState.timer.isRunning).toBe(false)
      expect(newState.timer.isPaused).toBe(false)
      expect(newState.timer.currentTime).toBe(settings.workDuration * 60)
      expect(newState.timer.sessionsCompleted).toBe(0)
    })

    it('updateTimer should update current time', () => {
      const { updateTimer } = useAppStore.getState()
      const newTime = 1200 // 20分钟
      
      updateTimer(newTime)
      
      const newState = useAppStore.getState()
      expect(newState.timer.currentTime).toBe(newTime)
    })

    it('completeSession should advance to break after work', () => {
      const { completeSession } = useAppStore.getState()
      
      // Mock work session completed
      useAppStore.setState({
        timer: {
          isRunning: false,
          isPaused: false,
          currentTime: 0,
          totalTime: 25 * 60,
          sessionType: 'work',
          sessionsCompleted: 0
        }
      })
      
      completeSession()
      
      const newState = useAppStore.getState()
      expect(newState.timer.sessionType).toBe('shortBreak')
      expect(newState.timer.sessionsCompleted).toBe(1)
    })

    it('completeSession should advance to long break after interval', () => {
      const { completeSession, settings } = useAppStore.getState()
      
      // Mock 4th work session (should trigger long break)
      useAppStore.setState({
        timer: {
          isRunning: false,
          isPaused: false,
          currentTime: 0,
          totalTime: 25 * 60,
          sessionType: 'work',
          sessionsCompleted: 3 // 4th session when incremented
        }
      })
      
      completeSession()
      
      const newState = useAppStore.getState()
      expect(newState.timer.sessionType).toBe('longBreak')
      expect(newState.timer.currentTime).toBe(settings.longBreakDuration * 60)
    })

    it('completeSession should advance to work after break', () => {
      const { completeSession, settings } = useAppStore.getState()
      
      // Mock break session completed
      useAppStore.setState({
        timer: {
          isRunning: false,
          isPaused: false,
          currentTime: 0,
          totalTime: 5 * 60,
          sessionType: 'shortBreak',
          sessionsCompleted: 1
        }
      })
      
      completeSession()
      
      const newState = useAppStore.getState()
      expect(newState.timer.sessionType).toBe('work')
      expect(newState.timer.currentTime).toBe(settings.workDuration * 60)
      expect(newState.timer.sessionsCompleted).toBe(1) // Should not increment after break
    })
  })

  describe('Task Actions', () => {
    it('addTask should add new task', () => {
      const { addTask } = useAppStore.getState()
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        estimatedPomodoros: 2,
        priority: Priority.MEDIUM,
        completed: false,
        pomodorosUsed: 0
      }
      
      addTask(taskData)
      
      const newState = useAppStore.getState()
      expect(newState.tasks).toHaveLength(1)
      expect(newState.tasks[0].title).toBe('Test Task')
      expect(newState.tasks[0].completed).toBe(false)
      expect(newState.tasks[0].pomodorosUsed).toBe(0)
    })

    it('updateTask should update existing task', () => {
      const { addTask, updateTask } = useAppStore.getState()
      const taskData = {
        title: 'Original Task',
        description: 'Original Description',
        estimatedPomodoros: 1,
        priority: Priority.LOW,
        completed: false,
        pomodorosUsed: 0
      }
      
      addTask(taskData)
      const taskId = useAppStore.getState().tasks[0].id
      
      updateTask(taskId, { title: 'Updated Task', priority: Priority.HIGH })
      
      const newState = useAppStore.getState()
      expect(newState.tasks[0].title).toBe('Updated Task')
      expect(newState.tasks[0].priority).toBe(Priority.HIGH)
      expect(newState.tasks[0].description).toBe('Original Description') // Should remain unchanged
    })

    it('deleteTask should remove task', () => {
      const { addTask, deleteTask } = useAppStore.getState()
      const taskData = {
        title: 'Task to Delete',
        description: '',
        estimatedPomodoros: 1,
        priority: Priority.MEDIUM,
        completed: false,
        pomodorosUsed: 0
      }
      
      addTask(taskData)
      const taskId = useAppStore.getState().tasks[0].id
      
      deleteTask(taskId)
      
      const newState = useAppStore.getState()
      expect(newState.tasks).toHaveLength(0)
    })

    it('toggleTaskCompletion should toggle completion status', () => {
      const { addTask, toggleTaskCompletion } = useAppStore.getState()
      const taskData = {
        title: 'Task to Complete',
        description: '',
        estimatedPomodoros: 1,
        priority: Priority.MEDIUM,
        completed: false,
        pomodorosUsed: 0
      }
      
      addTask(taskData)
      const taskId = useAppStore.getState().tasks[0].id
      
      toggleTaskCompletion(taskId)
      
      let newState = useAppStore.getState()
      expect(newState.tasks[0].completed).toBe(true)
      expect(newState.tasks[0].completedAt).toBeDefined()
      
      // Toggle back
      toggleTaskCompletion(taskId)
      
      newState = useAppStore.getState()
      expect(newState.tasks[0].completed).toBe(false)
      expect(newState.tasks[0].completedAt).toBeUndefined()
    })
  })

  describe('Settings Actions', () => {
    it('updateSettings should update user settings', () => {
      const { updateSettings } = useAppStore.getState()
      
      updateSettings({
        workDuration: 30,
        soundEnabled: false,
        theme: 'dark'
      })
      
      const newState = useAppStore.getState()
      expect(newState.settings.workDuration).toBe(30)
      expect(newState.settings.soundEnabled).toBe(false)
      expect(newState.settings.theme).toBe('dark')
      expect(newState.settings.shortBreakDuration).toBe(5) // Should remain unchanged
    })

    it('updateSettings should update timer when work duration changes', () => {
      const { updateSettings } = useAppStore.getState()
      
      // Timer should be on work session and not running
      useAppStore.setState({
        timer: {
          isRunning: false,
          isPaused: false,
          currentTime: 25 * 60,
          totalTime: 25 * 60,
          sessionType: 'work',
          sessionsCompleted: 0
        }
      })
      
      updateSettings({ workDuration: 30 })
      
      const newState = useAppStore.getState()
      expect(newState.timer.currentTime).toBe(30 * 60)
      expect(newState.timer.totalTime).toBe(30 * 60)
    })

    it('updateSettings should not update timer when running', () => {
      const { updateSettings } = useAppStore.getState()
      
      // Timer should be running
      useAppStore.setState({
        timer: {
          isRunning: true,
          isPaused: false,
          currentTime: 1200, // 20 minutes left
          totalTime: 25 * 60,
          sessionType: 'work',
          sessionsCompleted: 0
        }
      })
      
      updateSettings({ workDuration: 30 })
      
      const newState = useAppStore.getState()
      expect(newState.timer.currentTime).toBe(1200) // Should remain unchanged
    })
  })

  describe('UI Actions', () => {
    it('setActiveTab should change active tab', () => {
      const { setActiveTab } = useAppStore.getState()
      
      setActiveTab('tasks')
      expect(useAppStore.getState().ui.activeTab).toBe('tasks')
      
      setActiveTab('stats')
      expect(useAppStore.getState().ui.activeTab).toBe('stats')
    })

    it('toggleSettings should toggle settings modal', () => {
      const { toggleSettings } = useAppStore.getState()
      
      expect(useAppStore.getState().ui.isSettingsOpen).toBe(false)
      
      toggleSettings()
      expect(useAppStore.getState().ui.isSettingsOpen).toBe(true)
      
      toggleSettings()
      expect(useAppStore.getState().ui.isSettingsOpen).toBe(false)
    })

    it('toggleTaskModal should toggle task modal', () => {
      const { toggleTaskModal } = useAppStore.getState()
      
      expect(useAppStore.getState().ui.isTaskModalOpen).toBe(false)
      
      toggleTaskModal()
      expect(useAppStore.getState().ui.isTaskModalOpen).toBe(true)
      
      toggleTaskModal()
      expect(useAppStore.getState().ui.isTaskModalOpen).toBe(false)
    })
  })

  describe('Stats Actions', () => {
    it('addDailyStats should add daily statistics', () => {
      const { addDailyStats } = useAppStore.getState()
      const stats: DailyStats = {
        date: '2024-09-01',
        workTime: 125,
        breakTime: 25,
        totalPomodoros: 5,
        focusScore: 85,
        tasksCompleted: 2
      }
      
      addDailyStats(stats)
      
      const newState = useAppStore.getState()
      expect(newState.stats.daily).toHaveLength(1)
      expect(newState.stats.daily[0]).toEqual(stats)
    })

    it('updateDailyStats should update existing stats', () => {
      const { addDailyStats, updateDailyStats } = useAppStore.getState()
      const stats: DailyStats = {
        date: '2024-09-01',
        workTime: 125,
        breakTime: 25,
        totalPomodoros: 5,
        focusScore: 85,
        tasksCompleted: 2
      }
      
      addDailyStats(stats)
      updateDailyStats('2024-09-01', { totalPomodoros: 6, focusScore: 90 })
      
      const newState = useAppStore.getState()
      expect(newState.stats.daily[0].totalPomodoros).toBe(6)
      expect(newState.stats.daily[0].focusScore).toBe(90)
      expect(newState.stats.daily[0].workTime).toBe(125) // Should remain unchanged
    })

    it('updateDailyStats should create new stats if date not found', () => {
      const { updateDailyStats } = useAppStore.getState()
      
      updateDailyStats('2024-09-02', { totalPomodoros: 3, focusScore: 75 })
      
      const newState = useAppStore.getState()
      expect(newState.stats.daily).toHaveLength(1)
      expect(newState.stats.daily[0].date).toBe('2024-09-02')
      expect(newState.stats.daily[0].totalPomodoros).toBe(3)
    })

    it('getTodayStats should calculate today statistics', () => {
      const { getTodayStats } = useAppStore.getState()
      
      // Mock today's tasks and sessions
      useAppStore.setState({
        tasks: [{
          id: 'task1',
          title: 'Test Task',
          description: '',
          estimatedPomodoros: 2,
          priority: Priority.MEDIUM,
          completed: true,
          completedAt: new Date(),
          createdAt: new Date(),
          pomodorosUsed: 2
        }],
        pomodoroSessions: [{
          id: 'session1',
          taskId: 'task1',
          type: 'work',
          startTime: new Date(),
          endTime: new Date(),
          completed: true,
          duration: 25 * 60
        }]
      })
      
      const stats = getTodayStats()
      
      expect(stats).toBeDefined()
      expect(stats?.totalPomodoros).toBeGreaterThanOrEqual(0)
      expect(stats?.tasksCompleted).toBeGreaterThanOrEqual(0)
    })

    it('getWeeklyStats should calculate weekly statistics', () => {
      const { getWeeklyStats } = useAppStore.getState()
      
      const stats = getWeeklyStats()
      
      expect(stats).toBeDefined()
      expect(stats?.weekStart).toBeDefined()
      expect(stats?.dailyStats).toBeInstanceOf(Array)
    })

    it('getMonthlyStats should calculate monthly statistics', () => {
      const { getMonthlyStats } = useAppStore.getState()
      
      const stats = getMonthlyStats()
      
      expect(stats).toBeDefined()
      expect(stats?.monthStart).toBeDefined()
      expect(stats?.dailyStats).toBeInstanceOf(Array)
      expect(stats?.totalPomodoros).toBeGreaterThanOrEqual(0)
    })

    it('getDailyTasksWithPomodoros should return tasks with pomodoro counts', () => {
      const { addTask, getDailyTasksWithPomodoros } = useAppStore.getState()
      
      // Add a task
      addTask({
        title: 'Test Task',
        description: '',
        estimatedPomodoros: 2,
        priority: Priority.MEDIUM,
        completed: false,
        pomodorosUsed: 0
      })
      
      const taskId = useAppStore.getState().tasks[0].id
      
      // Add pomodoro sessions for the task
      useAppStore.setState({
        pomodoroSessions: [{
          id: 'session1',
          taskId,
          type: 'work',
          startTime: new Date(),
          endTime: new Date(),
          completed: true,
          duration: 25 * 60
        }]
      })
      
      const tasksWithPomodoros = getDailyTasksWithPomodoros('2024-09-01')
      
      expect(tasksWithPomodoros).toHaveLength(1)
      expect(tasksWithPomodoros[0].pomodorosUsed).toBe(1)
      expect(tasksWithPomodoros[0].title).toBe('Test Task')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty tasks array', () => {
      const { getTodayStats } = useAppStore.getState()
      
      useAppStore.setState({ tasks: [], pomodoroSessions: [] })
      
      const stats = getTodayStats()
      expect(stats).toBeDefined()
      expect(stats?.totalPomodoros).toBe(0)
      expect(stats?.tasksCompleted).toBe(0)
    })

    it('should handle undefined pomodoro sessions', () => {
      const { getTodayStats } = useAppStore.getState()
      
      useAppStore.setState({ 
        tasks: [],
        pomodoroSessions: undefined as any
      })
      
      const stats = getTodayStats()
      expect(stats).toBeDefined()
    })

    it('should handle non-existent task updates', () => {
      const { updateTask } = useAppStore.getState()
      
      updateTask('non-existent-id', { title: 'Updated' })
      
      const newState = useAppStore.getState()
      expect(newState.tasks).toHaveLength(0) // Should remain empty
    })

    it('should handle non-existent task deletion', () => {
      const { deleteTask } = useAppStore.getState()
      
      deleteTask('non-existent-id')
      
      const newState = useAppStore.getState()
      expect(newState.tasks).toHaveLength(0) // Should remain empty
    })

    it('should handle non-existent task completion toggle', () => {
      const { toggleTaskCompletion } = useAppStore.getState()
      
      toggleTaskCompletion('non-existent-id')
      
      const newState = useAppStore.getState()
      expect(newState.tasks).toHaveLength(0) // Should remain empty
    })
  })
})
