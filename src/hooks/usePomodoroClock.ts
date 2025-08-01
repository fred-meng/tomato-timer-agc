import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { playNotificationSound, triggerVibration, sendNotification } from '@/lib/utils'

export function usePomodoroClock() {
  const {
    timer,
    settings,
    startTimer,
    pauseTimer,
    stopTimer,
    updateTimer,
    completeSession,
    updateDailyStats
  } = useAppStore()
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // 开始计时器
  const start = useCallback(() => {
    startTimer()
  }, [startTimer])
  
  // 暂停计时器
  const pause = useCallback(() => {
    pauseTimer()
  }, [pauseTimer])
  
  // 停止计时器
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    stopTimer()
  }, [stopTimer])
  
  // 重置计时器到当前会话的初始时间
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    let duration: number
    switch (timer.sessionType) {
      case 'work':
        duration = settings.workDuration * 60
        break
      case 'shortBreak':
        duration = settings.shortBreakDuration * 60
        break
      case 'longBreak':
        duration = settings.longBreakDuration * 60
        break
    }
    
    updateTimer(duration)
  }, [timer.sessionType, settings, updateTimer])
  
  // 处理会话完成
  const handleSessionComplete = useCallback(() => {
    // 播放音效
    if (settings.soundEnabled) {
      playNotificationSound(timer.sessionType === 'work' ? 'break' : 'work')
    }
    
    // 触发振动
    if (settings.vibrationEnabled) {
      triggerVibration([200, 100, 200, 100, 200])
    }
    
    // 发送通知
    if (settings.notificationsEnabled) {
      const isWorkCompleted = timer.sessionType === 'work'
      const title = isWorkCompleted ? '工作时段完成！' : '休息时段完成！'
      const body = isWorkCompleted 
        ? '是时候休息一下了 🌟' 
        : '准备开始下一个工作时段 🍅'
      
      sendNotification(title, body)
    }
    
    // 更新统计数据
    if (timer.sessionType === 'work') {
      const today = new Date().toISOString().split('T')[0]
      updateDailyStats(today, {
        totalPomodoros: 1,
        workTime: settings.workDuration
      })
    }
    
    // 完成会话并切换到下一个会话
    completeSession()
  }, [
    timer.sessionType,
    settings,
    updateDailyStats,
    completeSession
  ])
  
  // 主计时器效果
  useEffect(() => {
    if (timer.isRunning && !timer.isPaused) {
      intervalRef.current = setInterval(() => {
        updateTimer(Math.max(0, timer.currentTime - 1))
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timer.isRunning, timer.isPaused, timer.currentTime, updateTimer])
  
  // 检查会话是否完成
  useEffect(() => {
    if (timer.currentTime === 0 && timer.isRunning) {
      handleSessionComplete()
    }
  }, [timer.currentTime, timer.isRunning, handleSessionComplete])
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])
  
  return {
    timer,
    start,
    pause,
    stop,
    reset,
    isRunning: timer.isRunning && !timer.isPaused,
    isPaused: timer.isPaused,
    progress: 1 - (timer.currentTime / timer.totalTime)
  }
}
