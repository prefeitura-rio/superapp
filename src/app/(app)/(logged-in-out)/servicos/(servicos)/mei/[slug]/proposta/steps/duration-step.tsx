'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import type { MeiProposalFormData } from '../mei-proposal-client'

interface DurationStepProps {
  onNext?: () => void
}

export function DurationStep({ onNext }: DurationStepProps) {
  const { setValue, watch } = useFormContext<MeiProposalFormData>()
  const currentDuration = watch('duration')
  const [displayValue, setDisplayValue] = useState(() =>
    currentDuration > 0 ? currentDuration.toString() : ''
  )
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      // Remove non-digits
      const digits = rawValue.replace(/\D/g, '')

      // Limit to reasonable max (999 days)
      const numericValue = Math.min(Number(digits) || 0, 999)

      setValue('duration', numericValue)
      setDisplayValue(numericValue > 0 ? numericValue.toString() : '')
    },
    [setValue]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle Enter key to advance to next step
      if (e.key === 'Enter') {
        e.preventDefault()
        if (currentDuration > 0 && onNext) {
          onNext()
        }
        return
      }

      // Allow: backspace, delete, tab, escape
      const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape']
      if (allowedKeys.includes(e.key)) return

      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      if (e.ctrlKey || e.metaKey) return

      // Allow: home, end, left, right
      if (['Home', 'End', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return

      // Block non-numeric keys
      if (!/^\d$/.test(e.key)) {
        e.preventDefault()
      }
    },
    [currentDuration, onNext]
  )

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-medium text-foreground leading-tight mb-8">
        Previsão de duração do serviço
      </h1>

      <div className="flex items-baseline gap-2">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder=""
          className="font-medium text-primary bg-transparent border-none outline-none w-auto min-w-[1ch] max-w-[4ch] placeholder:text-primary/30"
          style={{
            fontSize: '3rem',
            lineHeight: '1',
            height: 'auto',
            width: `${Math.max(displayValue.length, 1)}ch`,
          }}
          aria-label="Duração em dias"
        />
        <span
          className="font-medium text-primary"
          style={{ fontSize: '3rem', lineHeight: '1' }}
        >
          {currentDuration === 1 ? 'dia' : 'dias'}
        </span>
      </div>
    </div>
  )
}
