import { useEffect, useState } from 'react'

type ViewportType = 'width' | 'height'

interface UseViewportOptions {
  breakpoint?: number
  type?: ViewportType
}

export const useViewport = ({
  breakpoint = 640,
  type = 'width',
}: UseViewportOptions = {}) => {
  const getViewportValue = () => {
    if (typeof window === 'undefined') return 0

    if (type === 'height') {
      return window?.visualViewport?.height ?? window?.innerHeight ?? 0
    }

    return window?.visualViewport?.width ?? window?.innerWidth ?? 0
  }

  const [isHydrated, setIsHydrated] = useState(false)
  const [value, setValue] = useState(0)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  const isBelowBreakpoint = isHydrated ? value < breakpoint : false
  const isAboveBreakpoint = isHydrated ? value >= breakpoint : false

  // Hydration check - to ensure the hook is only active after the component has mounted
  const isBelowBreakpointHydrated = isBelowBreakpoint && isHydrated
  const isAboveBreakpointHydrated = isAboveBreakpoint && isHydrated

  // biome-ignore lint/correctness/useExhaustiveDependencies: <unnecessary>
  useEffect(() => {
    setIsHydrated(true)
    const updateValue = () => {
      const newValue = getViewportValue()
      setValue(newValue)

      if (typeof window !== 'undefined') {
        setWidth(window.innerWidth)
        setHeight(window.innerHeight)
      }
    }
    updateValue()

    window.addEventListener('resize', updateValue)
    window.visualViewport?.addEventListener('resize', updateValue)

    return () => {
      window.removeEventListener('resize', updateValue)
      window.visualViewport?.removeEventListener('resize', updateValue)
    }
  }, [breakpoint, type])

  return {
    value,
    width,
    height,
    isBelowBreakpoint: isBelowBreakpointHydrated,
    isAboveBreakpoint: isAboveBreakpointHydrated,
    isHydrated,
  }
}

// ===== BACKWARD COMPATIBILITY =====

export const useViewportHeight = (breakpoint = 765) => {
  const result = useViewport({ breakpoint, type: 'height' })

  return {
    height: result.value,
    isBelowBreakpoint: result.isBelowBreakpoint,
  }
}

export const useViewportWidth = (breakpoint = 640) => {
  const result = useViewport({ breakpoint, type: 'width' })

  return {
    width: result.value,
    isMobile: result.isBelowBreakpoint,
    isDesktop: result.isAboveBreakpoint,
    isHydrated: result.isHydrated,
  }
}
