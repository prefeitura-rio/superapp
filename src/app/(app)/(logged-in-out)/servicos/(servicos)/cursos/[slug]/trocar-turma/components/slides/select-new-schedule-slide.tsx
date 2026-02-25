'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { UserEnrollmentExtended } from '@/lib/course-utils'
import { formatDate, formatTimeRange } from '@/lib/date'
import { useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { ChangeScheduleFormData, NearbyUnit, Schedule } from '../../types'

interface SelectNewScheduleSlideProps {
  selectedUnit: NearbyUnit | null
  nearbyUnits?: NearbyUnit[]
  onlineClasses?: Schedule[]
  form: UseFormReturn<ChangeScheduleFormData>
  fieldName: keyof ChangeScheduleFormData
  currentEnrollment: UserEnrollmentExtended
  isOnlineCourse: boolean
}

export const SelectNewScheduleSlide = ({
  selectedUnit: initialSelectedUnit,
  nearbyUnits,
  onlineClasses = [],
  form,
  fieldName,
  currentEnrollment,
  isOnlineCourse,
}: SelectNewScheduleSlideProps) => {
  const {
    formState: { errors, touchedFields },
    setValue,
    watch,
    clearErrors,
    trigger,
  } = form

  const selectedValue = watch(fieldName as any)
  const selectedUnitId = watch('newUnitId')

  // Get the currently selected unit from form, or fall back to initialSelectedUnit
  const selectedUnit =
    nearbyUnits?.find(unit => unit.id === selectedUnitId) || initialSelectedUnit

  // Get current enrolled schedule ID from enrollment
  const currentScheduleId = (currentEnrollment as any)?.schedule_id

  // Determine which schedules to show
  const schedulesToShow = isOnlineCourse
    ? onlineClasses
    : selectedUnit?.schedules || []

  // Check if a schedule is available (has remaining_vacancies > 0)
  const isScheduleAvailable = (schedule: Schedule) => {
    return (
      schedule.remaining_vacancies !== undefined &&
      schedule.remaining_vacancies !== null &&
      schedule.remaining_vacancies > 0
    )
  }

  // Handle schedule selection with validation
  const handleScheduleChange = async (value: string) => {
    // Check if the selected schedule is available
    const selectedSchedule = schedulesToShow?.find(sch => sch.id === value)
    if (selectedSchedule && !isScheduleAvailable(selectedSchedule)) {
      // Don't allow selection of unavailable schedules
      return
    }
    setValue(fieldName as any, value, { shouldTouch: true })
    // Clear errors and revalidate immediately
    clearErrors(fieldName as any)
    await trigger(fieldName as any)
  }

  // Only show error if the field has been touched
  const shouldShowError =
    touchedFields[fieldName as keyof typeof touchedFields] &&
    errors[fieldName as keyof typeof errors]

  const [showTopFade, setShowTopFade] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const checkScroll = () => {
    if (!listRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = listRef.current

    setShowTopFade(scrollTop > 0)
    setShowBottomFade(scrollTop + clientHeight < scrollHeight - 1)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <unnecessary>
  useEffect(() => {
    checkScroll()
    const handleResize = () => checkScroll()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [selectedUnit, onlineClasses])

  if (!schedulesToShow || schedulesToShow.length === 0) {
    return (
      <div className="w-full space-y-5">
        <div className="text-left">
          <h2 className="text-3xl font-medium text-foreground mb-2 leading-9 tracking-tight">
            Nenhuma turma disponível
          </h2>
          <p className="text-muted-foreground">
            Não há turmas disponíveis para esta unidade no momento.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-left flex-shrink-0">
        <h2 className="text-3xl font-medium text-foreground mb-2 leading-9 tracking-tight">
          Escolha uma das{' '}
          <span className="text-primary">datas e horários disponíveis</span>
        </h2>
        {!isOnlineCourse && selectedUnit && (
          <p className="text-sm pt-8 pb-5 text-muted-foreground">
            {selectedUnit.address} - {selectedUnit.neighborhood}
          </p>
        )}
      </div>

      <div className="relative flex-1 min-h-0 overflow-hidden">
        <div
          ref={listRef}
          onScroll={checkScroll}
          className="overflow-y-auto pr-1 space-y-0 h-full"
        >
          <RadioGroup
            value={selectedValue}
            onValueChange={handleScheduleChange}
            className="w-full"
          >
            {schedulesToShow.map((schedule, index) => {
              const isAvailable = isScheduleAvailable(schedule)
              const isCurrentSchedule = schedule.id === currentScheduleId
              return (
                <label
                  key={schedule.id}
                  htmlFor={schedule.id}
                  className={`
                    flex items-start justify-between py-4 px-1 transition-colors
                    ${isAvailable && !isCurrentSchedule ? 'cursor-pointer hover:bg-muted/30' : 'cursor-not-allowed opacity-50'}
                    ${index !== schedulesToShow.length - 1 ? 'border-b border-border' : ''}
                  `}
                >
                  <div className="flex flex-col gap-1 flex-1">
                    <h3 className="font-medium text-foreground">
                      {formatDate(schedule.class_start_date)} •{' '}
                      {formatTimeRange(schedule.class_time)}
                      {isCurrentSchedule && (
                        <span className="text-primary text-xs ml-2">
                          (Turma atual)
                        </span>
                      )}
                      {!isAvailable && !isCurrentSchedule && (
                        <span className="text-muted-foreground text-xs ml-2">
                          (Sem vagas disponíveis)
                        </span>
                      )}
                    </h3>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      <p>{schedule.class_days}</p>
                      {schedule.remaining_vacancies !== undefined && (
                        <p>
                          <span className="font-medium">Vagas:</span>{' '}
                          {schedule.remaining_vacancies} disponíveis
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center ml-2">
                    <RadioGroupItem
                      value={schedule.id}
                      id={schedule.id}
                      disabled={!isAvailable || isCurrentSchedule}
                    />
                  </div>
                </label>
              )
            })}
          </RadioGroup>
        </div>

        {showTopFade && (
          <div className="pointer-events-none absolute top-0 left-0 w-full h-15 bg-gradient-to-b from-background to-transparent" />
        )}

        {showBottomFade && (
          <div className="pointer-events-none absolute bottom-0 left-0 w-full h-15 bg-gradient-to-t from-background to-transparent" />
        )}
      </div>

      {shouldShowError && (
        <p className="text-destructive text-sm mt-3 flex-shrink-0">
          {errors[fieldName as keyof typeof errors]?.message}
        </p>
      )}
    </div>
  )
}
