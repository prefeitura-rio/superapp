import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type React from 'react'

interface CheckboxListProps {
  options:
    | string[]
    | { label: string | React.ReactNode; value: string; key?: string }[]
  value?: string[]
  onValueChange?: (value: string[]) => void
  disabled?: boolean
  className?: string
  name?: string
}

export function CheckboxList({
  options,
  value = [],
  onValueChange,
  disabled = false,
  className,
  name = 'checkbox-list',
}: CheckboxListProps) {
  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (!onValueChange) return

    const newValue = checked
      ? [...value, optionValue]
      : value.filter(v => v !== optionValue)

    onValueChange(newValue)
  }

  return (
    <div className={cn('space-y-1', className)}>
      {options.map(option => {
        const optionValue = typeof option === 'string' ? option : option.value
        const optionLabel = typeof option === 'string' ? option : option.label
        const optionKey =
          typeof option === 'string' ? option : option.key || option.value

        const isChecked = value.includes(optionValue)

        return (
          <label
            key={optionKey}
            className={cn(
              'flex items-center justify-between cursor-pointer py-2 rounded-md transition-colors hover:bg-accent/40',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            htmlFor={`${name}-${optionKey}`}
          >
            <span>{optionLabel}</span>
            <Checkbox
              id={`${name}-${optionKey}`}
              checked={isChecked}
              onCheckedChange={checked =>
                handleCheckboxChange(optionValue, checked === true)
              }
              disabled={disabled}
            />
          </label>
        )
      })}
    </div>
  )
}
