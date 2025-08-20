'use client'

import { ChevronLeftIcon } from '@/assets/icons/chevron-left-icon'
import { IconButton } from '@/components/ui/custom/icon-button'
import { useRouter } from 'next/navigation'
import { SearchButton } from './search-button'

interface SecondaryHeaderProps {
  title: string
  showSearchButton?: boolean
  className?: string
  route?: string
}

export function SecondaryHeader({
  title,
  showSearchButton,
  className = 'max-w-4xl',
  route,
}: SecondaryHeaderProps) {
  const router = useRouter()

  return (
    <>
      <header
        className={`px-4 py-4 md:py-6 fixed top-0 w-full ${className} mx-auto z-50 bg-background text-foreground h-auto`}
      >
        <div className="grid grid-cols-3 items-center">
          {/* Left column - IconButton */}
          <div className="flex justify-start">
            <IconButton
              icon={ChevronLeftIcon}
              onClick={() => (route ? router.push(route) : router.back())}
            />
          </div>

          {/* Center column - Title */}
          <div className="flex justify-center">
            <h1 className="text-xl text-nowrap font-medium text-center text-foreground">
              {title}
            </h1>
          </div>

          {/* Right column - SearchButton or empty space */}
          <div className="flex justify-end">
            {showSearchButton && <SearchButton />}
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
