'use client'

import { ChevronLeftIcon } from '@/assets/icons/chevron-left-icon'
import { IconButton } from '@/components/ui/custom/icon-button'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { SearchButton } from './search-button'

interface SecondaryHeaderProps {
  title?: string
  logo?: ReactNode
  showSearchButton?: boolean
  searchHref?: string
  className?: string
  route?: string
  defaultRoute?: string
  style?: React.CSSProperties
  fixed?: boolean
}

/**
 * Checks if there's an internal previous route in the navigation history.
 * Returns true if we can safely use router.back() to navigate to an internal page.
 */
function hasInternalHistory(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    // Check sessionStorage for previous route (client-side navigation)
    const previousRoute = sessionStorage.getItem('previousRoute')
    if (previousRoute) {
      const currentPath = window.location.pathname
      const previousPath = previousRoute.split('?')[0] // Get pathname only

      // If previous route exists and is different from current, it's a valid internal route
      if (previousPath && previousPath !== currentPath) {
        // Check if it's not a child route (e.g., we don't want to go back to a child)
        const isChildRoute = previousPath.startsWith(`${currentPath}/`)
        if (!isChildRoute) {
          return true
        }
      }
    }

    // Fallback to document.referrer check
    const referrer = document.referrer
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer)
        const currentUrl = new URL(window.location.href)

        // Check if referrer is from the same domain
        if (referrerUrl.origin === currentUrl.origin) {
          const referrerPath =
            referrerUrl.pathname + referrerUrl.search + referrerUrl.hash
          const currentPath =
            currentUrl.pathname + currentUrl.search + currentUrl.hash

          // Check if referrer is different from current page
          if (referrerPath !== currentPath) {
            return true
          }
        }
      } catch {
        // Invalid URL, continue
      }
    }
  } catch {
    // sessionStorage or other errors, continue
  }

  return false
}

export function SecondaryHeader({
  title,
  logo,
  showSearchButton,
  searchHref,
  className = 'max-w-4xl',
  route,
  defaultRoute = '/',
  style,
  fixed = true,
}: SecondaryHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    // If a specific route is provided, use it as fallback
    const fallbackRoute = route || defaultRoute

    // Check if there's an internal history to go back to
    if (hasInternalHistory()) {
      router.back()
      return
    }

    // No internal history, navigate to the fallback route
    router.push(fallbackRoute)
  }

  return (
    <>
      <header
        className={`px-4 py-4 md:py-6 ${fixed ? 'fixed' : 'relative'} w-full ${className} mx-auto ${fixed ? 'z-50' : ''} bg-background text-foreground h-auto transition-all duration-200`}
        style={fixed ? { top: 0, ...style } : style}
      >
        <div className="grid grid-cols-3 items-center">
          {/* Left column - IconButton */}
          <div className="flex justify-start">
            <IconButton icon={ChevronLeftIcon} onClick={handleBack} />
          </div>

          {/* Center column - Title or Logo */}
          <div className="flex justify-center">
            {logo ? (
              logo
            ) : (
              <h1 className="text-xl text-nowrap font-medium text-center text-foreground">
                {title}
              </h1>
            )}
          </div>

          {/* Right column - SearchButton or empty space */}
          <div className="flex justify-end">
            {showSearchButton && <SearchButton href={searchHref} />}
          </div>
        </div>
      </header>

      {/* <div className="fixed top-16 w-full max-w-md mx-auto h-15 z-40 pointer-events-none">
        <div
          className="w-full h-full bg-background backdrop-blur-lg"
          style={{
            WebkitMaskImage:
              'linear-gradient(to bottom, black 0%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          }}
        />
      </div> */}
    </>
  )
}
