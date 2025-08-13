import type React from 'react'
import { cn } from '../../../lib/utils'
import { RadioGroup, RadioGroupItem } from '../radio-group'

interface RadioListProps {
  options:
    | string[]
    | { label: string | React.ReactNode; value: string; key?: string }[]
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  className?: string
  name?: string
}

export function RadioList({
  options,
  value,
  onValueChange,
  disabled = false,
  className,
  name = 'radio-list',
}: RadioListProps) {
  return (
    <RadioGroup
      className={cn('space-y-1', className)}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      {options.map((option, index) => {
        const optionValue = typeof option === 'string' ? option : option.value
        const optionLabel = typeof option === 'string' ? option : option.label
        const optionKey =
          typeof option === 'string' ? option : option.key || option.value

        return (
          <label
            key={optionKey}
            className={cn(
              'flex items-center justify-between cursor-pointer py-2 rounded-md transition-colors hover:bg-accent/40 px-4',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            htmlFor={`${name}-${optionKey}`}
          >
            <span>{optionLabel}</span>
            <RadioGroupItem
              id={`${name}-${optionKey}`}
              value={optionValue}
              disabled={disabled}
            />
          </label>
        )
      })}
    </RadioGroup>
  )
}
