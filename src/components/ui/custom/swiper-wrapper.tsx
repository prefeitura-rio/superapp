'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@/assets/icons'
import { useRef, useState } from 'react'
import 'swiper/css'
import 'swiper/css/pagination'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper/types'
import { Button } from '../button'

interface SwiperWrapperProps {
  children: React.ReactNode[] | React.ReactNode
  showArrows?: boolean
  showPagination?: boolean
  className?: string
  slidesPerView?: number | 'auto'
  slidesPerGroup?: number
  spaceBetween?: number
  breakpoints?: {
    [key: number]: {
      slidesPerView?: number | 'auto'
      slidesPerGroup?: number
      spaceBetween?: number
    }
  }
  arrowsVerticalPosition?: string
  onSlideChange?: (swiper: SwiperType) => void
}

export function SwiperWrapper({
  children,
  showArrows = true,
  showPagination = true,
  className = '',
  slidesPerView = 1,
  slidesPerGroup = 1,
  spaceBetween = 8,
  breakpoints,
  arrowsVerticalPosition,
  onSlideChange,
}: SwiperWrapperProps) {
  const swiperRef = useRef<SwiperType | null>(null)
  const [isBeginning, setIsBeginning] = useState(true)
  const [isEnd, setIsEnd] = useState(false)

  const handleSlideChange = (swiper: SwiperType) => {
    setIsBeginning(swiper.isBeginning)
    setIsEnd(swiper.isEnd)
    onSlideChange?.(swiper)
  }

  const handlePrevious = () => {
    swiperRef.current?.slidePrev()
  }

  const handleNext = () => {
    swiperRef.current?.slideNext()
  }

  const getArrowClasses = () =>
    `absolute top-[40%] ${arrowsVerticalPosition} -translate-y-1/2 z-10 flex items-center justify-center transition-all duration-200 cursor-pointer w-10 h-10 bg-card border border-border/50 rounded-full shadow-sm hover:shadow-md hover:border-border text-foreground hover:text-foreground/70 bg-transparent shadow-none border-0 hover:bg-transparent hover:border-0 hover:shadow-none`

  const getArrowPositioning = () => {
    return {
      left: '-left-7',
      right: '-right-7',
    }
  }

  const positioning = getArrowPositioning()

  return (
    <div className="relative">
      <Swiper
        onSwiper={swiper => {
          swiperRef.current = swiper
          setIsBeginning(swiper.isBeginning)
          setIsEnd(swiper.isEnd)
        }}
        onSlideChange={handleSlideChange}
        slidesPerView={slidesPerView}
        slidesPerGroup={slidesPerGroup}
        spaceBetween={spaceBetween}
        breakpoints={breakpoints}
        pagination={showPagination ? { clickable: true } : false}
        modules={[Pagination]}
        className={className}
      >
        {Array.isArray(children) ? (
          children.map((child, index) => (
            <SwiperSlide key={index}>{child}</SwiperSlide>
          ))
        ) : (
          <SwiperSlide>{children}</SwiperSlide>
        )}
      </Swiper>

      {showArrows && (
        <>
          <Button
            type="button"
            onClick={handlePrevious}
            className={`${getArrowClasses()} ${positioning.left}`}
            disabled={isBeginning}
            aria-label="Slide anterior"
          >
            <ChevronLeftIcon
              className={`h-7 w-7 ${isBeginning ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground '}`}
            />
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            className={`${getArrowClasses()} ${positioning.right}`}
            disabled={isEnd}
            aria-label="Próximo slide"
          >
            <ChevronRightIcon
              className={`h-7 w-7 ${isEnd ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground '}`}
            />
          </Button>
        </>
      )}

      <style jsx global>{`
        .swiper-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
          height: 10px;
        }
        .swiper-pagination {
          position: relative !important;
          bottom: auto !important;
          margin-top: 1rem !important;
        }
        .swiper-pagination-bullet { 
          background: var(--terciary);
          height: 6px;
          width: 6px;
          opacity: 1;
          margin: 0 !important;
        }
        .swiper-pagination-bullet-active {
          background: var(--foreground);
        }
      `}</style>
    </div>
  )
}
