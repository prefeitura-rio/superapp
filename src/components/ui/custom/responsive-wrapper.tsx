'use client'

import { useViewportWidth } from '@/hooks/useViewport'
import type { ReactNode } from 'react'

interface ResponsiveWrapperProps {
  mobileComponent: ReactNode
  desktopComponent: ReactNode
  mobileSkeletonComponent?: ReactNode
  desktopSkeletonComponent?: ReactNode
  breakpoint?: number
}

export function ResponsiveWrapper({
  mobileComponent,
  desktopComponent,
  desktopSkeletonComponent,
  breakpoint = 640,
}: ResponsiveWrapperProps) {
  const { isDesktop, isHydrated } = useViewportWidth(breakpoint)

  if (!isHydrated) {
    return desktopSkeletonComponent
  }

  return isDesktop ? desktopComponent : mobileComponent
}
