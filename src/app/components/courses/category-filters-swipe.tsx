'use client'

import { SwiperWrapper } from '@/components/ui/custom/swiper-wrapper'
import type { CategoryFilter } from '@/lib/course-category-helpers'
import Image from 'next/image'
import Link from 'next/link'

interface CategoryFiltersSwipeProps {
  categoryFilters: CategoryFilter[]
}

export function CategoryFiltersSwipe({
  categoryFilters,
}: CategoryFiltersSwipeProps) {
  if (categoryFilters.length === 0) return null

  // Calculate items per slide based on screen size
  // Desktop: 6-8 items per slide
  const itemsPerSlide = 8

  return (
    <div className="px-4 pb-8">
      <SwiperWrapper
        showArrows
        showPagination
        arrowsVerticalPosition="top-[30%]"
        className="category-filters-swiper"
      >
        {Array.from(
          { length: Math.ceil(categoryFilters.length / itemsPerSlide) },
          (_, slideIndex) => {
            const startIndex = slideIndex * itemsPerSlide
            const slideFilters = categoryFilters.slice(
              startIndex,
              startIndex + itemsPerSlide
            )

            return (
              <div
                key={`slide-${slideIndex}`}
                className="grid px-2 grid-cols-8 gap-2 w-full"
              >
                {slideFilters.map(filter => (
                  <Link
                    key={filter.value}
                    href={`/servicos/cursos/busca?categoria=${filter.value}`}
                    className="flex flex-col items-center cursor-pointer w-full"
                  >
                    <div className="flex flex-col items-center justify-center p-2 rounded-2xl aspect-square transition-all h-20 border-2 border-card bg-card hover:bg-card/80 w-full">
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
                    <span className="flex flex-col items-center justify-center pt-2 text-xs sm:text-sm text-foreground-light text-center leading-tight font-medium w-full">
                      {filter.label}
                    </span>
                  </Link>
                ))}
              </div>
            )
          }
        )}
      </SwiperWrapper>
      <style jsx global>{`
        .category-filters-swiper .swiper-slide {
          width: 100% !important;
          padding: 0 !important;
        }
      `}</style>
    </div>
  )
}
