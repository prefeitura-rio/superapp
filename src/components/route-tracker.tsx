'use client'

import { trackRoute } from '@/lib/utils'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

/**
 * Global route tracker component that tracks navigation history
 * for back navigation functionality. This works with Next.js client-side navigation
 * where document.referrer is not updated.
 *
 * Also reacts to searchParams so query-only changes (e.g. ?page=4) are stored
 * and back navigation can return to the correct paginated URL.
 */
function RouteTrackerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()

  useEffect(() => {
    // Include query so pagination (?page=N) updates sessionStorage history.
    // trackRoute still reads window.location; the arg documents the full URL.
    trackRoute(queryString ? `${pathname}?${queryString}` : pathname)
  }, [pathname, queryString])

  return null
}

export function RouteTracker() {
  return (
    <Suspense fallback={null}>
      <RouteTrackerInner />
    </Suspense>
  )
}
