import { NextRequest, NextResponse } from 'next/server'
import type { Task, ApiResponse } from '@/types'

// 模拟数据库（实际项目中应使用真实数据库）
const tasks: Task[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const completed = searchParams.get('completed')
    
    let filteredTasks = tasks
    if (completed !== null) {
      filteredTasks = tasks.filter(task => 
        task.completed === (completed === 'true')
      )
    }
    
    const response: ApiResponse<Task[]> = {
      success: true,
      data: filteredTasks
    }
    
    return NextResponse.json(response)
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: '获取任务列表失败'
    }
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: body.title,
      description: body.description || '',
      priority: body.priority || 'medium',
      completed: false,
      estimatedPomodoros: body.estimatedPomodoros || 1,
      pomodorosUsed: 0,
      createdAt: new Date(),
    }
    
    tasks.push(newTask)
    
    const response: ApiResponse<Task> = {
      success: true,
      data: newTask,
      message: '任务创建成功'
    }
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: '创建任务失败'
    }
    return NextResponse.json(response, { status: 400 })
  }
}
