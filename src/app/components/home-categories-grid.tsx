'use client'

import { Skeleton } from '@/components/ui/skeleton'
import type { Category } from '@/lib/categories'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import 'swiper/css'
import 'swiper/css/pagination'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

interface HomeCategoriesGridProps {
  categories?: Category[]
}

export default function HomeCategoriesGrid({
  categories,
}: HomeCategoriesGridProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return (
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="flex flex-col items-center">
              <div className="flex flex-col items-center justify-center p-2 bg-card rounded-2xl aspect-square w-full max-h-19 min-h-18">
                <Skeleton className="text-3xl mb-1 h-6 w-6" />
              </div>
              <div className="pt-2">
                <Skeleton className="h-3 w-8 sm:w-12" />
              </div>
            </div>
          ))}
        </div>

        {/* Skeleton pagination bullets */}
        <div className="flex justify-center items-center h-12">
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-2 h-1.5 rounded-full" />
            <Skeleton className="w-2 h-1.5 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pb-4">
      <h3 className="pb-2 text-base font-medium text-foreground leading-5">
        Serviços
      </h3>
      <div className="pb-0">
        <Swiper
          slidesPerView={1}
          slidesPerGroup={1}
          spaceBetween={8}
          pagination={{
            clickable: true,
            // dynamicBullets: true,
          }}
          modules={[Pagination]}
          className="home-categories-swiper animate-fade-in"
        >
          {categories &&
            Array.from(
              { length: Math.ceil(categories.length / 8) },
              (_, slideIndex) => {
                const startIndex = slideIndex * 8
                const slideCategories = categories.slice(
                  startIndex,
                  startIndex + 8
                )

                return (
                  <SwiperSlide key={`slide-${slideIndex}`}>
                    <div className="grid grid-cols-4 gap-2">
                      {slideCategories.map((category, index) => (
                        <Link
                          key={category.categorySlug}
                          href={`/services/category/${category.categorySlug}`}
                          className="flex flex-col items-center"
                        >
                          <div className="flex flex-col items-center justify-center p-2 bg-card rounded-2xl aspect-square cursor-pointer hover:bg-card/80 transition-colors w-full max-h-19 min-h-18">
                            <div className="flex items-center justify-center text-3xl mb-1">
                              {category.icon}
                            </div>
                          </div>
                          <span className="flex flex-col items-center justify-center pt-2 text-xs sm:text-sm text-foreground text-center leading-tight font-medium">
                            {category.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </SwiperSlide>
                )
              }
            )}
        </Swiper>
      </div>
      <style jsx global>{`
        .swiper-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
          height: 10px;
        }
        .home-categories-swiper .swiper-pagination {
          position: relative !important;
          bottom: auto !important;
          margin-top: 1rem !important;
        }
        .swiper-pagination-bullet { 
          background: var(--terciary);
          opacity: 1;
          height: 6px;
          width: 6px;
          margin: 0 !important;
        }
        .swiper-pagination-bullet-active {
          background: var(--foreground);
        }
      `}</style>
    </div>
  )
}
