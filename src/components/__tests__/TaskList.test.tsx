import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from '../TaskList';
import { Task, Priority } from '@/types';

// 1. Define mock data and functions first
const mockToggleTaskCompletion = jest.fn();
const mockDeleteTask = jest.fn();
const mockTasks: Task[] = [
  {
    id: '1',
    title: '低优先级任务',
    description: '',
    priority: Priority.LOW,
    completed: false,
    estimatedPomodoros: 4,
    pomodorosUsed: 1,
    createdAt: new Date('2023-10-26T10:00:00Z'),
  },
  {
    id: '2',
    title: '已完成的高优先级任务',
    description: '',
    priority: Priority.HIGH,
    completed: true,
    estimatedPomodoros: 2,
    pomodorosUsed: 2,
    createdAt: new Date('2023-10-26T09:00:00Z'),
  },
  {
    id: '3',
    title: '中优先级任务',
    description: '',
    priority: Priority.MEDIUM,
    completed: false,
    estimatedPomodoros: 3,
    pomodorosUsed: 2,
    createdAt: new Date('2023-10-26T11:00:00Z'),
  },
];

// This will hold the state for the mock store
let mockState: {
  tasks: Task[];
  toggleTaskCompletion: jest.Mock;
  deleteTask: jest.Mock;
};

// 2. Mock the store module using a factory function
jest.mock('@/lib/store', () => ({
  __esModule: true,
  useAppStore: (selector: (state: any) => any) => selector(mockState),
}));

describe('REQ-TM-002: 查看任务列表', () => {
  beforeEach(() => {
    // 3. Reset state and mocks before each test
    mockToggleTaskCompletion.mockClear();
    mockDeleteTask.mockClear();
    mockState = {
      tasks: [...mockTasks], // Use a copy to avoid mutations between tests
      toggleTaskCompletion: mockToggleTaskCompletion,
      deleteTask: mockDeleteTask,
    };
  });

  test('REQ-TM-002.1: 应清晰展示任务标题、番茄数和优先级', () => {
    const mockOnEditTask = jest.fn();
    render(<TaskList onEditTask={mockOnEditTask} />);
    
    const task1 = screen.getByText('低优先级任务');
    expect(task1).toBeInTheDocument();
    // Check for pomodoro count
    expect(screen.getByText('1 / 4')).toBeInTheDocument();
    // Check for priority indicator (we\'ll use data-testid)
    expect(task1.closest('[data-testid="task-item"]')).toHaveAttribute('data-priority', Priority.LOW);

    const task3 = screen.getByText('中优先级任务');
    expect(task3).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    expect(task3.closest('[data-testid="task-item"]')).toHaveAttribute('data-priority', Priority.MEDIUM);
  });

  test('REQ-TM-002.2: 已完成的任务应有明显视觉区分', () => {
    const mockOnEditTask = jest.fn();
    render(<TaskList onEditTask={mockOnEditTask} />);
    const completedTask = screen.getByText('已完成的高优先级任务');
    // Check for a class that applies a line-through style
    expect(completedTask).toHaveClass('line-through');
  });

  test('REQ-TM-002.3: 应支持按优先级排序', () => {
    const mockOnEditTask = jest.fn();
    render(<TaskList onEditTask={mockOnEditTask} />);
    const sortButton = screen.getByRole('button', { name: /按优先级排序/i });
    
    // Get all task items
    let taskItems = screen.getAllByTestId('task-item');
    // Default order is by creation date (latest first in this mock)
    expect(taskItems[0]).toHaveTextContent('中优先级任务');
    expect(taskItems[1]).toHaveTextContent('低优先级任务');
    expect(taskItems[2]).toHaveTextContent('已完成的高优先级任务');

    // Click to sort by priority
    fireEvent.click(sortButton);

    taskItems = screen.getAllByTestId('task-item');
    // New order should be High, Medium, Low
    expect(taskItems[0]).toHaveTextContent('已完成的高优先级任务');
    expect(taskItems[1]).toHaveTextContent('中优先级任务');
    expect(taskItems[2]).toHaveTextContent('低优先级任务');
  });

  test('REQ-TM-002.4: 应支持按状态过滤', () => {
    const mockOnEditTask = jest.fn();
    render(<TaskList onEditTask={mockOnEditTask} />);
    const filterPending = screen.getByRole('button', { name: '显示待办任务' });
    const filterCompleted = screen.getByRole('button', { name: '显示已完成任务' });
    const filterAll = screen.getByRole('button', { name: '显示全部任务' });

    // Filter by "Pending"
    fireEvent.click(filterPending);
    expect(screen.queryByText('已完成的高优先级任务')).not.toBeInTheDocument();
    expect(screen.getByText('低优先级任务')).toBeInTheDocument();
    expect(screen.getByText('中优先级任务')).toBeInTheDocument();

    // Filter by "Completed"
    fireEvent.click(filterCompleted);
    expect(screen.getByText('已完成的高优先级任务')).toBeInTheDocument();
    expect(screen.queryByText('低优先级任务')).not.toBeInTheDocument();
    expect(screen.queryByText('中优先级任务')).not.toBeInTheDocument();

    // Filter by "All"
    fireEvent.click(filterAll);
    expect(screen.getByText('已完成的高优先级任务')).toBeInTheDocument();
    expect(screen.getByText('低优先级任务')).toBeInTheDocument();
    expect(screen.getByText('中优先级任务')).toBeInTheDocument();
  });

  test('当任务列表为空时，应显示提示信息', () => {
    // Override mock for this specific test
    mockState.tasks = [];
    const mockOnEditTask = jest.fn();
    render(<TaskList onEditTask={mockOnEditTask} />);
    expect(screen.getByText('暂无任务')).toBeInTheDocument();
    expect(screen.getByText('点击上方表单添加一个新任务吧！')).toBeInTheDocument();
  });
});
