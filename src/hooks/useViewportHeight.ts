import { useEffect, useState } from 'react'

export const useViewportHeight = (breakpoint = 765) => {
  const getViewportHeight = () => {
    if (typeof window === 'undefined') return 0
    return window?.visualViewport?.height ?? window?.innerHeight ?? 0
  }

  const [isHydrated, setIsHydrated] = useState(false)
  const [height, setHeight] = useState(0)

  const isBelowBreakpoint = isHydrated ? height < breakpoint : false

  // Hydration check - to ensure the hook is only active after the component has mounted
  const isBelowBreakpointHydrated = isBelowBreakpoint && isHydrated

  // biome-ignore lint/correctness/useExhaustiveDependencies: <unnecessary>
  useEffect(() => {
    setIsHydrated(true)
    const updateHeight = () => setHeight(getViewportHeight())
    updateHeight()

    window.addEventListener('resize', updateHeight)
    window.visualViewport?.addEventListener('resize', updateHeight)

    return () => {
      window.removeEventListener('resize', updateHeight)
      window.visualViewport?.removeEventListener('resize', updateHeight)
    }
  }, [breakpoint])

  return {
    height,
    isBelowBreakpoint: isBelowBreakpointHydrated,
  }
}
