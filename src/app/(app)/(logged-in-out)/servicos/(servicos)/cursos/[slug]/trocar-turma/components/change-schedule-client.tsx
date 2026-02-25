'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import type { SwiperRef } from 'swiper/react'

import { changeSchedule } from '@/actions/courses/change-schedule'
import { ChevronLeftIcon } from '@/assets/icons'
import { CustomButton } from '@/components/ui/custom/custom-button'
import type { UserEnrollmentExtended } from '@/lib/course-utils'
import { useRouter } from 'next/navigation'
import { ConfirmInscriptionSlider } from '../../../confirmar-informacoes/components/confirm-inscription-slider'
import {
  type ChangeScheduleFormData,
  type NearbyUnit,
  type Schedule,
  createChangeScheduleSchema,
} from '../types'
import { ChangeSuccessSlide } from './slides/change-success-slide'
import { SelectNewScheduleSlide } from './slides/select-new-schedule-slide'
import { SelectNewUnitSlide } from './slides/select-new-unit-slide'

interface ChangeScheduleClientProps {
  course: any
  userEnrollment: UserEnrollmentExtended
  nearbyUnits: NearbyUnit[]
  onlineClasses?: Schedule[]
  courseSlug: string
  isOnlineCourse: boolean
}

const TRANSITIONS = {
  FADE: 600,
} as const

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export function ChangeScheduleClient({
  course,
  userEnrollment,
  nearbyUnits,
  onlineClasses = [],
  courseSlug,
  isOnlineCourse,
}: ChangeScheduleClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const swiperRef = useRef<SwiperRef>(null)
  const router = useRouter()

  // Helper to check if a schedule is available (has remaining_vacancies > 0)
  const isScheduleAvailable = (schedule: Schedule) => {
    return (
      schedule.remaining_vacancies !== undefined &&
      schedule.remaining_vacancies !== null &&
      schedule.remaining_vacancies > 0
    )
  }

  // Determine if we have multiple units to choose from
  const hasMultipleUnits = nearbyUnits && nearbyUnits.length > 1
  const hasUnits = nearbyUnits && nearbyUnits.length > 0

  // For online courses, check available classes
  const availableOnlineClasses = onlineClasses.filter(isScheduleAvailable)
  const hasMultipleOnlineClasses = availableOnlineClasses.length > 1

  // Create form with dynamic schema
  const form = useForm<ChangeScheduleFormData>({
    resolver: zodResolver(
      createChangeScheduleSchema(hasMultipleUnits && !isOnlineCourse)
    ),
    defaultValues: {
      newUnitId: '',
      newScheduleId: '',
    },
  })

  // Watch selected unit to update schedule options
  const selectedUnitId = form.watch('newUnitId')
  const selectedUnit = nearbyUnits?.find(unit => unit.id === selectedUnitId)

  // Auto-select schedule if only one available in selected unit
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (selectedUnitId && selectedUnit) {
      const availableSchedules =
        selectedUnit.schedules?.filter(isScheduleAvailable) || []
      if (availableSchedules.length === 1) {
        form.setValue('newScheduleId', availableSchedules[0].id)
      } else {
        // Reset schedule selection when unit changes
        form.setValue('newScheduleId', '')
      }
    }
  }, [selectedUnitId, selectedUnit, form])

  // Determine which slides to show
  const shouldShowUnitSlide = hasMultipleUnits && !isOnlineCourse
  const shouldShowScheduleSlide = true // Always show schedule slide

  // Build slides array
  const slides = [
    // Unit selection slide (only for presential courses with multiple units)
    ...(shouldShowUnitSlide
      ? [
          {
            id: 'select-new-unit',
            component: SelectNewUnitSlide,
            props: {
              nearbyUnits,
              form,
              fieldName: 'newUnitId',
              currentEnrollment: userEnrollment,
            },
            showPagination: true,
            showBackButton: true,
          },
        ]
      : []),
    // Schedule selection slide
    ...(shouldShowScheduleSlide
      ? [
          {
            id: 'select-new-schedule',
            component: SelectNewScheduleSlide,
            props: {
              selectedUnit: selectedUnit || (hasUnits ? nearbyUnits[0] : null),
              nearbyUnits,
              onlineClasses: availableOnlineClasses,
              form,
              fieldName: 'newScheduleId',
              currentEnrollment: userEnrollment,
              isOnlineCourse,
            },
            showPagination: true,
            showBackButton: true,
          },
        ]
      : []),
  ]

  const handleNext = async () => {
    const currentSlide = slides[currentIndex]
    const isLastSlide = currentIndex === slides.length - 1

    // Validate current slide
    if (currentSlide.id === 'select-new-unit') {
      const isValid = await form.trigger('newUnitId')
      if (!isValid) {
        form.setValue('newUnitId', form.getValues('newUnitId'), {
          shouldTouch: true,
        })
        return
      }
    }

    if (currentSlide.id === 'select-new-schedule') {
      const isValid = await form.trigger('newScheduleId')
      if (!isValid) {
        form.setValue('newScheduleId', form.getValues('newScheduleId'), {
          shouldTouch: true,
        })
        return
      }
    }

    if (isLastSlide) {
      // Final step - prepare data and show success
      await goToSuccess()
    } else {
      swiperRef.current?.swiper?.slideNext()
    }
  }

  const handleBack = () => {
    if (showSuccess) {
      // From success, go back to course page
      router.push(`/servicos/cursos/${courseSlug}`)
      return
    }
    if (currentIndex === 0) {
      // First slide - go back to course page
      router.push(`/servicos/cursos/${courseSlug}`)
      return
    }
    swiperRef.current?.swiper?.slidePrev()
  }

  const goToSuccess = async () => {
    setIsSubmitting(true)

    const formData = form.getValues()

    // Build request data structure
    const selectedScheduleId = formData.newScheduleId
    let finalUnit: NearbyUnit | null = null
    let finalSchedule: Schedule | null = null

    if (isOnlineCourse) {
      // For online courses, find the selected schedule from online classes
      finalSchedule =
        onlineClasses.find(cls => cls.id === selectedScheduleId) || null
    } else {
      // For presential courses
      finalUnit = selectedUnit || (hasUnits ? nearbyUnits[0] : null)
      if (finalUnit) {
        finalSchedule =
          finalUnit.schedules?.find(sch => sch.id === selectedScheduleId) ||
          null
      }
    }

    // Build enrolled unit for API
    const enrolledUnit = finalUnit
      ? {
          id: finalUnit.id,
          curso_id: finalUnit.curso_id,
          address: finalUnit.address,
          neighborhood: finalUnit.neighborhood,
          neighborhood_zone: (finalUnit as any).neighborhood_zone as
            | string
            | undefined,
          schedules: finalSchedule
            ? [
                {
                  id: finalSchedule.id,
                  location_id: finalSchedule.location_id,
                  vacancies: finalSchedule.vacancies,
                  class_start_date: finalSchedule.class_start_date,
                  class_end_date: finalSchedule.class_end_date,
                  class_time: finalSchedule.class_time,
                  class_days: finalSchedule.class_days,
                  remaining_vacancies: finalSchedule.remaining_vacancies,
                },
              ]
            : [],
        }
      : {
          id: 'online',
          curso_id: course.id as number,
          address: 'Online',
          neighborhood: 'Online',
          schedules: finalSchedule
            ? [
                {
                  id: finalSchedule.id,
                  location_id: finalSchedule.location_id,
                  vacancies: finalSchedule.vacancies,
                  class_start_date: finalSchedule.class_start_date,
                  class_end_date: finalSchedule.class_end_date,
                  class_time: finalSchedule.class_time,
                  class_days: finalSchedule.class_days,
                  remaining_vacancies: finalSchedule.remaining_vacancies,
                },
              ]
            : [],
        }

    try {
      const result = await changeSchedule({
        enrollmentId: userEnrollment.id,
        courseId: course.id as number,
        scheduleId: selectedScheduleId,
        enrolledUnit,
      })

      if (result.success) {
        setFadeOut(true)
        await delay(TRANSITIONS.FADE)
        setShowSuccess(true)
        setFadeOut(false)
      } else {
        toast.error(result.error || 'Erro ao trocar de turma')
      }
    } catch (error) {
      toast.error('Erro ao trocar de turma. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFinish = () => {
    router.push(`/servicos/cursos/${courseSlug}`)
  }

  const currentSlide = slides[currentIndex]
  const showBackButton = currentIndex >= 0 || showSuccess
  const isLastSlide = currentIndex === slides.length - 1
  const buttonText = isSubmitting
    ? 'Trocando...'
    : isLastSlide
      ? 'Confirmar troca'
      : 'Continuar'

  return (
    <div className="fixed inset-0 w-full bg-background flex flex-col overflow-hidden">
      <div className="w-full max-w-4xl mx-auto px-4 flex flex-col h-full">
        {/* Back button header */}
        <div className="relative h-11 pb-4 flex-shrink-0 pt-8 justify-self-start self-start flex items-center">
          <CustomButton
            className={`bg-card text-muted-foreground rounded-full w-11 h-11 hover:bg-card/80 outline-none focus:ring-0 transition-all duration-300 ease-out ${
              showBackButton
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-2 pointer-events-none'
            }`}
            onClick={handleBack}
            data-testid="back-button"
          >
            <ChevronLeftIcon className="text-foreground" />
          </CustomButton>
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col overflow-hidden py-8">
          {!showSuccess && (
            <div
              className={`h-full transition-opacity duration-600 ${
                fadeOut ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <ConfirmInscriptionSlider
                ref={swiperRef}
                slides={slides}
                onSlideChange={index => setCurrentIndex(index)}
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
              <ChangeSuccessSlide onFinish={handleFinish} />
            </div>
          )}
        </div>

        {/* Bottom button */}
        {!showSuccess && (
          <div className="flex-shrink-0 pb-12">
            <div className="flex justify-center gap-3 w-full transition-all duration-500 ease-out">
              <CustomButton
                onClick={handleNext}
                disabled={isSubmitting}
                className="bg-primary py-4 px-6 text-background text-sm font-normal leading-5 rounded-full h-[46px] hover:bg-primary/90 transition-all duration-500 ease-out w-full flex-grow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buttonText}
              </CustomButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
