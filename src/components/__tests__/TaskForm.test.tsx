import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskForm from '../TaskForm';
import { Priority } from '@/types';

// Define the mock function before mocking the module
const mockAddTask = jest.fn();

// Mock the module and provide a factory function
jest.mock('@/lib/store', () => ({
  __esModule: true, // This is important for ES modules
  useAppStore: (selector: (state: { addTask: jest.Mock }) => any) => {
    const state = {
      addTask: mockAddTask,
    };
    return selector(state);
  },
}));

describe('REQ-TM-001: Create New Task', () => {
  beforeEach(() => {
    // Just clear the mock function. The implementation is handled by the module mock.
    mockAddTask.mockClear();
  });

  // REQ-TM-001.1
  test('REQ-TM-001.1: 应渲染一个必填的任务标题输入框', () => {
    render(<TaskForm />);
    const titleInput = screen.getByLabelText(/任务标题/i);
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toBeRequired();
  });

  // REQ-TM-001.2
  test('REQ-TM-001.2: should render an optional description textarea', () => {
    render(<TaskForm />);
    const descriptionTextarea = screen.getByLabelText(/详细描述/i);
    expect(descriptionTextarea).toBeInTheDocument();
    expect(descriptionTextarea).not.toBeRequired();
  });

  // REQ-TM-001.3
  test('REQ-TM-001.3: 应渲染预估番茄数输入框，默认为1，并可通过按钮增减', () => {
    render(<TaskForm />);
    const estimateInput = screen.getByLabelText('预估番茄数') as HTMLInputElement;
    expect(estimateInput).toBeInTheDocument();
    expect(estimateInput.value).toBe('1');

    const incrementButton = screen.getByRole('button', { name: /增加番茄钟/i });
    const decrementButton = screen.getByRole('button', { name: /减少番茄钟/i });
    
    fireEvent.click(incrementButton);
    expect(estimateInput.value).toBe('2');
    
    fireEvent.click(decrementButton);
    expect(estimateInput.value).toBe('1');
  });

  // REQ-TM-001.4
  test('REQ-TM-001.4: 应渲染优先级选择器，并默认为"中"', () => {
    render(<TaskForm />);
    const prioritySelect = screen.getByLabelText(/优先级/i);
    expect(prioritySelect).toBeInTheDocument();
    expect(prioritySelect).toHaveValue(Priority.MEDIUM);
  });

  // REQ-TM-001.5
  test('REQ-TM-001.5: 提交表单时，应使用正确的负载调用addTask', () => {
    render(<TaskForm />);

    // 填充表单
    const titleInput = screen.getByLabelText('任务标题');
    const descriptionInput = screen.getByLabelText(/详细描述/);
    const incrementButton = screen.getByRole('button', { name: /增加番茄钟/i });
    const prioritySelect = screen.getByLabelText('优先级');
    const saveButton = screen.getByRole('button', { name: /保存任务/i });

    fireEvent.change(titleInput, { target: { value: '新测试任务' } });
    fireEvent.change(descriptionInput, { target: { value: '这是一个详细描述' } });
    fireEvent.click(incrementButton); // 预估番茄数变为 2
    fireEvent.change(prioritySelect, { target: { value: Priority.HIGH } });

    // 提交表单
    fireEvent.click(saveButton);

    // 验证addTask是否被调用
    expect(mockAddTask).toHaveBeenCalledTimes(1);

    // 验证提交的负载
    const taskPayload = mockAddTask.mock.calls[0][0];
    expect(taskPayload.title).toBe('新测试任务');
    expect(taskPayload.description).toBe('这是一个详细描述');
    expect(taskPayload.estimatedPomodoros).toBe(2);
    expect(taskPayload.priority).toBe(Priority.HIGH);
  });

  test('should not submit if title is empty', () => {
    render(<TaskForm />);
    
    const saveButton = screen.getByRole('button', { name: /保存任务/i });
    
    // 模拟HTML5验证
    const titleInput = screen.getByLabelText(/任务标题/i) as HTMLInputElement;
    expect(titleInput.checkValidity()).toBe(false);

    fireEvent.click(saveButton);
    
    expect(mockAddTask).not.toHaveBeenCalled();
  });
});
