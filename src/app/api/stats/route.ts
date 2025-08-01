import { NextRequest, NextResponse } from 'next/server'
import type { DailyStats, ApiResponse } from '@/types'

// 模拟数据库
const dailyStats: DailyStats[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '30')
    
    let filteredStats = dailyStats
    
    // 按日期筛选
    if (startDate) {
      filteredStats = filteredStats.filter(stat => stat.date >= startDate)
    }
    if (endDate) {
      filteredStats = filteredStats.filter(stat => stat.date <= endDate)
    }
    
    // 按日期降序排序并限制数量
    filteredStats = filteredStats
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit)
    
    const response: ApiResponse<DailyStats[]> = {
      success: true,
      data: filteredStats
    }
    
    return NextResponse.json(response)
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: '获取统计数据失败'
    }
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const existingIndex = dailyStats.findIndex(stat => stat.date === body.date)
    
    if (existingIndex >= 0) {
      // 更新现有统计
      dailyStats[existingIndex] = {
        ...dailyStats[existingIndex],
        totalPomodoros: (dailyStats[existingIndex].totalPomodoros || 0) + (body.totalPomodoros || 0),
        workTime: (dailyStats[existingIndex].workTime || 0) + (body.workTime || 0),
        breakTime: (dailyStats[existingIndex].breakTime || 0) + (body.breakTime || 0),
        tasksCompleted: (dailyStats[existingIndex].tasksCompleted || 0) + (body.tasksCompleted || 0),
        focusScore: body.focusScore || dailyStats[existingIndex].focusScore
      }
    } else {
      // 创建新统计
      const newStats: DailyStats = {
        date: body.date,
        totalPomodoros: body.totalPomodoros || 0,
        workTime: body.workTime || 0,
        breakTime: body.breakTime || 0,
        tasksCompleted: body.tasksCompleted || 0,
        focusScore: body.focusScore || 0
      }
      dailyStats.push(newStats)
    }
    
    const response: ApiResponse<DailyStats> = {
      success: true,
      data: dailyStats[existingIndex] || dailyStats[dailyStats.length - 1],
      message: '统计数据保存成功'
    }
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: '保存统计数据失败'
    }
    return NextResponse.json(response, { status: 400 })
  }
}
