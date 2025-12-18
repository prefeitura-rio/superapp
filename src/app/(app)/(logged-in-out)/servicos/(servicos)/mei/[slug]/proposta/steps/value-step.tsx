'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import type { MeiProposalFormData } from '../mei-proposal-client'

// Format number to Brazilian currency display (without R$ symbol)
function formatCurrencyDisplay(value: number): string {
  if (value === 0) return ''
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Parse currency string to number (in cents)
function parseCurrencyInput(value: string): number {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '')
  // Convert to number (value is in cents)
  return Number(digits) / 100
}

export function ValueStep() {
  const { setValue, watch } = useFormContext<MeiProposalFormData>()
  const currentValue = watch('value')
  const [displayValue, setDisplayValue] = useState(() =>
    formatCurrencyDisplay(currentValue)
  )
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      const numericValue = parseCurrencyInput(rawValue)

      // Limit to reasonable max value (1 billion)
      if (numericValue > 1000000000) return

      setValue('value', numericValue)
      setDisplayValue(formatCurrencyDisplay(numericValue))
    },
    [setValue]
  )

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, decimal point
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', '.', ',']
    if (allowedKeys.includes(e.key)) return

    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey || e.metaKey) return

    // Allow: home, end, left, right
    if (['Home', 'End', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return

    // Block non-numeric keys
    if (!/^\d$/.test(e.key)) {
      e.preventDefault()
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-medium text-foreground leading-tight mb-8">
        Valor da sua proposta
      </h1>

      <div className="flex items-baseline gap-1">
        <span className="font-medium text-primary" style={{ fontSize: '3rem', lineHeight: '1' }}>R$</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="0,00"
          className="font-medium text-primary bg-transparent border-none outline-none w-full placeholder:text-primary/30"
          style={{ fontSize: '3rem', lineHeight: '1', height: 'auto' }}
          aria-label="Valor da proposta"
        />
      </div>
    </div>
  )
}
