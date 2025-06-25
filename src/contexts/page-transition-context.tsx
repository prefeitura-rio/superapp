'use client'

import { createContext, useContext, useState } from 'react'

type Direction = 'forward' | 'backward'

const PageTransitionContext = createContext<{
  direction: Direction
  setDirection: (d: Direction) => void
}>({
  direction: 'forward',
  setDirection: () => {},
})

export function PageTransitionProvider({
  children,
}: { children: React.ReactNode }) {
  const [direction, setDirection] = useState<Direction>('forward')
  return (
    <PageTransitionContext.Provider value={{ direction, setDirection }}>
      {children}
    </PageTransitionContext.Provider>
  )
}

export const usePageTransition = () => useContext(PageTransitionContext)
