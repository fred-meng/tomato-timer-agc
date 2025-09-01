/**
 * TimerDisplay 组件测试
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { TimerDisplay } from '../TimerDisplay'

// Mock usePomodoroClock hook
const mockStart = jest.fn()
const mockPause = jest.fn()
const mockStop = jest.fn()
const mockReset = jest.fn()

jest.mock('@/hooks/usePomodoroClock', () => ({
  usePomodoroClock: jest.fn(() => ({
    timer: {
      sessionType: 'work',
      currentTime: 1500, // 25 minutes in seconds
      sessionsCompleted: 0,
      isRunning: false,
      isPaused: false,
    },
    start: mockStart,
    pause: mockPause,
    stop: mockStop,
    reset: mockReset,
    isRunning: false,
    isPaused: false,
    progress: 0.5,
  })),
}))

describe('TimerDisplay Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render timer display with work session', () => {
    render(<TimerDisplay />)
    
    expect(screen.getByText('🍅')).toBeInTheDocument()
    expect(screen.getByText('专注工作')).toBeInTheDocument()
    expect(screen.getByText(/第.*个番茄时段/)).toBeInTheDocument()
    expect(screen.getByText('25:00')).toBeInTheDocument()
    expect(screen.getByText('准备开始')).toBeInTheDocument()
  })

  it('should display correct session title and emoji for work session', () => {
    render(<TimerDisplay />)
    
    expect(screen.getByText('🍅')).toBeInTheDocument()
    expect(screen.getByText('专注工作')).toBeInTheDocument()
  })

  it('should render play button when not running', () => {
    render(<TimerDisplay />)
    
    const playButton = screen.getByTestId('Play-icon').closest('button')
    expect(playButton).toBeInTheDocument()
  })

  it('should call start function when play button is clicked', () => {
    render(<TimerDisplay />)
    
    const playButton = screen.getByTestId('Play-icon').closest('button')
    fireEvent.click(playButton!)
    
    expect(mockStart).toHaveBeenCalledTimes(1)
  })

  it('should call stop function when stop button is clicked', () => {
    render(<TimerDisplay />)
    
    const stopButton = screen.getByTestId('Square-icon').closest('button')
    fireEvent.click(stopButton!)
    
    expect(mockStop).toHaveBeenCalledTimes(1)
  })

  it('should call reset function when reset button is clicked', () => {
    render(<TimerDisplay />)
    
    const resetButton = screen.getByTestId('RotateCcw-icon').closest('button')
    fireEvent.click(resetButton!)
    
    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('should render progress indicators', () => {
    render(<TimerDisplay />)
    
    const container = screen.getByText('专注工作').closest('div')?.parentElement
    const progressDots = container?.querySelectorAll('.w-3.h-3.rounded-full')
    expect(progressDots).toHaveLength(4)
  })
})

// Test for running state - separate mock
describe('TimerDisplay Component - Running State', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Override the mock for running state
    require('@/hooks/usePomodoroClock').usePomodoroClock.mockReturnValue({
      timer: {
        sessionType: 'work',
        currentTime: 1200, // 20 minutes in seconds
        sessionsCompleted: 1,
        isRunning: true,
        isPaused: false,
      },
      start: mockStart,
      pause: mockPause,
      stop: mockStop,
      reset: mockReset,
      isRunning: true,
      isPaused: false,
      progress: 0.2,
    })
  })

  it('should render pause button when running', () => {
    render(<TimerDisplay />)
    
    expect(screen.getByText('运行中')).toBeInTheDocument()
    const pauseButton = screen.getByTestId('Pause-icon').closest('button')
    expect(pauseButton).toBeInTheDocument()
  })

  it('should call pause function when pause button is clicked', () => {
    render(<TimerDisplay />)
    
    const pauseButton = screen.getByTestId('Pause-icon').closest('button')
    fireEvent.click(pauseButton!)
    
    expect(mockPause).toHaveBeenCalledTimes(1)
  })

  it('should show correct session number', () => {
    render(<TimerDisplay />)
    
    expect(screen.getByText(/第.*个番茄时段/)).toBeInTheDocument()
  })
})
