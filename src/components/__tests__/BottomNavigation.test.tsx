/**
 * BottomNavigation 组件测试
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { BottomNavigation } from '../BottomNavigation'

// Mock store
const mockSetActiveTab = jest.fn()
const mockToggleSettings = jest.fn()

jest.mock('@/lib/store', () => ({
  useAppStore: jest.fn(() => ({
    ui: {
      activeTab: 'timer',
      isSettingsOpen: false,
    },
    setActiveTab: mockSetActiveTab,
    toggleSettings: mockToggleSettings,
  })),
}))

describe('BottomNavigation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all navigation tabs', () => {
    render(<BottomNavigation />)
    
    expect(screen.getByText('计时器')).toBeInTheDocument()
    expect(screen.getByText('任务')).toBeInTheDocument()
    expect(screen.getByText('统计')).toBeInTheDocument()
    expect(screen.getByText('设置')).toBeInTheDocument()
  })

  it('should show timer tab as active by default', () => {
    render(<BottomNavigation />)
    
    const timerButton = screen.getByText('计时器').closest('button')
    expect(timerButton).toHaveClass('text-blue-600')
  })

  it('should call setActiveTab when timer tab is clicked', () => {
    render(<BottomNavigation />)
    
    const timerButton = screen.getByText('计时器')
    fireEvent.click(timerButton)
    
    expect(mockSetActiveTab).toHaveBeenCalledWith('timer')
  })

  it('should call setActiveTab when tasks tab is clicked', () => {
    render(<BottomNavigation />)
    
    const tasksButton = screen.getByText('任务')
    fireEvent.click(tasksButton)
    
    expect(mockSetActiveTab).toHaveBeenCalledWith('tasks')
  })

  it('should call setActiveTab when stats tab is clicked', () => {
    render(<BottomNavigation />)
    
    const statsButton = screen.getByText('统计')
    fireEvent.click(statsButton)
    
    expect(mockSetActiveTab).toHaveBeenCalledWith('stats')
  })

  it('should call toggleSettings when settings tab is clicked', () => {
    render(<BottomNavigation />)
    
    const settingsButton = screen.getByText('设置')
    fireEvent.click(settingsButton)
    
    expect(mockToggleSettings).toHaveBeenCalledTimes(1)
  })

  it('should render all icons', () => {
    render(<BottomNavigation />)
    
    // Check if icons are present by looking for their parent buttons
    const timerIcon = screen.getByText('计时器').closest('button')
    const tasksIcon = screen.getByText('任务').closest('button')
    const statsIcon = screen.getByText('统计').closest('button')
    const settingsIcon = screen.getByText('设置').closest('button')
    
    expect(timerIcon).toBeInTheDocument()
    expect(tasksIcon).toBeInTheDocument()
    expect(statsIcon).toBeInTheDocument()
    expect(settingsIcon).toBeInTheDocument()
  })
})

// Test with different active tab
describe('BottomNavigation Component - Tasks Active', () => {
  beforeEach(() => {
    // Override mock for this test suite
    require('@/lib/store').useAppStore.mockReturnValue({
      ui: {
        activeTab: 'tasks',
        isSettingsOpen: false,
      },
      setActiveTab: mockSetActiveTab,
      toggleSettings: mockToggleSettings,
    })
  })

  it('should show tasks tab as active', () => {
    render(<BottomNavigation />)
    
    const tasksButton = screen.getByText('任务').closest('button')
    expect(tasksButton).toHaveClass('text-blue-600')
  })
})

// Test with settings open
describe('BottomNavigation Component - Settings Open', () => {
  beforeEach(() => {
    // Override mock for this test suite
    require('@/lib/store').useAppStore.mockReturnValue({
      ui: {
        activeTab: 'timer',
        isSettingsOpen: true,
      },
      setActiveTab: mockSetActiveTab,
      toggleSettings: mockToggleSettings,
    })
  })

  it('should show settings tab as active when settings is open', () => {
    render(<BottomNavigation />)
    
    const settingsButton = screen.getByText('设置').closest('button')
    expect(settingsButton).toHaveClass('text-blue-600')
  })
})
