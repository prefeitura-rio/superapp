'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import type { SwiperRef } from 'swiper/react'

import { ChevronLeftIcon } from '@/assets/icons'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { useViewportHeight } from '@/hooks/useViewport'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { ConfirmInscriptionSlider } from './confirm-inscription-slider'
import ConfirmUserDataSlide from './slides/confirm-user-data-slide'
import { CustomFieldSlide } from './slides/custom-field-slide'
import { SelectUnitSlide } from './slides/select-unit-slide'
import { SuccessSlide } from './slides/success-slide'

import { submitCourseInscription } from '@/actions/courses/submit-inscription'

import { getEmailValue, hasValidEmail } from '@/helpers/email-data-helpers'
import { getPhoneValue, hasValidPhone } from '@/helpers/phone-data-helpers'
import Link from 'next/link'
import {
  type CourseUserInfo,
  type CustomField,
  type InscriptionFormData,
  type NearbyUnit,
  createInscriptionSchema,
} from '../types'

interface ConfirmInscriptionClientProps {
  userInfo: CourseUserInfo
  userAuthInfo: {
    cpf: string
    name: string
  }
  nearbyUnits: NearbyUnit[]
  courseInfo: any // Add courseInfo prop
  courseId: string
  courseSlug?: string
}

const TRANSITIONS = {
  FADE: 600,
} as const

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export function ConfirmInscriptionClient({
  userInfo,
  userAuthInfo,
  nearbyUnits,
  courseInfo,
  courseId,
  courseSlug,
}: ConfirmInscriptionClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [showUpdateInfoModal, setShowUpdateInfoModal] = useState(false)
  const swiperRef = useRef<SwiperRef>(null)
  const [isPending, startTransition] = useTransition()
  const showUpdateButton = currentIndex === 0
  const router = useRouter()

  const { isBelowBreakpoint } = useViewportHeight(648)

  // Check if user has email/phone - variable for reuse
  const hasEmail = hasValidEmail(userInfo.email)
  const hasPhone = hasValidPhone(userInfo.phone)
  const hasValidContactInfo = hasEmail && hasPhone

  // Extract custom fields from course info
  const customFields: CustomField[] =
    (courseInfo as any)?.data?.custom_fields || []

  const form = useForm<InscriptionFormData>({
    resolver: zodResolver(
      createInscriptionSchema(
        nearbyUnits && nearbyUnits.length > 0,
        customFields
      )
    ),
    defaultValues: {
      unitId: nearbyUnits && nearbyUnits.length > 0 ? '' : 'no-units-available',
      description: '',
      // Initialize custom fields with empty values
      ...Object.fromEntries(
        customFields.map(field => [`custom_${field.id}`, ''])
      ),
    },
  })

  const slides = [
    {
      id: 'confirm-user-data',
      component: ConfirmUserDataSlide,
      props: { userInfo, userAuthInfo },
      showPagination: true,
      showBackButton: true,
    },
    // Only include subsequent slides if user has valid contact info
    ...(hasValidContactInfo
      ? [
          // Only show select-unit slide if there are nearby units available
          ...(nearbyUnits && nearbyUnits.length > 0
            ? [
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
              ]
            : []),
          // Add custom field slides dynamically
          ...customFields.map(field => ({
            id: `custom-field-${field.id}`,
            component: CustomFieldSlide,
            props: {
              field,
              fieldName: `custom_${field.id}`,
              form,
            },
            showPagination: true,
            showBackButton: true,
          })),
        ]
      : []),
  ]

  const handleNext = async () => {
    if (currentIndex === slides.length - 1 && hasValidContactInfo) {
      const isValid = await form.trigger()
      if (isValid) {
        await goToSuccess()
      }
    } else {
      // Check if data is missing before proceeding
      if (!hasValidContactInfo) {
        setShowUpdateInfoModal(true)
        return
      }

      const currentSlide = slides[currentIndex]
      if (
        currentSlide.id === 'select-unit' &&
        nearbyUnits &&
        nearbyUnits.length > 0
      ) {
        const isValid = await form.trigger('unitId')
        if (!isValid) return
      }

      if (currentSlide.id.startsWith('custom-field-')) {
        // Validate custom fields if they are required
        const fieldId = currentSlide.id.replace('custom-field-', '')
        const field = customFields.find(f => f.id === fieldId)
        if (field?.required) {
          const fieldName = `custom_${field.id}` as keyof InscriptionFormData
          const isValid = await form.trigger(fieldName)
          if (!isValid) return
        }
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

  // Function to find the first slide with missing required fields
  const findFirstInvalidSlide = async (): Promise<number | null> => {
    // Check unit selection if required
    if (nearbyUnits && nearbyUnits.length > 0) {
      const unitSlideIndex = slides.findIndex(
        slide => slide.id === 'select-unit'
      )
      if (unitSlideIndex !== -1) {
        const isUnitValid = await form.trigger('unitId')
        if (!isUnitValid) {
          return unitSlideIndex
        }
      }
    }

    // Check custom fields
    for (let i = 0; i < customFields.length; i++) {
      const field = customFields[i]
      if (field.required) {
        const fieldName = `custom_${field.id}` as keyof InscriptionFormData
        const isFieldValid = await form.trigger(fieldName)
        if (!isFieldValid) {
          const customFieldSlideIndex = slides.findIndex(
            slide => slide.id === `custom-field-${field.id}`
          )
          if (customFieldSlideIndex !== -1) {
            return customFieldSlideIndex
          }
        }
      }
    }

    return null
  }

  const goToSuccess = async () => {
    // First, check if there are any invalid required fields
    const firstInvalidSlideIndex = await findFirstInvalidSlide()

    if (firstInvalidSlideIndex !== null) {
      // Navigate to the first invalid slide
      setCurrentIndex(firstInvalidSlideIndex)
      swiperRef.current?.swiper?.slideTo(firstInvalidSlideIndex)
      return
    }

    // All fields are valid, proceed with submission
    setFadeOut(true)
    await delay(TRANSITIONS.FADE)

    startTransition(async () => {
      try {
        const formData = form.getValues()

        const result = await submitCourseInscription({
          courseId,
          userInfo: {
            cpf: userAuthInfo.cpf,
            name: userAuthInfo.name,
            email: getEmailValue(userInfo.email),
            phone: getPhoneValue(userInfo.phone),
          },
          unitId:
            nearbyUnits && nearbyUnits.length > 0 ? formData.unitId : undefined,
          customFields: customFields.map(field => ({
            id: field.id,
            title: field.title,
            value:
              formData[`custom_${field.id}` as keyof InscriptionFormData] || '',
            required: field.required,
          })),
          reason:
            formData.description ||
            'Inscrição realizada através do portal do cidadão',
        })

        if (!result.success) {
          throw new Error(result.error || 'Erro ao fazer inscrição')
        }

        // Success - show success slide
        setShowSuccess(true)
        setFadeOut(false)
      } catch (error) {
        console.error('Erro ao fazer inscrição:', error)
        // Error - show toast with specific error message
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Erro ao fazer inscrição. Tente novamente.'
        toast.error(errorMessage)
        router.back()
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
  const isLastSlide = currentIndex === slides.length - 1 && hasValidContactInfo
  const buttonText = isLastSlide ? 'Confirmar inscrição' : 'Continuar'

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
              <div className="flex flex-col items-center w-[50%]">
                <Link
                  className={`bg-card py-4 px-6 text-foreground text-sm font-normal leading-5 rounded-full w-full h-[46px] hover:bg-card/90 transition-all duration-500 ease-out ring-0 outline-0 flex items-center justify-center ${
                    showUpdateButton
                      ? 'opacity-100 translate-x-0 scale-100'
                      : 'opacity-0 -translate-x-4 scale-95 pointer-events-none flex-0'
                  }`}
                  href={`/servicos/cursos/atualizar-dados?redirectFromCourses=${courseSlug}`}
                >
                  Atualizar
                </Link>

                {(!hasEmail || !hasPhone) && (
                  <p className="mt-2">
                    <span className="text-destructive text-sm">
                      *
                      {!hasEmail && !hasPhone
                        ? 'Informações pendentes'
                        : !hasEmail
                          ? 'Email pendente'
                          : 'Celular pendente'}
                    </span>
                  </p>
                )}
              </div>
            )}

            <CustomButton
              onClick={isLastSlide ? goToSuccess : handleNext}
              disabled={isPending}
              className={`bg-primary py-4 px-6 text-background text-sm font-normal leading-5 rounded-full h-[46px] hover:bg-primary/90 transition-all duration-500 ease-out 
        ${showUpdateButton ? 'w-[50%] flex-grow-0' : 'w-full flex-grow'}
        ${
          !showSuccess
            ? 'opacity-100 translate-x-0 scale-100'
            : 'opacity-0 translate-x-4 scale-95 pointer-events-none'
        }`}
            >
              {buttonText}
            </CustomButton>
          </div>
        </div>
      )}

      {/* Update Data Required Bottom Sheet */}
      <BottomSheet
        open={showUpdateInfoModal}
        onOpenChange={setShowUpdateInfoModal}
        title="Quase lá!"
        headerClassName="text-center p-0 mb-6"
      >
        <div className="text-center py-4">
          <h2 className="text-xl font-medium leading-6 text-popover-foreground mb-4">
            Quase lá!
          </h2>
          <p className="text-sm text-popover-foreground leading-5 mb-6">
            Para continuar sua inscrição no curso, você deve atualizar suas
            informações. É rápido e simples!
          </p>
          <Link
            className="bg-primary py-4 px-6 text-background text-sm font-normal leading-5 rounded-full w-full h-[46px] hover:bg-primary/90 transition-all duration-300 ease-out flex items-center justify-center"
            href={`/servicos/cursos/atualizar-dados?${
              courseSlug ? `&redirectFromCourses=${courseSlug}` : ''
            }`}
          >
            Atualizar Informações
          </Link>
        </div>
      </BottomSheet>
    </div>
  )
}
