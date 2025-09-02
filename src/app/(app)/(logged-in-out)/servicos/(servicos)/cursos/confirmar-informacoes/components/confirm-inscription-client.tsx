'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import type { SwiperRef } from 'swiper/react'

import { ChevronLeftIcon } from '@/assets/icons'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { useViewportHeight } from '@/hooks/useViewport'
import { useRouter } from 'next/navigation'
import { ConfirmInscriptionSlider } from './confirm-inscription-slider'
import { ConfirmUserDataSlide } from './slides/confirm-user-data-slide'
import { SelectUnitSlide } from './slides/select-unit-slide'
import { SuccessSlide } from './slides/success-slide'
import { UserDescriptionSlide } from './slides/user-description-slide'

import coursesApi from '@/actions/courses'

import Link from 'next/link'
import {
  type InscriptionFormData,
  type NearbyUnit,
  type UserInfoComplete,
  inscriptionSchema,
} from '../types'

interface ConfirmInscriptionClientProps {
  userInfo: UserInfoComplete | { cpf: ''; name: '' }
  nearbyUnits: NearbyUnit[]
  courseId: string
  courseSlug?: string
}

const TRANSITIONS = {
  FADE: 600,
} as const

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export function ConfirmInscriptionClient({
  userInfo,
  nearbyUnits,
  courseId,
  courseSlug,
}: ConfirmInscriptionClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const swiperRef = useRef<SwiperRef>(null)
  const [isPending, startTransition] = useTransition()
  const showUpdateButton = currentIndex === 0
  const router = useRouter()

  const { isBelowBreakpoint } = useViewportHeight(648)

  const form = useForm<InscriptionFormData>({
    resolver: zodResolver(inscriptionSchema),
    defaultValues: {
      unitId: '',
      description: '',
    },
  })

  const slides = [
    {
      id: 'confirm-user-data',
      component: ConfirmUserDataSlide,
      props: { userInfo },
      showPagination: true,
      showBackButton: true,
    },
    {
      id: 'select-unit',
      component: SelectUnitSlide,
      props: {
        nearbyUnits,
        form,
        fieldName: 'unitId',
      },
      showPagination: true,
      showBackButton: true,
    },
    {
      id: 'user-description',
      component: UserDescriptionSlide,
      props: {
        form,
        fieldName: 'description',
      },
      showPagination: true,
      showBackButton: true,
    },
  ]

  const handleNext = async () => {
    if (currentIndex === slides.length - 1) {
      const isValid = await form.trigger()
      if (isValid) {
        await goToSuccess()
      }
    } else {
      const currentSlide = slides[currentIndex]
      if (currentSlide.id === 'select-unit') {
        const isValid = await form.trigger('unitId')
        if (!isValid) return
      }

      swiperRef.current?.swiper?.slideNext()
    }
  }

  const HOME_COURSES = '/servicos/cursos'

  const handleBack = () => {
    if (showSuccess) {
      setCurrentIndex(slides.length - 1)
      window.location.href = HOME_COURSES
      return
    }
    if (currentIndex === 0) {
      router.push(`/servicos/cursos/${courseSlug ?? ''}`)
      return
    }
    swiperRef.current?.swiper?.slidePrev()
  }

  const goToSuccess = async () => {
    setFadeOut(true)
    await delay(TRANSITIONS.FADE)

    startTransition(async () => {
      try {
        const formData = form.getValues()

        const inscriptionData = {
          ...formData,
          userInfo,
          timestamp: new Date().toISOString(),
        }

        const _result = await coursesApi.submitCourseApplication(
          courseId,
          inscriptionData
        )

        setShowSuccess(true)
        setFadeOut(false)
      } catch (error) {
        console.error('Erro ao fazer inscrição:', error)
        setShowSuccess(true)
        setFadeOut(false)
      }
    })
  }

  const handleFinish = () => {
    // inscrição já foi realizada no ultimo slide
    window.location.href = HOME_COURSES
  }

  const currentSlide = slides[currentIndex]
  const showBackButton =
    (currentIndex >= 0 || showSuccess) && currentSlide?.showBackButton !== false
  const showNextButton = !showSuccess && currentIndex < slides.length - 1

  return (
    <div className="relative min-h-lvh w-full px-4 mx-auto bg-background max-w-xl text-foreground flex flex-col overflow-hidden">
      <div className="relative h-11 flex-shrink-0 pt-8 justify-self-start self-start flex items-center">
        <CustomButton
          className={`bg-card text-muted-foreground rounded-full w-11 h-11 hover:bg-card/80 outline-none focus:ring-0 transition-all duration-300 ease-out ${
            showBackButton
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 -translate-x-2 pointer-events-none'
          }`}
          onClick={handleBack}
          disabled={isPending}
        >
          <ChevronLeftIcon className="text-foreground" />
        </CustomButton>
      </div>

      <div className="flex-1 flex flex-col mt-8">
        {!showSuccess && (
          <div
            className={`transition-opacity duration-600 ${
              fadeOut ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <ConfirmInscriptionSlider
              ref={swiperRef}
              slides={slides}
              onSlideChange={index => setCurrentIndex(index)}
              isBelowBreakpoint={isBelowBreakpoint}
              showPagination={currentSlide?.showPagination !== false}
            />
          </div>
        )}

        {showSuccess && (
          <div
            className={`flex justify-center transition-opacity duration-600 ${
              fadeOut ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <SuccessSlide onFinish={handleFinish} />
          </div>
        )}
      </div>

      {!showSuccess && (
        <div className="flex-shrink-0 pb-12">
          <div className="flex justify-center gap-3 w-full transition-all duration-500 ease-out">
            {showUpdateButton && (
              <Link
                className={`bg-card py-4 px-6 text-foreground text-sm font-normal leading-5 rounded-full w-[50%] h-[46px] hover:bg-card/90 transition-all duration-500 ease-out ring-0 outline-0 flex items-center justify-center ${
                  showUpdateButton
                    ? 'opacity-100 translate-x-0 scale-100'
                    : 'opacity-0 -translate-x-4 scale-95 pointer-events-none flex-0'
                }`}
                href={`/servicos/cursos/atualizar-dados?redirectFromCourses=${courseSlug}`}
              >
                Atualizar
              </Link>
            )}

            <CustomButton
              onClick={handleNext}
              disabled={isPending}
              className={`bg-primary py-4 px-6 text-background text-sm font-normal leading-5 rounded-full h-[46px] hover:bg-primary/90 transition-all duration-500 ease-out 
          ${showUpdateButton ? 'w-[50%] flex-grow-0' : 'w-full flex-grow'}
          ${
            showNextButton || !showUpdateButton
              ? 'opacity-100 translate-x-0 scale-100'
              : 'opacity-0 translate-x-4 scale-95 pointer-events-none'
          }`}
            >
              Continuar
            </CustomButton>
          </div>
        </div>
      )}
    </div>
  )
}
