'use client'

import Image from 'next/image'
import { useRef, useState, useTransition } from 'react'
import 'swiper/css'
import 'swiper/css/pagination'
import { Pagination } from 'swiper/modules'
import { Swiper, type SwiperRef, SwiperSlide } from 'swiper/react'

import welcomeImage from '@/assets/welcome.svg'
import { Button } from '@/components/ui/button'

const slides = [
  {
    title: 'Tudo em um só lugar',
    description:
      'Consulte IPTU, ITBI, certidões, agendamentos e muito mais – de forma simples e sem filas.',
    video: "3d_test.mp4", 
  },
  {
    title: 'Oportunidades ao seu alcance',
    description:
      'Busque capacitação profissional e vagas atualizadas em toda a cidade.',
      video: "3d_test.mp4",
  },
  {
    title: 'Sua carteira digital da cidadania',
    description:
      'Cartão Bolsa Família, Cartão Saúde, e Cartão Zeladoria - direto no celular.',
      video: "3d_test.mp4",
  },
]

function WelcomeMessage({
  show,
  fadeOut,
  userInfo,
}: { show: boolean; fadeOut: boolean, userInfo: { cpf: string, name:string } }) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-600 ${
        show
          ? fadeOut
            ? 'opacity-0'
            : 'opacity-100'
          : 'opacity-0 pointer-events-none'
      } bg-background`}
    >
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="mb-12">
          <Image
            src={welcomeImage}
            alt="Família dando boas-vindas"
            width={275}
            height={275}
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        <div className="text-center">
          <p className="text-lg text-foreground">Seja bem vindo(a)</p>
          <p className="text-2xl font-bold text-foreground">{userInfo.name}</p>
        </div>
      </div>
    </div>
  )
}

interface OnboardingProps {
  userInfo: {
    cpf: string;
    name: string;
  }
  setFirstLoginFalse: (cpf: string) => Promise<any>
}

export default function Onboarding({
  userInfo,
  setFirstLoginFalse,
}: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [fadeOutWelcome, setFadeOutWelcome] = useState(false)
  const swiperRef = useRef<SwiperRef>(null)
  const [isPending, startTransition] = useTransition()

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slideNext()
    }
  }

  const finish = () => {
    setIsFadingOut(true)
    startTransition(async () => {
      await setFirstLoginFalse(userInfo.cpf)
      setTimeout(() => {
        setShowWelcome(true)
        setTimeout(() => {
          setFadeOutWelcome(true)
          // After welcome message fades out, reload the page to show home content
          setTimeout(() => {
            //todo: revalidate rather than reload
            window.location.reload()
          }, 600)
        }, 2000)
      }, 600)
    })
  }

  return (
    <div className="relative min-h-lvh max-w-md mx-auto px-5 py-5 bg-background text-foreground flex flex-col justify-center overflow-hidden">
      {/* Slides container */}
      <div
        className={`transition-opacity duration-600 ${
          isFadingOut ? 'opacity-0' : 'opacity-100'
        }`}
      >
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
                  <video
                    src={slide.video}
                    width={350}
                    height={350}
                    style={{
                      objectFit: 'contain',
                      width: '100%',
                      height: '100%',
                    }}
                    loop
                    autoPlay
                    muted
                    playsInline
                  />
                </div>
                <h2 className="text-xl text-foreground font-semibold mb-2">
                  {slide.title}
                </h2>
                <p className="text-base text-muted-foreground mb-6 pb-6">
                  {slide.description}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="pt-10">
          <Button
            className="w-full text-background px-8 py-3 rounded-lg shadow-md"
            size="lg"
            onClick={currentIndex === slides.length - 1 ? finish : handleNext}
            disabled={isPending}
          >
            {currentIndex === slides.length - 1 ? 'Finalizar' : 'Próximo'}
          </Button>
        </div>
      </div>

      {/* Welcome message with fade-in/out */}
      <WelcomeMessage userInfo={userInfo} show={showWelcome} fadeOut={fadeOutWelcome} />
      {/* Custom Swiper pagination styles */}
      <style jsx global>{`
        .swiper-pagination {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
        }
        .swiper-pagination-bullet {
          width: 16px;
          height: 3px;
          border-radius: 9999px;
          background: #19191b;
          opacity: 1;
          transition: background 0.2s;
          margin: 0 !important;
        }
        .swiper-pagination-bullet-active {
          background: #8ecaff;
        }
      `}</style>
    </div>
  )
}
