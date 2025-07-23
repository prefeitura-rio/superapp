import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import type { VideoSourceProps } from '@/constants/videos-sources'
import { forwardRef } from 'react'
import 'swiper/css'
import 'swiper/css/pagination'
import { Pagination } from 'swiper/modules'
import { Swiper, type SwiperRef, SwiperSlide } from 'swiper/react'

interface OnboardingSliderProps {
  slides: Array<{
    videoSource: VideoSourceProps
    title: string
    description: string
  }>
  onSlideChange: (index: number) => void
  isBelowBreakpoint: boolean
}

export const OnboardingSlider = forwardRef<SwiperRef, OnboardingSliderProps>(
  ({ slides: onboardingSlides, onSlideChange, isBelowBreakpoint }, ref) => {
    return (
      <>
        <Swiper
          ref={ref}
          spaceBetween={50}
          slidesPerView={1}
          onSlideChange={swiper => onSlideChange(swiper.activeIndex)}
          pagination={{ clickable: true }}
          modules={[Pagination]}
          className="h-full"
        >
          {onboardingSlides.map((slide, idx) => (
            <SwiperSlide key={idx}>
              <div
                className={`flex flex-col items-center justify-center text-left max-h-lvh mt-5 md:mt-0 gap-5 md:gap-18 ${isBelowBreakpoint && 'max-h-[410px]'}`}
              >
                <ThemeAwareVideo
                  source={slide.videoSource}
                  containerClassName={`mb-0 flex items-center justify-center ${
                    idx === 0 && 'crop-right-5' // Crop right side for first slide video (problematic line on right side)
                  } ${
                    isBelowBreakpoint
                      ? 'h-[min(250px,30vh)] max-h-[250px]'
                      : 'h-[min(328px,40vh)] max-h-[328px]'
                  }`}
                />

                <div className="text-left w-full">
                  <h2 className="text-4xl text-foreground font-medium mb-2 text-left leading-10 tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="text-left text-foreground-light text-sm mb-8 leading-5 tracking-normal">
                    {slide.description}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <style jsx global>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .swiper-pagination {
            display: flex;
            justify-content: left;
            gap: 0.5rem;
          }
          .swiper-pagination-bullet {
            width: 6px;
            height: 6px;
            border-radius: 9999px;
            background: #D4D4D8;
            opacity: 1;
            transition: background 0.2s;
            margin: 0 !important;
          }
          .swiper-pagination-bullet-active {
            background: var(--foreground);
            width: 24px;
          }
        `}</style>
      </>
    )
  }
)

OnboardingSlider.displayName = 'OnboardingSlider'
