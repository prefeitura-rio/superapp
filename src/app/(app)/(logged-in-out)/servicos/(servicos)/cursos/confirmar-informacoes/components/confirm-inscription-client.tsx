'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import type { SwiperRef } from 'swiper/react'

import { ChevronLeftIcon } from '@/assets/icons'
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

export type ContactUpdateStatus = {
  phoneNeedsUpdate: boolean
  emailNeedsUpdate: boolean
}

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
  contactUpdateStatus?: ContactUpdateStatus
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
  contactUpdateStatus,
}: ConfirmInscriptionClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const swiperRef = useRef<SwiperRef>(null)
  const [isPending, startTransition] = useTransition()
  const showUpdateButton = currentIndex === 0
  const router = useRouter()

  const { isBelowBreakpoint } = useViewportHeight(648)

  // Check if user has email/phone - variable for reuse
  const hasEmail = hasValidEmail(userInfo.email)
  const hasPhone = hasValidPhone(userInfo.phone)
  const hasValidContactInfo = hasEmail && hasPhone

  // Check if any contact info needs update
  const needsContactUpdate =
    contactUpdateStatus?.phoneNeedsUpdate ||
    contactUpdateStatus?.emailNeedsUpdate

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
        customFields.map(field => [
          `custom_${field.id}`,
          field.field_type === 'multiselect' ? [] : ''
        ])
      ),
    },
  })

  const slides = [
    {
      id: 'confirm-user-data',
      component: ConfirmUserDataSlide,
      props: { userInfo, userAuthInfo, contactUpdateStatus },
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
          customFields: customFields.map(field => {
            const fieldValue = formData[`custom_${field.id}` as keyof InscriptionFormData]
            let value: string

            if (field.field_type === 'text') {
              // For text, use the value directly
              value = (fieldValue as string) || ''
            } else if (field.field_type === 'multiselect') {
              // For multiselect, map IDs to values and join
              if (Array.isArray(fieldValue)) {
                const selectedOptions = fieldValue
                  .map(selectedId =>
                    field.options?.find(option => option.id === selectedId)?.value
                  )
                  .filter(Boolean)
                value = selectedOptions.join(', ')
              } else {
                value = ''
              }
            } else {
              // For radio and select, map ID to value
              const selectedOption = field.options?.find(option => option.id === fieldValue)
              value = selectedOption?.value || ''
            }

            return {
              id: field.id,
              title: field.title,
              value,
              required: field.required,
            }
          }),
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
    router.push(`/servicos/cursos/${courseSlug ?? ''}`)
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
          {needsContactUpdate && hasEmail && hasPhone ? (
            <p className="mb-8">
              <span className="text-muted-foreground text-sm">
                * Atualização Obrigatória
              </span>
            </p>
          ) : (
            (!hasEmail || !hasPhone) && (
              <p className="mb-8">
                <span className="text-muted-foreground text-sm">
                  * Campo Obrigatório
                </span>
              </p>
            )
          )}
          <div className="flex justify-center gap-3 w-full transition-all duration-500 ease-out">
            {showUpdateButton && (
              <div className="flex flex-col items-center w-[50%]">
                <Link
                  className={`bg-card py-4 px-6 text-sm font-normal leading-5 rounded-full w-full h-[46px] hover:bg-card/90 transition-all duration-500 ease-out ring-0 outline-0 flex items-center justify-center ${
                    showUpdateButton
                      ? 'opacity-100 translate-x-0 scale-100 text-foreground'
                      : 'opacity-0 -translate-x-4 scale-95 pointer-events-none flex-0'
                  }
                  ${(!hasValidContactInfo || needsContactUpdate) && '!text-background bg-primary hover:bg-primary'}
                  `}
                  href={`/servicos/cursos/atualizar-dados?redirectFromCourses=${courseSlug}`}
                >
                  Atualizar
                </Link>
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
        }
        ${showUpdateButton && (!hasValidContactInfo || needsContactUpdate) && 'bg-card text-muted-foreground cursor-not-allowed hover:bg-card pointer-events-none'}        
        `}
            >
              {buttonText}
            </CustomButton>
          </div>
        </div>
      )}
    </div>
  )
}
