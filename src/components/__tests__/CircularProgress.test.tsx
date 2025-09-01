/**
 * CircularProgress 组件测试
 */

import { render } from '@testing-library/react'
import { CircularProgress } from '../CircularProgress'

describe('CircularProgress Component', () => {
  it('should render with default props', () => {
    const { container } = render(<CircularProgress progress={0.5} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should render with custom size', () => {
    const { container } = render(<CircularProgress progress={0.75} size={120} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '120')
    expect(svg).toHaveAttribute('height', '120')
  })

  it('should render with custom stroke width', () => {
    const { container } = render(<CircularProgress progress={0.25} strokeWidth={8} />)
    const circles = container.querySelectorAll('circle')
    expect(circles).toHaveLength(2) // Background and progress circles
  })

  it('should handle progress bounds correctly', () => {
    const { container: container1 } = render(<CircularProgress progress={-0.1} />)
    const { container: container2 } = render(<CircularProgress progress={1.5} />)
    
    expect(container1.querySelector('svg')).toBeInTheDocument()
    expect(container2.querySelector('svg')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<CircularProgress progress={0.5} className="custom-progress" />)
    const wrapper = container.querySelector('div')
    expect(wrapper).toHaveClass('custom-progress')
  })

  it('should handle zero progress', () => {
    const { container } = render(<CircularProgress progress={0} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should handle maximum progress', () => {
    const { container } = render(<CircularProgress progress={1} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should render children in center', () => {
    const { getByText } = render(
      <CircularProgress progress={0.5}>
        <span>50%</span>
      </CircularProgress>
    )
    expect(getByText('50%')).toBeInTheDocument()
  })

  it('should apply custom color', () => {
    const { container } = render(<CircularProgress progress={0.5} color="#ff0000" />)
    const progressCircle = container.querySelectorAll('circle')[1]
    expect(progressCircle).toHaveAttribute('stroke', '#ff0000')
  })
})
