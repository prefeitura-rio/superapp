'use client'

import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'
import React from 'react'
import { Input } from '../input'

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  state?: 'error' | 'default' | 'success'
  onClear?: () => void
  showClearButton?: boolean
}

export function InputField({
  state = 'default',
  onClear,
  showClearButton = false,
  className,
  value,
  ...props
}: InputFieldProps) {
  const hasValue = value && value.toString().length > 0
  const showClear = showClearButton && hasValue

  const iconStyles = {
    error: 'bg-destructive',
    default: 'bg-foreground',
    success: 'bg-success',
  }

  const handleOnClear = () => {
    if (onClear && state !== 'success') {
      onClear()
    }
  }

  return (
    <div className="relative w-full">
      <Input
        className={cn(
          'text-card-foreground text-sm bg-card border-border rounded-xl',
          className
        )}
        value={value}
        {...props}
      />

      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
        {showClear && (
          <button
            type="button"
            onClick={handleOnClear}
            className={cn(
              'p-1 rounded-full transition-colors',
              iconStyles[state]
            )}
          >
            {state === 'success' ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <X className="w-4 h-4 text-white" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
