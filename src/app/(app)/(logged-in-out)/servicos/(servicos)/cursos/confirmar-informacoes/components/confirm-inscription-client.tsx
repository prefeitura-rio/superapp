'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import type { SwiperRef } from 'swiper/react'

import { ChevronLeftIcon } from '@/assets/icons'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { ConfirmInscriptionSlider } from './confirm-inscription-slider'
import ConfirmUserDataSlide from './slides/confirm-user-data-slide'
import { CustomFieldSlide } from './slides/custom-field-slide'
import { SelectOnlineClassSlide } from './slides/select-online-class-slide'
import { SelectScheduleSlide } from './slides/select-schedule-slide'
import { SelectUnitSlide } from './slides/select-unit-slide'
import { SuccessSlide } from './slides/success-slide'

import { submitCourseInscription } from '@/actions/courses/submit-inscription'

import { getEmailValue, hasValidEmail } from '@/helpers/email-data-helpers'
import { getPhoneValue, hasValidPhone } from '@/helpers/phone-data-helpers'
import { calculateAge } from '@/lib/calculate-age'
import { formatAddressComplete } from '@/lib/format-address-complete'
import {
  type CourseUserInfo,
  type CustomField,
  type InscriptionFormData,
  type NearbyUnit,
  type Schedule,
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
  onlineClasses?: Schedule[]
  courseInfo: any // Add courseInfo prop
  courseId: string
  courseSlug?: string
  contactUpdateStatus?: ContactUpdateStatus
  preselectedLocationId?: string
  preselectedClassId?: string
  shouldShowConfirmationScreen?: boolean
}

const TRANSITIONS = {
  FADE: 600,
} as const

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export function ConfirmInscriptionClient({
  userInfo,
  userAuthInfo,
  nearbyUnits,
  onlineClasses = [],
  courseInfo,
  courseId,
  courseSlug,
  contactUpdateStatus,
  preselectedLocationId,
  preselectedClassId,
  shouldShowConfirmationScreen = true,
}: ConfirmInscriptionClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const swiperRef = useRef<SwiperRef>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Helper to check if a value is valid (not null, undefined, empty string, or "null" string)
  const isValidAddressValue = (value: string | null | undefined): boolean => {
    if (!value || value === null || value === undefined) return false
    const trimmed = String(value).trim()
    return trimmed !== '' && trimmed.toLowerCase() !== 'null'
  }

  // Check if user has email/phone - variable for reuse
  const hasEmail = hasValidEmail(userInfo.email)
  const hasPhone = hasValidPhone(userInfo.phone)
  const hasAddress = !!(
    userInfo.address?.logradouro &&
    isValidAddressValue(userInfo.address.logradouro) &&
    userInfo.address?.bairro &&
    isValidAddressValue(userInfo.address.bairro) &&
    userInfo.address?.municipio &&
    isValidAddressValue(userInfo.address.municipio)
  )
  const hasGender = !!userInfo.genero
  const hasEducation = !!userInfo.escolaridade
  const hasFamilyIncome = !!userInfo.renda_familiar
  const hasDisability = !!userInfo.deficiencia

  // Only require phone, email, and address for course enrollment
  const hasAllRequiredFields = hasPhone && hasEmail && hasAddress

  // Check if any contact info needs update
  const needsContactUpdate =
    contactUpdateStatus?.phoneNeedsUpdate ||
    contactUpdateStatus?.emailNeedsUpdate

  // Extract custom fields from course info
  const customFields: CustomField[] =
    (courseInfo as any)?.data?.custom_fields || []

  // Determine if we need to show unit/schedule selection
  const hasUnits = nearbyUnits && nearbyUnits.length > 0
  const hasMultipleUnits = nearbyUnits && nearbyUnits.length > 1

  // Helper to check if a class is available (has remaining_vacancies > 0)
  const isClassAvailable = (cls: Schedule) => {
    return (
      cls.remaining_vacancies !== undefined &&
      cls.remaining_vacancies !== null &&
      cls.remaining_vacancies > 0
    )
  }

  // Helper to check if a schedule is available (has remaining_vacancies > 0)
  const isScheduleAvailable = (schedule: Schedule) => {
    return (
      schedule.remaining_vacancies !== undefined &&
      schedule.remaining_vacancies !== null &&
      schedule.remaining_vacancies > 0
    )
  }

  // Filter available online classes for initial selection and validation
  const availableOnlineClasses = onlineClasses.filter(isClassAvailable)

  // Check if this is an online course with multiple classes (only count available ones for selection logic)
  const hasOnlineClasses = availableOnlineClasses.length > 0
  const hasMultipleOnlineClasses = availableOnlineClasses.length > 1

  // Check if any unit has multiple available schedules (needed for schema validation)
  const hasAnyUnitWithMultipleSchedules =
    nearbyUnits?.some(unit => {
      const availableSchedules =
        unit.schedules?.filter(isScheduleAvailable) || []
      return availableSchedules.length > 1
    }) || false

  // Determine initial unit selection
  const getInitialUnitId = () => {
    // If preselectedLocationId is provided and exists in nearbyUnits, use it
    if (preselectedLocationId) {
      const preselectedUnit = nearbyUnits.find(
        unit => unit.id === preselectedLocationId
      )
      if (preselectedUnit) {
        return preselectedLocationId
      }
    }
    // Otherwise, if there's only one unit, automatically select it
    if (nearbyUnits && nearbyUnits.length === 1) {
      return nearbyUnits[0].id
    }
    // If multiple units, start with empty (user must select)
    if (nearbyUnits && nearbyUnits.length > 1) {
      return ''
    }
    return 'no-units-available'
  }

  const initialUnitId = getInitialUnitId()
  const initialUnit = nearbyUnits?.find(unit => unit.id === initialUnitId)

  // Determine initial schedule selection
  const getInitialScheduleId = () => {
    if (initialUnit && initialUnit.schedules) {
      // Filter available schedules (with remaining_vacancies > 0)
      const availableSchedules = initialUnit.schedules.filter(
        isScheduleAvailable
      )
      if (availableSchedules.length === 1) {
        return availableSchedules[0].id
      }
    }
    return ''
  }

  // Determine initial online class selection
  const getInitialOnlineClassId = () => {
    // If preselectedClassId is provided and exists in availableOnlineClasses, use it
    if (preselectedClassId) {
      const preselectedClass = availableOnlineClasses.find(
        cls => cls.id === preselectedClassId
      )
      if (preselectedClass) {
        return preselectedClassId
      }
    }
    // Otherwise, if there's only one available online class, automatically select it
    if (availableOnlineClasses.length === 1) {
      return availableOnlineClasses[0].id
    }
    // If multiple classes, start with empty (user must select)
    return ''
  }

  const form = useForm<InscriptionFormData>({
    resolver: zodResolver(
      createInscriptionSchema(
        hasUnits, // Require selection if there are units available
        hasAnyUnitWithMultipleSchedules || hasMultipleOnlineClasses, // Require scheduleId if multiple schedules or online classes
        customFields
      )
    ),
    defaultValues: {
      unitId: initialUnitId,
      scheduleId: hasOnlineClasses
        ? getInitialOnlineClassId()
        : getInitialScheduleId(),
      description: '',
      // Initialize custom fields with empty values
      ...Object.fromEntries(
        customFields.map(field => [
          `custom_${field.id}`,
          field.field_type === 'multiselect' ? [] : '',
        ])
      ),
    },
  })

  // Get selected unit after form is initialized
  const selectedUnitId = form.watch('unitId')
  const selectedUnit = nearbyUnits?.find(unit => unit.id === selectedUnitId)
  const hasMultipleSchedules = selectedUnit
    ? selectedUnit.schedules.length > 1
    : false

  // Auto-select scheduleId when unit changes
  useEffect(() => {
    if (selectedUnitId && selectedUnit) {
      const currentScheduleId = form.getValues('scheduleId')

      // If there's only one schedule, always auto-select it
      if (selectedUnit.schedules.length === 1) {
        form.setValue('scheduleId', selectedUnit.schedules[0].id)
      } else if (selectedUnit.schedules.length > 1) {
        // If multiple schedules, check if current selection is valid
        const scheduleExists = selectedUnit.schedules.some(
          s => s.id === currentScheduleId
        )
        if (!scheduleExists) {
          // Reset to empty so user must select from multiple options
          form.setValue('scheduleId', '')
        }
      }
    }
  }, [selectedUnitId, selectedUnit, form])

  // Use initialUnit for initial slide construction, or selectedUnit if it exists
  const unitForScheduleSlide = selectedUnit || initialUnit
  // Only show schedule slide if the selected unit has multiple schedules
  const shouldShowScheduleSlide =
    unitForScheduleSlide &&
    unitForScheduleSlide.schedules &&
    unitForScheduleSlide.schedules.length > 1

  // Only show online class slide if there are multiple online classes
  // If there's only one online class, it's automatically selected and no slide is needed
  const shouldShowOnlineClassSlide = hasMultipleOnlineClasses

  // Build slides array for subsequent steps (after confirmation)
  const subsequentSlides = hasAllRequiredFields
    ? [
        // For online courses: show online class selection if multiple classes
        ...(hasOnlineClasses && !hasUnits
          ? shouldShowOnlineClassSlide
            ? [
                {
                  id: 'select-online-class',
                  component: SelectOnlineClassSlide,
                  props: {
                    onlineClasses,
                    form,
                    fieldName: 'scheduleId',
                  },
                  showPagination: true,
                  showBackButton: true,
                },
              ]
            : []
          : []),
        // Only show select-unit slide if there are multiple units
        // If there's only one unit, it's automatically selected and no slide is needed
        ...(hasMultipleUnits
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
        // Only show select-schedule slide if the selected unit has multiple schedules
        // If there's only one schedule, it's automatically selected and no slide is needed
        ...(shouldShowScheduleSlide
          ? [
              {
                id: 'select-schedule',
                component: SelectScheduleSlide,
                props: {
                  selectedUnit: unitForScheduleSlide,
                  nearbyUnits,
                  form,
                  fieldName: 'scheduleId',
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
    : []

  // Always show confirmation screen if fields are outdated OR if there are no other slides
  const shouldShowConfirmation =
    shouldShowConfirmationScreen || subsequentSlides.length === 0

  const slides = [
    ...(shouldShowConfirmation
      ? [
          {
            id: 'confirm-user-data',
            component: ConfirmUserDataSlide,
            props: { userInfo, userAuthInfo, contactUpdateStatus, courseSlug },
            showPagination: false,
            showBackButton: true,
          },
        ]
      : []),
    ...subsequentSlides,
  ]

  const handleNext = async () => {
    if (currentIndex === slides.length - 1 && hasAllRequiredFields) {
      const isValid = await form.trigger()
      if (isValid) {
        await goToSuccess()
      }
    } else {
      const currentSlide = slides[currentIndex]
      // Handle online class selection validation
      if (currentSlide.id === 'select-online-class' && hasOnlineClasses) {
        const isValid = await form.trigger('scheduleId')
        if (!isValid) {
          // Mark field as touched so error appears
          form.setValue('scheduleId', form.getValues('scheduleId'), {
            shouldTouch: true,
          })
          return
        }
      }

      if (currentSlide.id === 'select-unit' && hasUnits) {
        const isUnitValid = await form.trigger('unitId')
        if (!isUnitValid) return

        // After selecting unit, if it has multiple schedules, ensure schedule is selected
        if (
          selectedUnit &&
          selectedUnit.schedules &&
          selectedUnit.schedules.length > 1
        ) {
          const isScheduleValid = await form.trigger('scheduleId')
          if (!isScheduleValid) {
            // Mark field as touched so error appears
            form.setValue('scheduleId', form.getValues('scheduleId'), {
              shouldTouch: true,
            })

            // Don't advance, stay on current slide or go to schedule slide if it exists
            const scheduleSlideIndex = slides.findIndex(
              slide => slide.id === 'select-schedule'
            )
            if (scheduleSlideIndex !== -1) {
              // Navigate to schedule slide to show error
              setCurrentIndex(scheduleSlideIndex)
              swiperRef.current?.swiper?.slideTo(scheduleSlideIndex)
            }
            return
          }
        }
      }

      if (
        currentSlide.id === 'select-schedule' &&
        selectedUnit &&
        selectedUnit.schedules &&
        selectedUnit.schedules.length > 1
      ) {
        const isValid = await form.trigger('scheduleId')
        if (!isValid) {
          // Mark field as touched so error appears
          form.setValue('scheduleId', form.getValues('scheduleId'), {
            shouldTouch: true,
          })
          return
        }
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
    // Check online class selection if required (when there are multiple online classes)
    if (hasMultipleOnlineClasses && !hasUnits) {
      const onlineClassSlideIndex = slides.findIndex(
        slide => slide.id === 'select-online-class'
      )
      if (onlineClassSlideIndex !== -1) {
        const isOnlineClassValid = await form.trigger('scheduleId')
        if (!isOnlineClassValid) {
          // Mark field as touched so error appears
          form.setValue('scheduleId', form.getValues('scheduleId'), {
            shouldTouch: true,
          })
          return onlineClassSlideIndex
        }
      }
    }

    // Check unit selection if required (when there are units available)
    if (hasUnits) {
      const isUnitValid = await form.trigger('unitId')
      if (!isUnitValid) {
        // If there's a slide for unit selection, navigate to it
        const unitSlideIndex = slides.findIndex(
          slide => slide.id === 'select-unit'
        )
        if (unitSlideIndex !== -1) {
          return unitSlideIndex
        }
        // If no slide exists (single unit case), still return error but don't navigate
        // This shouldn't happen if getInitialUnitId() works correctly, but it's a safety check
        return null
      }
    }

    // Check schedule selection if required (when selected unit has multiple schedules)
    if (
      selectedUnit &&
      selectedUnit.schedules &&
      selectedUnit.schedules.length > 1
    ) {
      const isScheduleValid = await form.trigger('scheduleId')
      if (!isScheduleValid) {
        // Mark field as touched so error appears
        form.setValue('scheduleId', form.getValues('scheduleId'), {
          shouldTouch: true,
        })

        // Try to find the schedule slide first
        const scheduleSlideIndex = slides.findIndex(
          slide => slide.id === 'select-schedule'
        )
        if (scheduleSlideIndex !== -1) {
          return scheduleSlideIndex
        }
        // If schedule slide doesn't exist in slides array, find unit slide to show error
        const unitSlideIndex = slides.findIndex(
          slide => slide.id === 'select-unit'
        )
        if (unitSlideIndex !== -1) {
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

        // Get the selected schedule ID
        // For online courses: if there's only one online class, use it automatically
        // For in-person courses: if there's only one schedule in the selected unit, use it automatically
        // Otherwise, use the scheduleId from the form (user selected it)
        let finalScheduleId = formData.scheduleId
        if (!finalScheduleId) {
          if (hasOnlineClasses && availableOnlineClasses.length === 1) {
            // Auto-select if only one online class
            finalScheduleId = availableOnlineClasses[0].id
          } else if (selectedUnit && selectedUnit.schedules) {
            // Filter available schedules (with remaining_vacancies > 0)
            const availableSchedules = selectedUnit.schedules.filter(
              isScheduleAvailable
            )
            if (availableSchedules.length === 1) {
              // Auto-select if only one available schedule in selected unit
              finalScheduleId = availableSchedules[0].id
            }
          }
        }

        const result = await submitCourseInscription({
          courseId,
          userInfo: {
            cpf: userAuthInfo.cpf,
            name: userAuthInfo.name,
            email: getEmailValue(userInfo.email),
            phone: getPhoneValue(userInfo.phone),
          },
          unitId: hasUnits && formData.unitId ? formData.unitId : undefined,
          scheduleId: finalScheduleId,
          enrolledUnit:
            hasUnits && formData.unitId
              ? nearbyUnits.find(unit => unit.id === formData.unitId)
              : undefined,
          customFields: {
            // Add custom fields from form
            ...customFields.reduce(
              (acc, field) => {
                const fieldValue =
                  formData[`custom_${field.id}` as keyof InscriptionFormData]
                let value: string

                if (field.field_type === 'text') {
                  // For text, use the value directly
                  value = (fieldValue as string) || ''
                } else if (field.field_type === 'multiselect') {
                  // For multiselect, map IDs to values and join
                  if (Array.isArray(fieldValue)) {
                    const selectedOptions = fieldValue
                      .map(
                        selectedId =>
                          field.options?.find(
                            option => option.id === selectedId
                          )?.value
                      )
                      .filter(Boolean)
                    value = selectedOptions.join(', ')
                  } else {
                    value = ''
                  }
                } else {
                  // For radio and select, map ID to value
                  const selectedOption = field.options?.find(
                    option => option.id === fieldValue
                  )
                  value = selectedOption?.value || ''
                }

                acc[field.id] = {
                  id: field.id,
                  title: field.title,
                  value,
                  required: field.required,
                }
                return acc
              },
              {} as Record<string, unknown>
            ),
            // Add complementary information
            idade: {
              id: 'idade',
              title: 'Idade',
              value: calculateAge(userInfo.nascimento?.data)?.toString() || '',
              required: false,
            },
            endereco: {
              id: 'endereco',
              title: 'Endereço',
              value: formatAddressComplete(userInfo.address),
              required: false,
            },
            bairro: {
              id: 'bairro',
              title: 'Bairro',
              value: userInfo.address?.bairro || '',
              required: false,
            },
            cidade: {
              id: 'cidade',
              title: 'Cidade',
              value: userInfo.address?.municipio || '',
              required: false,
            },
            estado: {
              id: 'estado',
              title: 'Estado',
              value: userInfo.address?.estado || '',
              required: false,
            },
            pessoa_com_deficiencia: {
              id: 'pessoa_com_deficiencia',
              title: 'Pessoa com deficiência',
              value: userInfo.deficiencia || '',
              required: false,
            },
            raca: {
              id: 'raca',
              title: 'Raça',
              value: userInfo.raca || '',
              required: false,
            },
            genero: {
              id: 'genero',
              title: 'Gênero',
              value: userInfo.genero || '',
              required: false,
            },
            renda_familiar: {
              id: 'renda_familiar',
              title: 'Renda familiar',
              value: userInfo.renda_familiar || '',
              required: false,
            },
            escolaridade: {
              id: 'escolaridade',
              title: 'Escolaridade',
              value: userInfo.escolaridade || '',
              required: false,
            },
          },
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
        router.push(`/servicos/cursos/${courseId}`)
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
  const isLastSlide = currentIndex === slides.length - 1 && hasAllRequiredFields
  const buttonText = isLastSlide ? 'Confirmar inscrição' : 'Continuar'

  return (
    <div className="fixed inset-0 w-full bg-background flex flex-col overflow-hidden">
      <div className="w-full max-w-4xl mx-auto px-4 flex flex-col h-full">
        <div className="relative h-11 pb-4 flex-shrink-0 pt-8 justify-self-start self-start flex items-center">
          <CustomButton
            className={`bg-card text-muted-foreground rounded-full w-11 h-11 hover:bg-card/80 outline-none focus:ring-0 transition-all duration-300 ease-out ${
              showBackButton
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-2 pointer-events-none'
            }`}
            onClick={handleBack}
            disabled={isPending}
            data-testid="back-button"
          >
            <ChevronLeftIcon className="text-foreground" />
          </CustomButton>
        </div>

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
              <SuccessSlide onFinish={handleFinish} />
            </div>
          )}
        </div>

        {!showSuccess && (
          <div className="flex-shrink-0 pb-12">
            {!hasAllRequiredFields && currentIndex === 0 && (
              <p className="mb-8">
                <span className="text-muted-foreground text-sm">
                  * Campos obrigatórios devem ser preenchidos
                </span>
              </p>
            )}
            <div className="flex justify-center gap-3 w-full transition-all duration-500 ease-out">
              <CustomButton
                onClick={isLastSlide ? goToSuccess : handleNext}
                disabled={
                  isPending || (currentIndex === 0 && !hasAllRequiredFields)
                }
                className={`bg-primary py-4 px-6 text-background text-sm font-normal leading-5 rounded-full h-[46px] hover:bg-primary/90 transition-all duration-500 ease-out w-full flex-grow
        ${
          !showSuccess
            ? 'opacity-100 translate-x-0 scale-100'
            : 'opacity-0 translate-x-4 scale-95 pointer-events-none'
        }
        ${currentIndex === 0 && !hasAllRequiredFields && 'bg-card text-muted-foreground cursor-not-allowed hover:bg-card pointer-events-none'}        
        `}
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
