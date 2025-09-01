import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AppState, PomodoroTimer, Task, UserSettings, DailyStats, WeeklyStats, MonthlyStats } from '@/types'
import { generateId, getTodayString } from '@/lib/utils'
import { calculateTodayStats, calculateWeeklyStats } from '@/lib/statsCalculator'
import { startOfWeek, startOfMonth, endOfMonth, subDays, format, eachDayOfInterval } from 'date-fns'

interface AppStore extends AppState {
  // Timer actions
  startTimer: () => void
  pauseTimer: () => void
  stopTimer: () => void
  updateTimer: (time: number) => void
  completeSession: () => void
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTaskCompletion: (id: string) => void
  
  // Settings actions
  updateSettings: (settings: Partial<UserSettings>) => void
  
  // UI actions
  setActiveTab: (tab: 'timer' | 'tasks' | 'stats') => void
  toggleSettings: () => void
  toggleTaskModal: () => void
  
  // Stats actions
  addDailyStats: (stats: DailyStats) => void
  updateDailyStats: (date: string, updates: Partial<DailyStats>) => void
  getTodayStats: () => DailyStats | null
  getWeeklyStats: (weekStart?: Date) => WeeklyStats | null
  getMonthlyStats: (monthStart?: Date) => MonthlyStats | null
  getDailyTasksWithPomodoros: (date: string) => (Task & { pomodorosUsed: number })[]
}

const defaultSettings: UserSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  notificationsEnabled: true,
  vibrationEnabled: true,
  theme: 'system',
  autoStartBreaks: false,
  autoStartPomodoros: false
}

const defaultTimer: PomodoroTimer = {
  isRunning: false,
  isPaused: false,
  currentTime: 25 * 60, // 25分钟
  totalTime: 25 * 60,
  sessionType: 'work',
  sessionsCompleted: 0
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      timer: defaultTimer,
      tasks: [],
      pomodoroSessions: [],
      settings: defaultSettings,
      stats: {
        daily: [],
        weekly: []
      },
      ui: { activeTab: 'timer', isSettingsOpen: false, isTaskModalOpen: false },
      
      // Timer actions
      startTimer: () => {
        set(state => ({
          timer: {
            ...state.timer,
            isRunning: true,
            isPaused: false
          }
        }))
      },
      
      pauseTimer: () => {
        set(state => ({
          timer: {
            ...state.timer,
            isRunning: false,
            isPaused: true
          }
        }))
      },
      
      stopTimer: () => {
        const { settings } = get()
        set(state => ({
          timer: {
            ...defaultTimer,
            currentTime: settings.workDuration * 60,
            totalTime: settings.workDuration * 60,
            sessionsCompleted: 0
          }
        }))
      },
      
      updateTimer: (time: number) => {
        set(state => ({
          timer: {
            ...state.timer,
            currentTime: time
          }
        }))
      },
      
      completeSession: () => {
        const { timer, settings } = get()
        const nextSessionsCompleted = timer.sessionsCompleted + 1
        let nextSessionType: 'work' | 'shortBreak' | 'longBreak'
        let nextDuration: number
        
        if (timer.sessionType === 'work') {
          // 完成工作时段，进入休息
          if (nextSessionsCompleted % settings.longBreakInterval === 0) {
            nextSessionType = 'longBreak'
            nextDuration = settings.longBreakDuration * 60
          } else {
            nextSessionType = 'shortBreak'
            nextDuration = settings.shortBreakDuration * 60
          }
        } else {
          // 完成休息时段，进入工作
          nextSessionType = 'work'
          nextDuration = settings.workDuration * 60
        }
        
        set(state => ({
          timer: {
            ...state.timer,
            isRunning: settings.autoStartPomodoros || settings.autoStartBreaks,
            currentTime: nextDuration,
            totalTime: nextDuration,
            sessionType: nextSessionType,
            sessionsCompleted: timer.sessionType === 'work' ? nextSessionsCompleted : timer.sessionsCompleted
          }
        }))
      },
      
      // Task actions
      addTask: (taskData) => set((state) => ({
        tasks: [
          ...state.tasks,
          {
            ...taskData,
            id: new Date().toISOString(),
            createdAt: new Date(),
            pomodorosUsed: 0,
            completed: false,
          },
        ],
      })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        ),
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      })),
      toggleTaskCompletion: (id) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? new Date() : undefined
          } : task
        ),
      })),

      // Settings actions
      updateSettings: (newSettings) => {
        set(state => {
          const updatedSettings = { ...state.settings, ...newSettings }
          
          // 如果工作时长设置改变了，更新计时器
          let updatedTimer = state.timer
          if (newSettings.workDuration && state.timer.sessionType === 'work' && !state.timer.isRunning) {
            updatedTimer = {
              ...state.timer,
              currentTime: newSettings.workDuration * 60,
              totalTime: newSettings.workDuration * 60
            }
          }
          
          return {
            settings: updatedSettings,
            timer: updatedTimer
          }
        })
      },
      
      // UI actions
      setActiveTab: (tab) => {
        set(state => ({
          ui: { ...state.ui, activeTab: tab }
        }))
      },
      
      toggleSettings: () => {
        set(state => ({
          ui: { ...state.ui, isSettingsOpen: !state.ui.isSettingsOpen }
        }))
      },
      
      toggleTaskModal: () => {
        set(state => ({
          ui: { ...state.ui, isTaskModalOpen: !state.ui.isTaskModalOpen }
        }))
      },
      
      // Stats actions
      addDailyStats: (stats) => {
        set(state => ({
          stats: {
            ...state.stats,
            daily: [...state.stats.daily, stats]
          }
        }))
      },
      
      updateDailyStats: (date, updates) => {
        set(state => {
          const existingIndex = state.stats.daily.findIndex(s => s.date === date)
          if (existingIndex >= 0) {
            const updatedDaily = [...state.stats.daily]
            updatedDaily[existingIndex] = { ...updatedDaily[existingIndex], ...updates }
            return {
              stats: {
                ...state.stats,
                daily: updatedDaily
              }
            }
          } else {
            return {
              stats: {
                ...state.stats,
                daily: [...state.stats.daily, { date, ...updates } as DailyStats]
              }
            }
          }
        })
      },

      getTodayStats: () => {
        const state = get()
        return calculateTodayStats(state.tasks, state.pomodoroSessions || [])
      },

      getWeeklyStats: (weekStart?: Date) => {
        const state = get()
        const today = weekStart || new Date()
        const weekStartDate = startOfWeek(today, { weekStartsOn: 1 }) // 周一开始
        
        // 生成最近7天的每日统计数据
        const dailyStats: DailyStats[] = []
        for (let i = 0; i < 7; i++) {
          const date = subDays(weekStartDate, -i)
          const dateStr = format(date, 'yyyy-MM-dd')
          
          // 获取当天的任务和会话数据
          const dayTasks = state.tasks.filter(task => {
            if (!task.completedAt) return false
            const completedDate = format(new Date(task.completedAt), 'yyyy-MM-dd')
            return completedDate === dateStr
          })
          
          const daySessions = (state.pomodoroSessions || []).filter(session => {
            if (!session.startTime) return false
            const sessionDate = format(new Date(session.startTime), 'yyyy-MM-dd')
            return sessionDate === dateStr
          })
          
          // 计算当天统计数据
          const dayStats = calculateTodayStats(dayTasks, daySessions)
          dayStats.date = dateStr
          dailyStats.push(dayStats)
        }
        
        return calculateWeeklyStats(dailyStats, weekStartDate)
      },

      getMonthlyStats: (monthStart?: Date) => {
        const state = get()
        const today = monthStart || new Date()
        const monthStartDate = startOfMonth(today)
        const monthEndDate = endOfMonth(today)
        
        // 生成整个月的每日统计数据
        const monthDays = eachDayOfInterval({ start: monthStartDate, end: monthEndDate })
        const dailyStats: DailyStats[] = []
        
        monthDays.forEach(date => {
          const dateStr = format(date, 'yyyy-MM-dd')
          
          // 获取当天的任务和会话数据
          const dayTasks = state.tasks.filter(task => {
            if (!task.completedAt) return false
            const completedDate = format(new Date(task.completedAt), 'yyyy-MM-dd')
            return completedDate === dateStr
          })
          
          const daySessions = (state.pomodoroSessions || []).filter(session => {
            if (!session.startTime) return false
            const sessionDate = format(new Date(session.startTime), 'yyyy-MM-dd')
            return sessionDate === dateStr
          })
          
          // 计算当天统计数据
          const dayStats = calculateTodayStats(dayTasks, daySessions)
          dayStats.date = dateStr
          dailyStats.push(dayStats)
        })
        
        // 计算月度统计
        const totalPomodoros = dailyStats.reduce((sum, day) => sum + day.totalPomodoros, 0)
        const averageFocusScore = dailyStats.length > 0 
          ? dailyStats.reduce((sum, day) => sum + day.focusScore, 0) / dailyStats.length 
          : 0
        
        const mostProductiveDay = dailyStats.reduce((max, day) => 
          day.totalPomodoros > max.totalPomodoros ? day : max, 
          dailyStats[0] || { date: format(monthStartDate, 'yyyy-MM-dd'), totalPomodoros: 0 }
        )
        
        return {
          monthStart: format(monthStartDate, 'yyyy-MM-dd'),
          dailyStats,
          totalPomodoros,
          averageFocusScore,
          mostProductiveDay: mostProductiveDay.date
        } as MonthlyStats
      },

      getDailyTasksWithPomodoros: (date: string) => {
        const state = get()
        
        // 获取指定日期的番茄钟会话
        const daySessions = (state.pomodoroSessions || []).filter(session => {
          if (!session.startTime || !session.completed) return false
          const sessionDate = format(new Date(session.startTime), 'yyyy-MM-dd')
          return sessionDate === date && session.type === 'work'
        })
        
        // 统计每个任务的番茄钟数量
        const taskPomodoroCount: Record<string, number> = {}
        daySessions.forEach(session => {
          if (session.taskId) {
            taskPomodoroCount[session.taskId] = (taskPomodoroCount[session.taskId] || 0) + 1
          }
        })
        
        // 获取今天有番茄钟记录的任务
        const tasksWithPomodoros = state.tasks
          .filter(task => taskPomodoroCount[task.id] > 0)
          .map(task => ({
            ...task,
            pomodorosUsed: taskPomodoroCount[task.id]
          }))
          .sort((a, b) => b.pomodorosUsed - a.pomodorosUsed) // 按番茄钟数量降序排列
        
        return tasksWithPomodoros
      }
    }),
    {
      name: 'tomato-timer-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        settings: state.settings,
        stats: state.stats
      })
    }
  )
)
