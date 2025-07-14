import { forwardRef } from 'react'
import 'swiper/css'
import 'swiper/css/pagination'
import { Pagination } from 'swiper/modules'
import { Swiper, type SwiperRef, SwiperSlide } from 'swiper/react'

interface OnboardingSliderProps {
  slides: Array<{ video: string; title: string; description: string }>
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
                className={`flex flex-col items-center justify-center text-left max-h-lvh mt-5 md:mt-0 gap-10 md:gap-18 ${isBelowBreakpoint && 'max-h-[510px]'}`}
              >
                <div
                  className="mb-4 relative"
                  style={{
                    width: 'clamp(160px, 40%, 260px)',
                    height: 'clamp(200px, 30vh, 460px)',
                  }}
                >
                  <video
                    src={slide.video}
                    style={{
                      objectFit: 'contain',
                      width: '100%',
                      height: '100%',
                    }}
                    loop
                    autoPlay
                    muted
                    playsInline
                    onError={e => {
                      const video = e.currentTarget
                      const fallback =
                        video.parentElement?.querySelector('[data-fallback]')

                      if (video && fallback instanceof HTMLElement) {
                        video.style.display = 'none'
                        fallback.style.display = 'flex'
                      }
                    }}
                  />

                  {/* Fallback container */}
                  <div
                    data-fallback
                    className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center text-center p-4"
                    style={{ display: 'none' }}
                  >
                    <div>
                      <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-gray-500 text-xl ml-1 -mt-1">
                          ▶
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs">
                        Vídeo indisponível
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-left w-full">
                  <h2 className="text-4xl text-[#09090B] font-medium mb-2 text-left leading-10 tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="text-left text-[#A1A1A1] text-sm mb-8">
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
            background: #09090B;
            width: 24px;
          }
        `}</style>
      </>
    )
  }
)

OnboardingSlider.displayName = 'OnboardingSlider'
