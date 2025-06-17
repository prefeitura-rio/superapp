import { cn } from '../../../lib/utils'
import { RadioGroup, RadioGroupItem } from '../radio-group'

interface RadioListProps {
  options: string[] | { label: string; value: string }[]
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
      {options.map(option => {
        const optionValue = typeof option === 'string' ? option : option.value
        const optionLabel = typeof option === 'string' ? option : option.label

        return (
          <label
            key={optionValue}
            className={cn(
              'flex items-center justify-between cursor-pointer px-2 py-2 rounded-md transition-colors hover:bg-accent/40',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            htmlFor={`${name}-${optionValue}`}
          >
            <span>{optionLabel}</span>
            <RadioGroupItem
              id={`${name}-${optionValue}`}
              value={optionValue}
              disabled={disabled}
            />
          </label>
        )
      })}
    </RadioGroup>
  )
}
