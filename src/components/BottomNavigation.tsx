'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Timer, CheckSquare, BarChart3, Settings } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface TabButtonProps {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
}

function TabButton({ icon, label, isActive, onClick }: TabButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200",
        "min-h-[60px] min-w-[60px]",
        isActive
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      )}
    >
      {/* 激活状态背景 */}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-xl"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35
          }}
        />
      )}
      
      {/* 图标 */}
      <div className="relative z-10 mb-1">
        {icon}
      </div>
      
      {/* 标签 */}
      <span className="relative z-10 text-xs font-medium leading-none">
        {label}
      </span>
    </motion.button>
  )
}

export function BottomNavigation() {
  const { ui, setActiveTab, toggleSettings } = useAppStore()
  
  const handleSettingsClick = () => {
    toggleSettings()
  }
  
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg",
        "border-t border-gray-200/50 dark:border-gray-700/50",
        "safe-area-bottom"
      )}
    >
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          <TabButton
            icon={<Timer size={24} />}
            label="计时器"
            isActive={ui.activeTab === 'timer'}
            onClick={() => setActiveTab('timer')}
          />
          
          <TabButton
            icon={<CheckSquare size={24} />}
            label="任务"
            isActive={ui.activeTab === 'tasks'}
            onClick={() => setActiveTab('tasks')}
          />
          
          <TabButton
            icon={<BarChart3 size={24} />}
            label="统计"
            isActive={ui.activeTab === 'stats'}
            onClick={() => setActiveTab('stats')}
          />
          
          <TabButton
            icon={<Settings size={24} />}
            label="设置"
            isActive={ui.isSettingsOpen}
            onClick={handleSettingsClick}
          />
        </div>
      </div>
    </motion.div>
  )
}
