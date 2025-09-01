/**
 * REQ-TM-S05: 查看周/月度数据摘要组件
 * 功能：显示周度和月度数据摘要，支持时间导航
 * 
 * 主要功能：
 * 1. 周视图/月视图切换
 * 2. 时间导航（上一周/月，下一周/月）
 * 3. 数据展示（专注时间、番茄钟数、完成任务等）
 * 4. 响应式设计和无障碍访问
 */

import React, { useState, useCallback, useMemo } from 'react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, addWeeks, subMonths, addMonths } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useAppStore } from '@/lib/store'
import { WeeklyStats, MonthlyStats } from '@/types'

export interface PeriodSummaryProps {
  /** 视图变化回调 */
  onViewChange?: (view: 'week' | 'month') => void
  /** 导航回调 */
  onNavigate?: (direction: 'prev' | 'next', newPeriod: Date) => void
  /** 初始视图 */
  defaultView?: 'week' | 'month'
  /** 初始时间 */
  defaultPeriod?: Date
}

const PeriodSummary: React.FC<PeriodSummaryProps> = ({
  onViewChange,
  onNavigate,
  defaultView = 'week',
  defaultPeriod = new Date()
}) => {
  const [currentView, setCurrentView] = useState<'week' | 'month'>(defaultView)
  const [currentPeriod, setCurrentPeriod] = useState<Date>(defaultPeriod)
  const [isLoading, setIsLoading] = useState(false)

  const { getWeeklyStats, getMonthlyStats } = useAppStore()

  // 处理视图切换
  const handleViewChange = useCallback((view: 'week' | 'month') => {
    try {
      setCurrentView(view)
      onViewChange?.(view)
    } catch (error) {
      console.error('视图切换出错:', error)
    }
  }, [onViewChange])

  // 处理时间导航
  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    try {
      const newPeriod = direction === 'prev' 
        ? (currentView === 'week' ? subWeeks(currentPeriod, 1) : subMonths(currentPeriod, 1))
        : (currentView === 'week' ? addWeeks(currentPeriod, 1) : addMonths(currentPeriod, 1))
      
      setCurrentPeriod(newPeriod)
      onNavigate?.(direction, newPeriod)
    } catch (error) {
      console.error('导航出错:', error)
    }
  }, [currentView, currentPeriod, onNavigate])

  // 处理键盘事件
  const handleKeyDown = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      action()
    }
  }, [])

  // 获取当前周/月的统计数据
  const currentStats = useMemo(() => {
    try {
      if (currentView === 'week') {
        return getWeeklyStats(currentPeriod)
      } else {
        return getMonthlyStats(currentPeriod)
      }
    } catch (error) {
      console.error('获取统计数据出错:', error)
      return null
    }
  }, [currentView, currentPeriod, getWeeklyStats, getMonthlyStats])

  // 计算显示的标题和时间范围
  const { title, dateRange } = useMemo(() => {
    try {
      if (currentView === 'week') {
        const weekStart = startOfWeek(currentPeriod, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(currentPeriod, { weekStartsOn: 1 })
        return {
          title: '本周数据摘要',
          dateRange: `${format(weekStart, 'M月d日', { locale: zhCN })} - ${format(weekEnd, 'M月d日', { locale: zhCN })}`
        }
      } else {
        const monthStart = startOfMonth(currentPeriod)
        return {
          title: '本月数据摘要', 
          dateRange: format(monthStart, 'yyyy年M月', { locale: zhCN })
        }
      }
    } catch (error) {
      console.error('计算标题出错:', error)
      return {
        title: currentView === 'week' ? '本周数据摘要' : '本月数据摘要',
        dateRange: '数据计算出错'
      }
    }
  }, [currentView, currentPeriod])

  // 加载状态检查
  if (isLoading || !currentStats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">数据加载中...</p>
        </div>
      </div>
    );
  }

  // 计算统计数据显示
  const displayStats = useMemo(() => {
    if (!currentStats) {
      return {
        totalPomodoros: 0,
        averageFocusTime: '0分钟',
        focusDays: 0,
        completedTasks: 0,
        averageFocusScore: 0
      }
    }

    const focusDays = currentStats.dailyStats.filter(day => day.workTime > 0).length
    const totalFocusTime = currentStats.dailyStats.reduce((sum, day) => sum + day.workTime, 0)
    const averageFocusTime = focusDays > 0 ? Math.round(totalFocusTime / focusDays) : 0
    const completedTasks = currentStats.dailyStats.reduce((sum, day) => sum + day.tasksCompleted, 0)

    return {
      totalPomodoros: currentStats.totalPomodoros,
      averageFocusTime: averageFocusTime > 60 
        ? `${Math.floor(averageFocusTime / 60)}小时${averageFocusTime % 60}分钟`
        : `${averageFocusTime}分钟`,
      focusDays,
      completedTasks,
      averageFocusScore: Math.round(currentStats.averageFocusScore)
    }
  }, [currentStats])

  return (
    <div 
      data-testid="period-summary-container"
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
      role="region"
      aria-label="周月度数据摘要"
    >
      {/* 视图选择器 */}
      <div 
        data-testid="period-view-selector"
        className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-6"
        role="tablist"
        aria-label="视图选择"
      >
        <button
          data-testid="week-view-button"
          onClick={() => handleViewChange('week')}
          onKeyDown={(e) => handleKeyDown(e, () => handleViewChange('week'))}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            currentView === 'week'
              ? 'bg-blue-600 text-white shadow-sm active'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
          tabIndex={0}
          role="tab"
          aria-selected={currentView === 'week'}
          aria-pressed={currentView === 'week'}
          aria-controls="summary-content"
        >
          周视图
        </button>
        <button
          data-testid="month-view-button"
          onClick={() => handleViewChange('month')}
          onKeyDown={(e) => handleKeyDown(e, () => handleViewChange('month'))}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            currentView === 'month'
              ? 'bg-blue-600 text-white shadow-sm active'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
          tabIndex={0}
          role="tab"
          aria-selected={currentView === 'month'}
          aria-pressed={currentView === 'month'}
          aria-controls="summary-content"
        >
          月视图
        </button>
      </div>

      {/* 内容区域 */}
      <div id="summary-content" role="tabpanel">
        {currentView === 'week' ? (
          <div data-testid="weekly-summary-content">
            {/* 周视图标题 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 
                  data-testid="current-week-title"
                  className="text-xl font-semibold text-gray-900 dark:text-white"
                >
                  {dateRange}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {title}
                </p>
              </div>
              
              {/* 导航按钮 */}
              <div className="flex items-center space-x-2">
                <button
                  data-testid="previous-week-button"
                  onClick={() => handleNavigate('prev')}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="上一周"
                  tabIndex={0}
                >
                  ←
                </button>
                <button
                  data-testid="next-week-button"
                  onClick={() => handleNavigate('next')}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="下一周"
                  tabIndex={0}
                >
                  →
                </button>
              </div>
            </div>

            {/* 周度数据展示 */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400">数据加载中...</div>
              </div>
            ) : currentStats && displayStats.totalPomodoros > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                  <div 
                    data-testid="weekly-average-focus-time"
                    className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                    role="text"
                    aria-label={`平均专注时间${displayStats.averageFocusTime}`}
                  >
                    {displayStats.averageFocusTime}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">平均专注</div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                  <div 
                    data-testid="weekly-total-pomodoros"
                    className="text-2xl font-bold text-green-600 dark:text-green-400"
                    role="text"
                    aria-label={`本周完成${displayStats.totalPomodoros}个番茄钟`}
                  >
                    {displayStats.totalPomodoros}个
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">番茄钟</div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                  <div 
                    data-testid="weekly-focus-days"
                    className="text-2xl font-bold text-purple-600 dark:text-purple-400"
                    role="text"
                    aria-label={`本周有${displayStats.focusDays}天专注学习`}
                  >
                    {displayStats.focusDays}天
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">专注天数</div>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center">
                  <div 
                    data-testid="weekly-total-tasks"
                    className="text-2xl font-bold text-orange-600 dark:text-orange-400"
                    role="text"
                    aria-label={`本周完成${displayStats.completedTasks}个任务`}
                  >
                    {displayStats.completedTasks}个
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">完成任务</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400 mb-2">本周还没有专注记录</div>
                <div className="text-sm text-gray-400 dark:text-gray-500">开始使用番茄钟来记录你的专注时间吧！</div>
              </div>
            )}
          </div>
        ) : (
          <div data-testid="monthly-summary-content">
            {/* 月视图标题 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 
                  data-testid="current-month-title"
                  className="text-xl font-semibold text-gray-900 dark:text-white"
                >
                  {dateRange}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {title}
                </p>
              </div>
              
              {/* 导航按钮 */}
              <div className="flex items-center space-x-2">
                <button
                  data-testid="previous-month-button"
                  onClick={() => handleNavigate('prev')}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="上一月"
                  tabIndex={0}
                >
                  ←
                </button>
                <button
                  data-testid="next-month-button"
                  onClick={() => handleNavigate('next')}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="下一月"
                  tabIndex={0}
                >
                  →
                </button>
              </div>
            </div>

            {/* 月度数据展示 */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400">正在加载数据...</div>
              </div>
            ) : currentStats && displayStats.totalPomodoros > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                  <div 
                    data-testid="monthly-average-focus-time"
                    className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                    role="text"
                    aria-label={`月平均专注时间${displayStats.averageFocusTime}`}
                  >
                    {displayStats.averageFocusTime}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">平均专注</div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                  <div 
                    data-testid="monthly-total-pomodoros"
                    className="text-2xl font-bold text-green-600 dark:text-green-400"
                    role="text"
                    aria-label={`本月完成${displayStats.totalPomodoros}个番茄钟`}
                  >
                    {displayStats.totalPomodoros}个
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">番茄钟</div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                  <div 
                    data-testid="monthly-focus-days"
                    className="text-2xl font-bold text-purple-600 dark:text-purple-400"
                    role="text"
                    aria-label={`本月有${displayStats.focusDays}天专注学习`}
                  >
                    {displayStats.focusDays}天
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">专注天数</div>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center">
                  <div 
                    data-testid="monthly-total-tasks"
                    className="text-2xl font-bold text-orange-600 dark:text-orange-400"
                    role="text"
                    aria-label={`本月完成${displayStats.completedTasks}个任务`}
                  >
                    {displayStats.completedTasks}个
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">完成任务</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400 mb-2">本月还没有专注记录</div>
                <div className="text-sm text-gray-400 dark:text-gray-500">开始使用番茄钟来记录你的专注时间吧！</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PeriodSummary
