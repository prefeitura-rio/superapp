import { useEffect, useState } from 'react'

export const useViewportHeight = (breakpoint = 765) => {
  const getViewportHeight = () => {
    if (typeof window === 'undefined') return 0
    return window?.visualViewport?.height ?? window?.innerHeight ?? 0
  }
  const [isHydrated, setIsHydrated] = useState(false)
  const [height, setHeight] = useState(0)

  // hydration mismatch
  const isSmallHeight = isHydrated ? height < breakpoint : false

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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

  return { height, isSmallHeight, isHydrated }
}
