'use client'

import { SwiperWrapper } from '@/components/ui/custom/swiper-wrapper'
import { Skeleton } from '@/components/ui/skeleton'

export function CategoryFiltersSwipeSkeleton() {
  // Calculate items per slide based on screen size
  // Desktop: 8 items per slide
  const itemsPerSlide = 8
  const totalItems = 16 // Show 2 slides of skeletons
  const totalSlides = Math.ceil(totalItems / itemsPerSlide)

  return (
    <div className="px-4 pb-8">
      <SwiperWrapper
        showArrows
        showPagination
        arrowsVerticalPosition="top-[30%]"
        className="category-filters-swiper"
      >
        {Array.from({ length: totalSlides }, (_, slideIndex) => {
          const startIndex = slideIndex * itemsPerSlide
          const itemsInSlide = Math.min(
            itemsPerSlide,
            totalItems - startIndex
          )

          return (
            <div
              key={`skeleton-slide-${slideIndex}`}
              className="grid px-2 grid-cols-8 gap-4 w-full"
            >
              {Array.from({ length: itemsInSlide }, (_, itemIndex) => (
                <div
                  key={`skeleton-item-${itemIndex}`}
                  className="flex flex-col items-center cursor-pointer w-full"
                >
                  <div className="flex flex-col items-center justify-center p-2 rounded-2xl aspect-square transition-all h-20 border-2 border-card bg-card w-full">
                    <div className="flex items-center justify-center w-12 h-12 relative">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center pt-2 w-full">
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          )
        })}
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

