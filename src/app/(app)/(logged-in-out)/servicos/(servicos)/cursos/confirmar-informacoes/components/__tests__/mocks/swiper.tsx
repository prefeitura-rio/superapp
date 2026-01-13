import type React from 'react'
import { forwardRef, useImperativeHandle, useState } from 'react'

interface MockSwiperProps {
  children: React.ReactNode
  onSlideChange?: (swiper: { activeIndex: number }) => void
  className?: string
  spaceBetween?: number
  slidesPerView?: number
  pagination?: boolean | { clickable?: boolean }
  modules?: unknown[]
  allowTouchMove?: boolean
  touchEventsTarget?: string
  nested?: boolean
  touchRatio?: number
}

interface MockSwiperRef {
  swiper: {
    activeIndex: number
    slideNext: () => void
    slidePrev: () => void
    slideTo: (index: number) => void
    on: (event: string, callback: () => void) => void
    off: (event: string, callback?: () => void) => void
  }
}

export const MockSwiper = forwardRef<MockSwiperRef, MockSwiperProps>(
  ({ children, onSlideChange, className }, ref) => {
    const [activeIndex, setActiveIndex] = useState(0)
    const childrenArray = Array.isArray(children) ? children : [children]

    useImperativeHandle(ref, () => ({
      swiper: {
        activeIndex,
        slideNext: () => {
          const newIndex = Math.min(activeIndex + 1, childrenArray.length - 1)
          setActiveIndex(newIndex)
          onSlideChange?.({ activeIndex: newIndex })
        },
        slidePrev: () => {
          const newIndex = Math.max(activeIndex - 1, 0)
          setActiveIndex(newIndex)
          onSlideChange?.({ activeIndex: newIndex })
        },
        slideTo: (index: number) => {
          const newIndex = Math.max(
            0,
            Math.min(index, childrenArray.length - 1)
          )
          setActiveIndex(newIndex)
          onSlideChange?.({ activeIndex: newIndex })
        },
        on: () => {},
        off: () => {},
      },
    }))

    return (
      <div data-testid="swiper-container" className={className}>
        {childrenArray.map((child, index) => (
          <div
            key={index}
            data-testid={`swiper-slide-${index}`}
            style={{ display: index === activeIndex ? 'block' : 'none' }}
          >
            {child}
          </div>
        ))}
      </div>
    )
  }
)

MockSwiper.displayName = 'MockSwiper'

interface MockSwiperSlideProps {
  children: React.ReactNode
}

export const MockSwiperSlide = ({ children }: MockSwiperSlideProps) => {
  return <div data-testid="swiper-slide">{children}</div>
}

export const mockSwiperModule = {
  Swiper: MockSwiper,
  SwiperSlide: MockSwiperSlide,
}
