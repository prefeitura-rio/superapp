'use client'

import { trackRoute } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Global route tracker component that tracks navigation history
 * for back navigation functionality. This works with Next.js client-side navigation
 * where document.referrer is not updated.
 */
export function RouteTracker() {
  const pathname = usePathname()

  useEffect(() => {
    trackRoute(pathname)
  }, [pathname])

  return null
}

