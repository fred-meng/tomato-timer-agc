// 番茄计时器相关类型
export interface PomodoroSession {
  id: string
  type: 'work' | 'shortBreak' | 'longBreak'
  duration: number // 分钟
  startTime: Date
  endTime?: Date
  taskId?: string
  completed: boolean
}

export interface PomodoroTimer {
  isRunning: boolean
  isPaused: boolean
  currentTime: number // 秒
  totalTime: number // 秒
  sessionType: 'work' | 'shortBreak' | 'longBreak'
  sessionsCompleted: number
  currentSession?: PomodoroSession
}

// 任务相关类型
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  estimatedPomodoros: number;
  pomodorosUsed: number;
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

// 统计相关类型
export interface DailyStats {
  date: string // YYYY-MM-DD
  totalPomodoros: number
  workTime: number // 分钟
  breakTime: number // 分钟
  tasksCompleted: number
  focusScore: number // 0-100
}

export interface WeeklyStats {
  weekStart: string // YYYY-MM-DD
  dailyStats: DailyStats[]
  totalPomodoros: number
  averageFocusScore: number
  mostProductiveDay: string
}

export interface MonthlyStats {
  monthStart: string // YYYY-MM-DD
  dailyStats: DailyStats[]
  totalPomodoros: number
  averageFocusScore: number
  mostProductiveDay: string
}

// 用户设置类型
export interface UserSettings {
  workDuration: number // 分钟，默认25
  shortBreakDuration: number // 分钟，默认5
  longBreakDuration: number // 分钟，默认15
  longBreakInterval: number // 每几个番茄后长休息，默认4
  soundEnabled: boolean
  notificationsEnabled: boolean
  vibrationEnabled: boolean
  theme: 'light' | 'dark' | 'system'
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
}

// API响应类型
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 应用状态类型
export interface AppState {
  timer: PomodoroTimer
  tasks: Task[]
  pomodoroSessions: PomodoroSession[]
  settings: UserSettings
  stats: {
    daily: DailyStats[]
    weekly: WeeklyStats[]
  }
  ui: {
    activeTab: 'timer' | 'tasks' | 'stats'
    isSettingsOpen: boolean
    isTaskModalOpen: boolean
  }
}
