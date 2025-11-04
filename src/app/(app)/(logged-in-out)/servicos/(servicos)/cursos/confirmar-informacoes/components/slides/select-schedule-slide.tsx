'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { formatDate, formatTimeRange } from '@/lib/date'
import { useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { InscriptionFormData, NearbyUnit } from '../../types'

interface SelectScheduleSlideProps {
  selectedUnit: NearbyUnit | null
  nearbyUnits?: NearbyUnit[]
  form: UseFormReturn<InscriptionFormData>
  fieldName: keyof InscriptionFormData
}

export const SelectScheduleSlide = ({
  selectedUnit: initialSelectedUnit,
  nearbyUnits,
  form,
  fieldName,
}: SelectScheduleSlideProps) => {
  const {
    formState: { errors, touchedFields },
    setValue,
    watch,
    clearErrors,
    trigger,
  } = form

  const selectedValue = watch(fieldName as any)
  const selectedUnitId = watch('unitId')

  // Get the currently selected unit from form, or fall back to initialSelectedUnit
  const selectedUnit =
    nearbyUnits?.find(unit => unit.id === selectedUnitId) || initialSelectedUnit

  // Handle schedule selection with validation
  const handleScheduleChange = async (value: string) => {
    setValue(fieldName as any, value, { shouldTouch: true })
    // Clear errors and revalidate immediately
    clearErrors(fieldName as any)
    await trigger(fieldName as any)
  }

  // Only show error if the field has been touched or if an error exists after trigger
  const shouldShowError = touchedFields[fieldName as keyof typeof touchedFields] && errors[fieldName as keyof typeof errors]

  const [showTopFade, setShowTopFade] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(false)
  const [maxHeight, setMaxHeight] = useState('300px')
  const listRef = useRef<HTMLDivElement>(null)

  const checkScroll = () => {
    if (!listRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = listRef.current

    setShowTopFade(scrollTop > 0)
    setShowBottomFade(scrollTop + clientHeight < scrollHeight - 1)
  }

  const updateMaxHeight = () => {
    const vh = window.innerHeight
    const offset = 320
    setMaxHeight(`${vh - offset}px`)
    checkScroll()
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <unnecessary>
  useEffect(() => {
    updateMaxHeight()
    window.addEventListener('resize', updateMaxHeight)
    return () => window.removeEventListener('resize', updateMaxHeight)
  }, [selectedUnit])

  if (
    !selectedUnit ||
    !selectedUnit.schedules ||
    selectedUnit.schedules.length === 0
  ) {
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
    <div className="w-full space-y-5">
      <div className="text-left">
        <h2 className="text-3xl font-medium text-foreground mb-2 leading-9 tracking-tight">
          Agora <span className="text-primary">selecione sua turma</span>
        </h2>
        <p className="text-sm pt-8 text-muted-foreground">
          {selectedUnit.address} - {selectedUnit.neighborhood}
        </p>
      </div>

      <div className="relative">
        <div
          ref={listRef}
          onScroll={checkScroll}
          style={{ maxHeight }}
          className="overflow-y-auto pr-1 space-y-0"
        >
          <RadioGroup
            value={selectedValue}
            onValueChange={handleScheduleChange}
            className="w-full"
          >
            {selectedUnit.schedules.map((schedule, index) => (
              <label
                key={schedule.id}
                htmlFor={schedule.id}
                className={`
                  flex items-start justify-between py-4 px-1 cursor-pointer transition-colors
                  hover:bg-muted/30
                  ${index !== selectedUnit.schedules.length - 1 ? 'border-b border-border' : ''}
                `}
              >
                <div className="flex flex-col gap-1 flex-1">
                  <h3 className="font-medium text-foreground">
                    Turma {index + 1}
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p>
                      <span className="font-medium">Data início:</span>{' '}
                      {formatDate(schedule.class_start_date)}
                    </p>
                    <p>
                      <span className="font-medium">Data final:</span>{' '}
                      {formatDate(schedule.class_end_date)}
                    </p>
                    <p>
                      <span className="font-medium">Horário:</span>{' '}
                      {formatTimeRange(schedule.class_time)}
                    </p>
                    <p>
                      <span className="font-medium">Dias de aula:</span>{' '}
                      {schedule.class_days}
                    </p>
                    <p>
                      <span className="font-medium">Vagas:</span>{' '}
                      {schedule.vacancies}
                    </p>
                  </div>
                </div>
                <div className="flex items-center ml-2">
                  <RadioGroupItem value={schedule.id} id={schedule.id} />
                </div>
              </label>
            ))}
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
        <p className="text-destructive text-sm -mt-2">
          {errors[fieldName as keyof typeof errors]?.message}
        </p>
      )}
    </div>
  )
}
