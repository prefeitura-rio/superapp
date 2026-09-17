'use client'

import { CalendarIcon } from '@/assets/icons'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { forwardRef, useEffect, useState } from 'react'

interface DateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string
  containerClassName?: string
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      className,
      containerClassName,
      error,
      value,
      defaultValue,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(() =>
      String(value ?? defaultValue ?? '')
    )

    useEffect(() => {
      if (value !== undefined) setInternalValue(String(value))
    }, [value])

    const hasValue = !!internalValue

    return (
      <div className={cn('space-y-2', containerClassName)}>
        <div className="relative">
          <Input
            ref={ref}
            type="date"
            disabled={disabled}
            aria-invalid={!!error}
            defaultValue={defaultValue}
            onChange={event => {
              setInternalValue(event.target.value)
              onChange?.(event)
            }}
            className={cn(
              'h-16 rounded-xl border-2 bg-transparent px-5 pr-14 text-base font-normal shadow-none focus:border-ring focus:bg-card md:text-sm',
              error ? 'border-destructive' : 'border-border',
              '[&::-webkit-calendar-picker-indicator]:absolute',
              '[&::-webkit-calendar-picker-indicator]:inset-y-0',
              '[&::-webkit-calendar-picker-indicator]:right-0',
              '[&::-webkit-calendar-picker-indicator]:w-14',
              '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
              '[&::-webkit-calendar-picker-indicator]:opacity-0',
              hasValue
                ? 'text-foreground [&::-webkit-datetime-edit]:text-foreground'
                : cn(
                    'text-muted-foreground [&::-webkit-datetime-edit]:text-muted-foreground',
                    'focus:text-foreground focus:[&::-webkit-datetime-edit]:text-foreground'
                  ),
              className
            )}
            {...props}
            {...(value !== undefined ? { value } : {})}
          />
          <CalendarIcon
            aria-hidden
            className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
          />
        </div>
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>
    )
  }
)

DateInput.displayName = 'DateInput'
