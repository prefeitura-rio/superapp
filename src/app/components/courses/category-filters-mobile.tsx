'use client'

import type { CategoryFilter } from '@/lib/course-category-helpers'
import Image from 'next/image'
import Link from 'next/link'

interface CategoryFiltersMobileProps {
  categoryFilters: CategoryFilter[]
}

export function CategoryFiltersMobile({
  categoryFilters,
}: CategoryFiltersMobileProps) {
  if (categoryFilters.length === 0) return null

  return (
    <section className="mt-4 pb-8">
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="flex px-4 gap-4 w-max">
          {categoryFilters.map(filter => (
            <Link
              key={filter.value}
              href={`/servicos/cursos/busca?categoria=${filter.value}`}
              className="flex flex-col items-center cursor-pointer shrink-0 w-20"
            >
              <div className="flex flex-col items-center justify-center p-2 rounded-2xl aspect-square transition-all h-20 border-2 border-card bg-card hover:bg-card/80 w-20">
                {filter.imagePath && (
                  <div className="flex items-center justify-center w-12 h-12 relative">
                    <Image
                      src={filter.imagePath}
                      alt={filter.label}
                      width={48}
                      height={48}
                      className="object-contain"
                      onError={e => {
                        // Fallback: hide image if not found
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
              <span className="flex flex-col items-center justify-center pt-2 text-xs sm:text-sm text-foreground-light text-center leading-tight font-medium whitespace-nowrap">
                {filter.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
