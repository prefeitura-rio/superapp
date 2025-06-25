'use client'

import { usePageTransition } from '@/contexts/page-transition-context'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

export function PageFadeInWrapper({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const [visible, setVisible] = useState(false)
  const { direction } = usePageTransition()

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 40)
    return () => clearTimeout(timeout)
  }, [])

  const animationClass =
    direction === 'forward'
      ? visible
        ? 'opacity-100 translate-x-0'
        : 'opacity-0 translate-x-4'
      : visible
        ? 'opacity-100 translate-x-0'
        : 'opacity-0 -translate-x-4'

  return (
    <div
      className={cn(
        'transition-all duration-700 ease-in-out',
        animationClass,
        className
      )}
    >
      {children}
    </div>
  )
}
