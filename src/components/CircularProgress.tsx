'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CircularProgressProps {
  progress: number // 0-1
  size?: number
  strokeWidth?: number
  className?: string
  children?: React.ReactNode
  color?: string
}

export function CircularProgress({
  progress,
  size = 280,
  strokeWidth = 8,
  className,
  children,
  color = '#007AFF'
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)
  
  return (
    <div 
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      {/* 背景圆环 */}
      <svg
        width={size}
        height={size}
        className="absolute inset-0 transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* 进度圆环 */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
          style={{
            filter: 'drop-shadow(0 0 8px rgba(0, 122, 255, 0.3))'
          }}
        />
      </svg>
      
      {/* 中心内容 */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
