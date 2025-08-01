import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并Tailwind CSS类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化时间显示 (mm:ss)
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * 将分钟转换为秒
 */
export function minutesToSeconds(minutes: number): number {
  return minutes * 60
}

/**
 * 将秒转换为分钟
 */
export function secondsToMinutes(seconds: number): number {
  return Math.floor(seconds / 60)
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 获取今天的日期字符串 (YYYY-MM-DD)
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * 格式化日期显示
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * 计算专注分数 (0-100)
 * 基于完成的番茄数量和计划数量的比例
 */
export function calculateFocusScore(completed: number, planned: number): number {
  if (planned === 0) return 0
  return Math.min(Math.round((completed / planned) * 100), 100)
}

/**
 * 播放音效
 */
export function playNotificationSound(type: 'work' | 'break' = 'work') {
  if (typeof window === 'undefined') return
  
  try {
    const context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    
    // 根据类型设置不同音调
    oscillator.frequency.value = type === 'work' ? 800 : 600
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0, context.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.01)
    gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.5)
    
    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + 0.5)
  } catch (error) {
    console.warn('Could not play notification sound:', error)
  }
}

/**
 * 触发振动反馈
 */
export function triggerVibration(pattern: number[] = [200, 100, 200]) {
  if (typeof window === 'undefined') return
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

/**
 * 请求通知权限
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (!('Notification' in window)) return false
  
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

/**
 * 发送通知
 */
export function sendNotification(title: string, body: string, icon?: string) {
  if (typeof window === 'undefined') return
  if (Notification.permission !== 'granted') return
  
  const notification = new Notification(title, {
    body,
    icon: icon || '/icons/icon-192.png',
    badge: '/icons/icon-192.png'
  })
  
  // 5秒后自动关闭
  setTimeout(() => {
    notification.close()
  }, 5000)
}
