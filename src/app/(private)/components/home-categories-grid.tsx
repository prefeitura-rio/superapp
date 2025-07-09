'use client'

import { Skeleton } from '@/components/ui/skeleton'
import type { Category } from '@/lib/categories'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import 'swiper/css'
import 'swiper/css/grid'
import 'swiper/css/pagination'
import { Grid, Pagination } from 'swiper/modules'
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
        <div className="grid grid-cols-4 gap-2">
          {/* First row */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`row1-${i}`} className="flex flex-col items-center">
              <Skeleton className="w-full aspect-square rounded-2xl mb-2 min-h-12 min-w-12 sm:min-h-16 sm:min-w-16" />
              <Skeleton className="h-3 w-8 sm:w-12" />
            </div>
          ))}
          {/* Second row */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`row2-${i}`} className="flex flex-col items-center">
              <Skeleton className="w-full aspect-square rounded-2xl mb-2 min-h-12 min-w-12 sm:min-h-16 sm:min-w-16" />
              <Skeleton className="h-3 w-8 sm:w-12" />
            </div>
          ))}
        </div>
        {/* Skeleton pagination bullets */}
        <div className="flex justify-center items-center h-12">
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-3 h-2 rounded-full" />
            <Skeleton className="w-2 h-2 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pb-4">
      <div className="pb-0">
        <Swiper
          slidesPerView={4}
          slidesPerGroup={8}
          grid={{
            rows: 2,
            fill: 'row',
          }}
          spaceBetween={8}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          modules={[Grid, Pagination]}
          className="home-categories-swiper animate-fade-in"
        >
          {categories?.map(category => (
            <SwiperSlide key={category.categorySlug}>
              <Link href={`/services/category/${category.categorySlug}`}>
                <div className="flex flex-col items-center justify-center p-2 bg-card rounded-2xl aspect-square cursor-pointer hover:bg-card/80 transition-colors">
                  <div className="flex items-center justify-center text-3xl mb-1">
                    {category.icon}
                  </div>
                </div>
                <span className="flex flex-col items-center justify-center pt-2 text-xs sm:text-sm text-foreground text-center leading-tight font-medium">
                  {category.name}
                </span>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <style jsx global>{`
        .swiper-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 10px;
        }
        .home-categories-swiper .swiper-pagination {
          position: relative !important;
          bottom: auto !important;
          margin-top: 1rem !important;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .swiper-pagination-bullet { 
          background: var(--muted-foreground);
          opacity: 1;
          margin-left: 3px !important;
          margin-right: 3px !important;
          transition: all 0.2s ease-in-out !important;
          width: 8px;
          height: 8px;
          border-radius: 50% !important;
        }
        .swiper-pagination-bullet-active {
          background: var(--primary);
          width: 15px;
          border-radius: 16px !important;
          height: 5px;
        }
      `}</style>
    </div>
  )
}
