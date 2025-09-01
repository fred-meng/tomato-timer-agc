'use client'

import { TimerDisplay } from '@/components/TimerDisplay'
import { BottomNavigation } from '@/components/BottomNavigation'
import { useAppStore } from '@/lib/store'
import TasksTab from '@/components/TasksTab'
import TodayStats from '@/components/TodayStats'
import DailyTasksList from '@/components/DailyTasksList'
import { ClientOnly } from '@/components/ClientOnly'
import PeriodSummary from '@/components/PeriodSummary'

function AppContent() {
  const { ui } = useAppStore()
  
  const renderActiveTab = () => {
    switch (ui.activeTab) {
      case 'timer':
        return <TimerDisplay />
      case 'tasks':
        return <TasksTab />
      case 'stats':
        return (
          <div className="p-6 space-y-6">
            <TodayStats />
            <DailyTasksList />
            
            {/* REQ-TM-S05: 查看周/月度数据摘要功能 */}
            <PeriodSummary />
          </div>
        )
      default:
        return <TimerDisplay />
    }
  }

  return (
    <>
      {/* 主要内容区域 */}
      <main className="relative min-h-screen pb-20">
        {/* 头部状态栏占位 */}
        <div className="h-safe-top" />
        
        {/* 应用内容 */}
        <div className="max-w-md mx-auto">
          {renderActiveTab()}
        </div>
      </main>
      
      {/* 底部导航 */}
      <BottomNavigation />
      
      {/* 设置面板占位 */}
      {ui.isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end sm:items-center justify-center">
          <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md h-3/4 sm:h-auto rounded-t-xl sm:rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">设置</h2>
              <button 
                onClick={() => useAppStore.getState().toggleSettings()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-500 dark:text-gray-400">设置功能即将推出</p>
          </div>
        </div>
      )}
    </>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <ClientOnly
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <AppContent />
      </ClientOnly>
    </div>
  )
}
