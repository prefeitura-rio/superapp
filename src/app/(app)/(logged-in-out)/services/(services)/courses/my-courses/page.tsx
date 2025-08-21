'use client'

import { FavoritesCard } from '@/app/components/courses/favorites-card'
import { MyCoursesCard } from '@/app/components/courses/my-course-card'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { cn } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function MyCoursesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isAnimating, setIsAnimating] = useState(false)

  const isFavorites = searchParams.get('favorites') === 'true'

  const handleTabClick = (favorites: boolean) => {
    if (isFavorites === favorites || isAnimating) return

    setIsAnimating(true)

    setTimeout(() => {
      const query = favorites ? '?favorites=true' : ''
      router.push(`/services/courses/my-courses${query}`)

      setTimeout(() => {
        setIsAnimating(false)
      }, 100)
    }, 150)
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <SecondaryHeader title="Cursos" backURL="/services/courses/options" />
      <div className="w-full px-4">
        <div className="relative flex w-full rounded-full bg-card p-1 mt-25 h-13 py-2 px-4">
          <span
            className={cn(
              'absolute top-1 bottom-1 w-1/2 rounded-full bg-secondary transition-all duration-200 px-4',
              isFavorites ? 'left-1/2' : 'left-0'
            )}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />

          <button
            type="button"
            onClick={() => handleTabClick(false)}
            className={cn(
              'relative z-10 w-full py-2 text-sm font-medium transition-colors duration-200 px-4 cursor-pointer',
              !isFavorites ? 'text-foreground' : 'text-foreground/80'
            )}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          >
            Meus cursos
          </button>
          <button
            type="button"
            onClick={() => handleTabClick(true)}
            className={cn(
              'relative z-10 w-full py-2 text-sm font-medium transition-colors duration-200 px-4 cursor-pointer',
              isFavorites ? 'text-foreground' : 'text-foreground/80'
            )}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          >
            Favoritos
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden mt-6 px-4">
        <div
          className={cn(
            'transition-all duration-500 ease-out',
            isFavorites
              ? 'transform -translate-x-full opacity-0 pointer-events-none'
              : 'transform translate-x-0 opacity-100'
          )}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          <MyCoursesCard />
        </div>

        <div
          className={cn(
            'transition-all duration-500 ease-out',
            !isFavorites
              ? 'absolute inset-0 transform translate-x-full opacity-0 pointer-events-none'
              : 'absolute inset-0 transform translate-x-0 opacity-100'
          )}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          <FavoritesCard />
        </div>
      </div>
    </div>
  )
}
