'use client'

import { ChevronLeftIcon } from '@/assets/icons/chevron-left-icon'
import { IconButton } from '@/components/ui/custom/icon-button'
import { getBackRoute } from '@/lib/utils'
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
    if (route) {
      router.push(route)
      return
    }
    const backRoute = getBackRoute(defaultRoute)
    router.push(backRoute)
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
