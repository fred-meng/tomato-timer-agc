'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Square, RotateCcw } from 'lucide-react'
import { CircularProgress } from './CircularProgress'
import { usePomodoroClock } from '@/hooks/usePomodoroClock'
import { formatTime, cn } from '@/lib/utils'

export function TimerDisplay() {
  const { timer, start, pause, stop, reset, isRunning, isPaused, progress } = usePomodoroClock()
  
  const getSessionColor = () => {
    switch (timer.sessionType) {
      case 'work':
        return '#FF3B30' // iOS 红色
      case 'shortBreak':
        return '#34C759' // iOS 绿色  
      case 'longBreak':
        return '#007AFF' // iOS 蓝色
      default:
        return '#007AFF'
    }
  }
  
  const getSessionTitle = () => {
    switch (timer.sessionType) {
      case 'work':
        return '专注工作'
      case 'shortBreak':
        return '短休息'
      case 'longBreak':
        return '长休息'
      default:
        return '专注工作'
    }
  }
  
  const getSessionEmoji = () => {
    switch (timer.sessionType) {
      case 'work':
        return '🍅'
      case 'shortBreak':
        return '☕'
      case 'longBreak':
        return '🌟'
      default:
        return '🍅'
    }
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      {/* 会话类型指示器 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="text-4xl mb-2">{getSessionEmoji()}</div>
        <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">
          {getSessionTitle()}
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          第 {timer.sessionsCompleted + 1} 个番茄时段
        </div>
      </motion.div>
      
      {/* 圆形进度计时器 */}
      <CircularProgress
        progress={progress}
        size={320}
        strokeWidth={12}
        color={getSessionColor()}
        className="mb-8"
      >
        <div className="text-center">
          <motion.div
            key={timer.currentTime}
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-6xl font-light text-gray-900 dark:text-white mb-2"
            style={{ fontFeatureSettings: '"tnum"' }}
          >
            {formatTime(timer.currentTime)}
          </motion.div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {timer.isRunning ? '运行中' : timer.isPaused ? '已暂停' : '准备开始'}
          </div>
        </div>
      </CircularProgress>
      
      {/* 控制按钮 */}
      <div className="flex items-center space-x-4">
        {/* 主要控制按钮 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isRunning ? pause : start}
          className={cn(
            "flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-200",
            "backdrop-blur-sm border border-white/20",
            isRunning 
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          )}
          style={{
            background: isRunning 
              ? 'linear-gradient(135deg, #FF6B47 0%, #FF8E53 100%)'
              : 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)'
          }}
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
        </motion.button>
        
        {/* 停止按钮 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={stop}
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full",
            "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700",
            "text-gray-600 dark:text-gray-400 transition-all duration-200"
          )}
        >
          <Square size={18} />
        </motion.button>
        
        {/* 重置按钮 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={reset}
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full",
            "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700",
            "text-gray-600 dark:text-gray-400 transition-all duration-200"
          )}
        >
          <RotateCcw size={18} />
        </motion.button>
      </div>
      
      {/* 进度指示器 */}
      <div className="mt-8 flex items-center space-x-2">
        {Array.from({ length: 4 }, (_, i) => (
          <motion.div
            key={i}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              i < timer.sessionsCompleted
                ? "bg-green-500"
                : i === timer.sessionsCompleted && timer.sessionType === 'work'
                ? "bg-red-500"
                : "bg-gray-300 dark:bg-gray-600"
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}
      </div>
    </div>
  )
}
