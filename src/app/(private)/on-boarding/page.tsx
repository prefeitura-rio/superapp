'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import 'swiper/css'
import 'swiper/css/pagination'
import { Pagination } from 'swiper/modules'
import { Swiper, type SwiperRef, SwiperSlide } from 'swiper/react'

import onBoardingFirstCard from '@/assets/onBoardingFirstCard.svg'
import onBoardingSecondCard from '@/assets/onBoardingSecondCard.svg'
import onBoardingThirdCard from '@/assets/onBoardingThirdCard.svg'

const slides = [
  {
    title: 'Tudo em um só lugar',
    description:
      'Consulte IPTU, ITBI, certidões, agendamentos e muito mais – de forma simples e sem filas.',
    image: onBoardingFirstCard,
  },
  {
    title: 'Oportunidades ao seu alcance',
    description:
      'Busque capacitação profissional e vagas atualizadas em toda a cidade.',
    image: onBoardingSecondCard,
  },
  {
    title: 'Sua carteira digital da cidadania',
    description:
      'Cartão Bolsa Família, Cartão Saúde, e Cartão Zeladoria - direto no celular.',
    image: onBoardingThirdCard,
  },
]

export default function Onboarding() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const swiperRef = useRef<SwiperRef>(null)

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slideNext()
    }
  }

  const finish = () => {
    // Set the cookie before redirecting
    document.cookie = 'first_login_access=true; path=/; max-age=31536000' // Expires in 1 year
    setIsFadingOut(true)
    setTimeout(() => {
      router.push('/')
    }, 600)
  }

  return (
    <div
      className={`relative min-h-lvh max-w-md mx-auto px-5 py-5 bg-background text-white flex flex-col justify-center overflow-hidden transition-opacity duration-600 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Slides */}
      <div className="">
        <Swiper
          ref={swiperRef}
          spaceBetween={50}
          slidesPerView={1}
          onSlideChange={swiper => setCurrentIndex(swiper.activeIndex)}
          pagination={{ clickable: true }}
          modules={[Pagination]}
          className="h-full"
        >
          {slides.map((slide, idx) => (
            <SwiperSlide key={idx}>
              <div className="flex flex-col items-center justify-center text-center h-full">
                <div className="mb-4" style={{ width: 350, height: 350 }}>
                  <Image
                    src={slide.image}
                    alt="slide"
                    width={350}
                    height={350}
                    style={{
                      objectFit: 'contain',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </div>
                <h2 className="text-xl font-semibold mb-2">{slide.title}</h2>
                <p className="text-base text-gray-300 mb-6 pb-6">
                  {slide.description}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="pt-10">
          <button
            className="w-full bg-blue-500 text-white px-8 py-3 rounded-lg shadow-md hover:bg-blue-600 transition"
            onClick={currentIndex === slides.length - 1 ? finish : handleNext}
          >
            {currentIndex === slides.length - 1 ? 'Finalizar' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  )
}
