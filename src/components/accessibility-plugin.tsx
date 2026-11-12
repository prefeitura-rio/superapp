'use client'

import { useEffect } from 'react'

export function AccessibilityPlugin() {
  useEffect(() => {
    import('@/lib/accessibility-plugin').then(({ init }) => init())
  }, [])
  return null
}
