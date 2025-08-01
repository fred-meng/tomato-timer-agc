'use client'

import { useEffect, useState } from 'react'

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * ClientOnly组件 - 仅在客户端渲染，避免水合错误
 * 特别适用于使用localStorage等浏览器API的组件
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <div suppressHydrationWarning>{fallback}</div>
  }

  return <div suppressHydrationWarning>{children}</div>
}
