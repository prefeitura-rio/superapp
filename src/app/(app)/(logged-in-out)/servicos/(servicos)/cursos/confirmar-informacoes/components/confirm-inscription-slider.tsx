import { forwardRef, useEffect } from 'react'
import 'swiper/css'
import 'swiper/css/pagination'
import { Pagination } from 'swiper/modules'
import { Swiper, type SwiperRef, SwiperSlide } from 'swiper/react'
import type { SlideData } from '../types'

interface ConfirmInscriptionSliderProps {
  slides: SlideData[]
  onSlideChange: (index: number) => void
  showPagination?: boolean
  currentIndex: number
  onNext?: () => void
}

export const ConfirmInscriptionSlider = forwardRef<
  SwiperRef,
  ConfirmInscriptionSliderProps
>(
  (
    { slides, onSlideChange, showPagination = true, currentIndex, onNext },
    ref
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Enter' || !onNext) return
      const target = e.target as HTMLElement
      const tag = target.tagName.toLowerCase()
      // Only intercept Enter on text inputs and textareas — radio/checkbox have
      // their own native Enter behaviour and should not trigger slide advance
      if (tag === 'input' || tag === 'textarea') {
        e.preventDefault()
        onNext()
      }
    }
    /* --Pagination Bullets Positioning--
     - Adjust the position of pagination bullets based on the active slide title
     - This effect ensures that the pagination bullets are positioned below the active slide title */
    useEffect(() => {
      if (!showPagination) return

      const updatePaginationPosition = () => {
        // Procura primeiro pelo container de título (custom fields com scroll)
        const customFieldContainer = document.querySelector(
          '.course__confirm-user-info__slider .swiper-slide-active [data-slide-title-container]'
        ) as HTMLElement | null

        let titleElement = customFieldContainer

        // Se não encontrar, usa h2 diretamente (slides normais)
        if (!titleElement) {
          titleElement = document.querySelector(
            '.course__confirm-user-info__slider .swiper-slide-active h2'
          ) as HTMLElement | null
        }

        const paginationEl = document.querySelector(
          '.course__confirm-user-info__slider .swiper-pagination'
        ) as HTMLElement | null

        if (titleElement && paginationEl) {
          const offset = customFieldContainer ? -12 : 16
          const newTop =
            titleElement.offsetTop + titleElement.offsetHeight + offset
          paginationEl.style.top = `${newTop}px`
        }
      }

      let resizeObserver: ResizeObserver | null = null

      const observeActiveTitle = () => {
        // Procura primeiro pelo container de título (custom fields com scroll)
        let titleElement = document.querySelector(
          '.course__confirm-user-info__slider .swiper-slide-active [data-slide-title-container]'
        ) as HTMLElement | null

        // Se não encontrar, usa h2 diretamente (slides normais)
        if (!titleElement) {
          titleElement = document.querySelector(
            '.course__confirm-user-info__slider .swiper-slide-active h2'
          ) as HTMLElement | null
        }

        resizeObserver?.disconnect()
        if (titleElement) {
          resizeObserver = new ResizeObserver(updatePaginationPosition)
          resizeObserver.observe(titleElement)
        }
      }

      updatePaginationPosition()
      observeActiveTitle()

      const swiperInstance = (ref as React.RefObject<SwiperRef>).current?.swiper
      if (swiperInstance) {
        swiperInstance.on('slideChange', () => {
          updatePaginationPosition()
          observeActiveTitle()
        })

        swiperInstance.on('slideChangeTransitionEnd', () => {
          updatePaginationPosition()
        })
      }

      return () => {
        resizeObserver?.disconnect()
        if (swiperInstance) {
          swiperInstance.off('slideChange')
          swiperInstance.off('slideChangeTransitionEnd')
        }
      }
    }, [showPagination, ref])

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div className="h-full" onKeyDown={handleKeyDown}>
        <Swiper
          ref={ref}
          spaceBetween={50}
          slidesPerView={1}
          onSlideChange={swiper => onSlideChange(swiper.activeIndex)}
          pagination={showPagination ? { clickable: true } : false}
          modules={showPagination ? [Pagination] : []}
          className="relative h-full course__confirm-user-info__slider"
          allowTouchMove={true}
          touchRatio={0.5}
        >
          {slides.map((slide, idx) => {
            const SlideComponent = slide.component
            const isActive = idx === currentIndex
            return (
              <SwiperSlide key={slide.id || idx}>
                {/* The ref callback sets/removes the `inert` attribute imperatively.
                  `inert` prevents the browser from focusing elements in off-screen
                  slides, which would cause the virtual keyboard "Next" button to
                  scroll Swiper and skip slides on mobile. */}
                <div
                  className="flex flex-col h-full"
                  ref={el => {
                    if (!el) return
                    if (isActive) {
                      el.removeAttribute('inert')
                    } else {
                      el.setAttribute('inert', '')
                    }
                  }}
                >
                  <SlideComponent
                    slideIndex={idx}
                    isActive={isActive}
                    {...slide.props}
                  />
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>

        {showPagination && (
          <style jsx global>{`
            .course__confirm-user-info__slider .swiper-pagination {
              display: flex;
              justify-content: left;
              gap: 0.5rem;
              position: absolute;
              left: 0;
              right: 0;
              height: 7px;
              transition: top 0.1s ease;
            }
            .course__confirm-user-info__slider .swiper-pagination-bullet {
              width: 3px;
              height: 3px;
              border-radius: 9999px;
              background: #d4d4d8;
              opacity: 1;
              transition: background 0.2s;
              margin: 0 !important;
            }
            .course__confirm-user-info__slider .swiper-pagination-bullet-active {
              background: var(--foreground);
              width: 24px;
            }
          `}</style>
        )}
      </div>
    )
  }
)

ConfirmInscriptionSlider.displayName = 'ConfirmInscriptionSlider'
