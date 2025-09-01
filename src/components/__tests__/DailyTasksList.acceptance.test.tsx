import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { format } from 'date-fns';
import DailyTasksList from '@/components/DailyTasksList';
import { useAppStore } from '@/lib/store';
import { Task, Priority } from '@/types';

// Mock store
jest.mock('@/lib/store');
const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;

describe('REQ-TM-S04: 查看每日完成的任务列表 - 验收测试', () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const mockTasks: Task[] = [
    {
      id: 'task1',
      title: '制定Q4营销策略',
      description: '分析市场趋势，制定下一季度营销计划',
      priority: Priority.HIGH,
      completed: true,
      createdAt: new Date('2025-08-04T08:00:00'),
      completedAt: new Date('2025-08-04T16:30:00'),
      estimatedPomodoros: 4,
      pomodorosUsed: 5
    },
    {
      id: 'task2',
      title: '撰写产品宣传文案',
      description: '为新产品发布准备营销材料',
      priority: Priority.MEDIUM,
      completed: true,
      createdAt: new Date('2025-08-04T09:00:00'),
      completedAt: new Date('2025-08-04T14:00:00'),
      estimatedPomodoros: 2,
      pomodorosUsed: 3
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('应该展示一个包含今天所有进行过专注的任务的列表', async () => {
    mockUseAppStore.mockReturnValue(() => (mockTasks));

    render(<DailyTasksList />);

    await waitFor(() => {
      expect(screen.getByTestId('daily-tasks-list')).toBeInTheDocument();
      expect(screen.getByText('制定Q4营销策略')).toBeInTheDocument();
      expect(screen.getByText('撰写产品宣传文案')).toBeInTheDocument();
    });
  });

  test('当今天没有任何专注的任务时，应该显示友好的提示信息', async () => {
    mockUseAppStore.mockReturnValue(() => ([])
    );

    render(<DailyTasksList />);

    await waitFor(() => {
      expect(screen.getByText(/今天还没有专注任何任务/)).toBeInTheDocument();
    });
  });

  test('列表中每个任务项都需要显示任务标题和其消耗的番茄钟数量', async () => {
    mockUseAppStore.mockReturnValue(() => (mockTasks)
    );

    render(<DailyTasksList />);

    await waitFor(() => {
      expect(screen.getByTestId('task-task1-pomodoros')).toHaveTextContent('5个番茄钟');
      expect(screen.getByTestId('task-task2-pomodoros')).toHaveTextContent('3个番茄钟');
    });
  });

  test('列表应按消耗的番茄钟数量降序排列', async () => {
    const sortedTasks = [...mockTasks].sort((a, b) => b.pomodorosUsed - a.pomodorosUsed);
    
    mockUseAppStore.mockReturnValue(() => (sortedTasks)
    );

    render(<DailyTasksList />);

    await waitFor(() => {
      const taskItems = screen.getAllByTestId(/^task-.*-item$/);
      expect(taskItems[0]).toHaveTextContent('制定Q4营销策略'); // 5个番茄钟
      expect(taskItems[1]).toHaveTextContent('撰写产品宣传文案'); // 3个番茄钟
    });
  });

  test('处理任务标题很长的情况', async () => {
    const longTitleTask = [{
      id: 'long-task',
      title: '这是一个非常长的任务标题用来测试UI组件在处理长文本时的表现',
      priority: Priority.MEDIUM,
      completed: true,
      createdAt: new Date('2025-08-04T10:00:00'),
      estimatedPomodoros: 1,
      pomodorosUsed: 1
    }];

    mockUseAppStore.mockReturnValue(() => (longTitleTask)
    );

    render(<DailyTasksList />);

    await waitFor(() => {
      expect(screen.getByText(/这是一个非常长的任务标题/)).toBeInTheDocument();
      expect(screen.getByTestId('task-long-task-pomodoros')).toHaveTextContent('1个番茄钟');
    });
  });

  test('应该仅显示当日有番茄钟投入的任务，不显示其他日期的任务', async () => {
    const mixedDateTasks = [
      {
        id: 'today-task',
        title: '今日任务',
        priority: Priority.HIGH,
        completed: true,
        createdAt: new Date('2025-08-04T08:00:00'),
        completedAt: new Date('2025-08-04T16:30:00'),
        estimatedPomodoros: 2,
        pomodorosUsed: 3
      }
    ];

    mockUseAppStore.mockReturnValue(() => (mixedDateTasks)
    );

    render(<DailyTasksList />);

    await waitFor(() => {
      expect(screen.getByText('今日任务')).toBeInTheDocument();
      expect(screen.queryByText('昨日任务')).not.toBeInTheDocument();
      expect(screen.queryByText('明日任务')).not.toBeInTheDocument();
    });
  });

  test('应该在500ms内快速响应并渲染列表', async () => {
    const startTime = Date.now();
    
    mockUseAppStore.mockReturnValue(() => (mockTasks)
    );

    render(<DailyTasksList />);

    await waitFor(() => {
      expect(screen.getByTestId('daily-tasks-list')).toBeInTheDocument();
    });

    const endTime = Date.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(500);
  });

  test('应该具备无障碍访问支持，包含适当的ARIA标签', async () => {
    mockUseAppStore.mockReturnValue(() => (mockTasks)
    );

    render(<DailyTasksList />);

    await waitFor(() => {
      // 检查列表容器的ARIA标签
      const listContainer = screen.getByRole('list');
      expect(listContainer).toHaveAttribute('aria-label', '今日专注任务列表');
      
      // 检查列表项的角色
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
      
      // 检查列表项可以聚焦
      listItems.forEach(item => {
        expect(item).toHaveAttribute('tabIndex', '0');
      });
    });
  });
});
