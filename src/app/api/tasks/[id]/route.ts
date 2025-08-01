import { NextRequest, NextResponse } from 'next/server'
import type { Task, ApiResponse } from '@/types'

// 模拟数据库（实际项目中应使用真实数据库）
const tasks: Task[] = []

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const task = tasks.find(t => t.id === id)
    
    if (!task) {
      const response: ApiResponse = {
        success: false,
        error: '任务不存在'
      }
      return NextResponse.json(response, { status: 404 })
    }
    
    const response: ApiResponse<Task> = {
      success: true,
      data: task
    }
    
    return NextResponse.json(response)
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: '获取任务失败'
    }
    return NextResponse.json(response, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const taskIndex = tasks.findIndex(t => t.id === id)
    
    if (taskIndex === -1) {
      const response: ApiResponse = {
        success: false,
        error: '任务不存在'
      }
      return NextResponse.json(response, { status: 404 })
    }
    
    const body = await request.json()
    const updatedTask: Task = {
      ...tasks[taskIndex],
      ...body,
      id: id, // 确保ID不会被修改
      updatedAt: new Date()
    }
    
    tasks[taskIndex] = updatedTask
    
    const response: ApiResponse<Task> = {
      success: true,
      data: updatedTask,
      message: '任务更新成功'
    }
    
    return NextResponse.json(response)
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: '更新任务失败'
    }
    return NextResponse.json(response, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const taskIndex = tasks.findIndex(t => t.id === id)
    
    if (taskIndex === -1) {
      const response: ApiResponse = {
        success: false,
        error: '任务不存在'
      }
      return NextResponse.json(response, { status: 404 })
    }
    
    tasks.splice(taskIndex, 1)
    
    const response: ApiResponse = {
      success: true,
      message: '任务删除成功'
    }
    
    return NextResponse.json(response)
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: '删除任务失败'
    }
    return NextResponse.json(response, { status: 500 })
  }
}
