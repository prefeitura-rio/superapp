'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { formatDate } from '@/lib/date'
import { useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { InscriptionFormData, Schedule } from '../../types'

interface SelectOnlineClassSlideProps {
  onlineClasses: Schedule[]
  form: UseFormReturn<InscriptionFormData>
  fieldName: keyof InscriptionFormData
}

export const SelectOnlineClassSlide = ({
  onlineClasses,
  form,
  fieldName,
}: SelectOnlineClassSlideProps) => {
  const {
    formState: { errors },
    setValue,
    watch,
    clearErrors,
    trigger,
  } = form

  const selectedValue = watch(fieldName as any)

  // Handle class selection with validation
  const handleClassChange = async (value: string) => {
    // Check if the selected class is available
    const selectedClass = onlineClasses.find(cls => cls.id === value)
    if (selectedClass && !isClassAvailable(selectedClass)) {
      // Don't allow selection of unavailable classes
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

  // Check if a class is available (has remaining_vacancies > 0)
  const isClassAvailable = (onlineClass: Schedule) => {
    return (
      onlineClass.remaining_vacancies !== undefined &&
      onlineClass.remaining_vacancies !== null &&
      onlineClass.remaining_vacancies > 0
    )
  }

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
  }, [onlineClasses])

  if (!onlineClasses || onlineClasses.length === 0) {
    return (
      <div className="w-full space-y-5">
        <div className="text-left">
          <h2 className="text-3xl font-medium text-foreground mb-2 leading-9 tracking-tight">
            Nenhuma turma disponível
          </h2>
          <p className="text-muted-foreground">
            Não há turmas disponíveis para este curso no momento.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-left flex-shrink-0 pb-5">
        <h2 className="text-3xl font-medium text-foreground mb-2 leading-9 tracking-tight">
          Escolha a <span className="text-primary">turma</span> para sua
          inscrição
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
            onValueChange={handleClassChange}
            className="w-full"
          >
            {onlineClasses.map((onlineClass, index) => {
              const isAvailable = isClassAvailable(onlineClass)
              return (
                <label
                  key={onlineClass.id}
                  htmlFor={onlineClass.id}
                  className={`
                    flex items-start justify-between py-4 px-1 transition-colors
                    ${isAvailable ? 'cursor-pointer hover:bg-muted/30' : 'cursor-not-allowed opacity-50'}
                    ${index !== onlineClasses.length - 1 ? 'border-b border-border' : ''}
                  `}
                >
                  <div className="flex flex-col gap-1 flex-1">
                    <h3 className="font-medium text-foreground">
                      Turma {index + 1}
                      {!isAvailable && (
                        <span className="text-muted-foreground text-xs ml-2">
                          (Sem vagas disponíveis)
                        </span>
                      )}
                    </h3>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      {(onlineClass.class_start_date ||
                        onlineClass.class_end_date) && (
                        <div className="flex items-center gap-1">
                          <p className="font-medium">
                            {formatDate(onlineClass.class_start_date)}
                          </p>
                          <span className="font-medium">-</span>
                          <p>{formatDate(onlineClass.class_end_date)}</p>
                        </div>
                      )}
                      {onlineClass.class_days && <p>{onlineClass.class_days}</p>}
                      <p>
                        <span className="font-medium">Vagas:</span>{' '}
                        {onlineClass.vacancies}
                        {onlineClass.remaining_vacancies !== undefined && (
                          <span className="text-muted-foreground">
                            {' '}({onlineClass.remaining_vacancies} disponíveis)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center ml-2">
                    <RadioGroupItem
                      value={onlineClass.id}
                      id={onlineClass.id}
                      disabled={!isAvailable}
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

      {errors[fieldName as keyof typeof errors] && (
        <p className="text-destructive text-sm -mt-2">
          {errors[fieldName as keyof typeof errors]?.message}
        </p>
      )}
    </div>
  )
}
