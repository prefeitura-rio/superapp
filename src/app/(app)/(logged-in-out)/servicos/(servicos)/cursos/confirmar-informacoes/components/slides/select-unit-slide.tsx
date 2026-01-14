'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { InscriptionFormData, NearbyUnit } from '../../types'

interface SelectUnitSlideProps {
  nearbyUnits: NearbyUnit[]
  form: UseFormReturn<InscriptionFormData>
  fieldName: keyof InscriptionFormData
}

export const SelectUnitSlide = ({
  nearbyUnits,
  form,
  fieldName,
}: SelectUnitSlideProps) => {
  const {
    formState: { errors },
    setValue,
    watch,
    clearErrors,
    trigger,
  } = form

  const selectedValue = watch(fieldName as any)

  // Check if a unit has any available schedules (with remaining_vacancies > 0)
  const hasAvailableSchedules = (unit: NearbyUnit) => {
    if (!unit.schedules || unit.schedules.length === 0) return false
    return unit.schedules.some(
      schedule =>
        schedule.remaining_vacancies !== undefined &&
        schedule.remaining_vacancies !== null &&
        schedule.remaining_vacancies > 0
    )
  }

  // Handle unit selection with validation
  const handleUnitChange = async (value: string) => {
    // Check if the selected unit has available schedules
    const selectedUnit = nearbyUnits.find(unit => unit.id === value)
    if (selectedUnit && !hasAvailableSchedules(selectedUnit)) {
      // Don't allow selection of units without available schedules
      return
    }
    setValue(fieldName as any, value)
    // Clear errors and revalidate immediately
    clearErrors(fieldName as any)
    await trigger(fieldName as any)
  }

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
  }, [nearbyUnits])

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-left flex-shrink-0 pb-5">
        <h2 className="text-3xl font-medium text-foreground mb-2 leading-9 tracking-tight">
          Escolha a <span className="text-primary">unidade mais próxima</span>{' '}
          de sua residência
        </h2>
      </div>

      <div className="relative flex-1 min-h-0 overflow-hidden">
        <div
          ref={listRef}
          onScroll={checkScroll}
          className="overflow-y-auto pr-1 space-y-0 h-full"
        >
          <RadioGroup
            value={selectedValue}
            onValueChange={handleUnitChange}
            className="w-full"
          >
            {nearbyUnits.map((unit, index) => {
              const isAvailable = hasAvailableSchedules(unit)
              return (
                <label
                  key={unit.id}
                  htmlFor={unit.id}
                  className={`
                    flex items-center justify-between py-4 px-1 transition-colors
                    ${isAvailable ? 'cursor-pointer hover:bg-muted/30' : 'cursor-not-allowed opacity-50'}
                    ${index !== nearbyUnits.length - 1 ? 'border-b border-border' : ''}
                  `}
                >
                  <div className="flex flex-col">
                    <h3 className="font-medium text-foreground">
                      {unit.address}
                      {!isAvailable && (
                        <span className="text-muted-foreground text-xs ml-2">
                          (Sem vagas disponíveis)
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {unit.neighborhood}, Rio de Janeiro
                    </p>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value={unit.id} id={unit.id} disabled={!isAvailable} />
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

      {errors[fieldName as keyof typeof errors] && (
        <p className="text-destructive text-sm -mt-2">
          {errors[fieldName as keyof typeof errors]?.message}
        </p>
      )}
    </div>
  )
}
