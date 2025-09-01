/**
 * ClientOnly 组件测试
 */

import { render } from '@testing-library/react'
import { ClientOnly } from '../ClientOnly'

describe('ClientOnly Component', () => {
  it('should render children on client side', () => {
    const { getByText } = render(
      <ClientOnly>
        <div>Client content</div>
      </ClientOnly>
    )
    
    expect(getByText('Client content')).toBeInTheDocument()
  })

  it('should handle empty children', () => {
    const { container } = render(<ClientOnly children={null} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render multiple children', () => {
    const { getByText } = render(
      <ClientOnly>
        <div>First child</div>
        <div>Second child</div>
      </ClientOnly>
    )
    
    expect(getByText('First child')).toBeInTheDocument()
    expect(getByText('Second child')).toBeInTheDocument()
  })
})
