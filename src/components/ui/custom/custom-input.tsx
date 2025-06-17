'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Info } from 'lucide-react'
import { forwardRef, useState } from 'react'
import { Input } from '../input'

interface CustomInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  tooltip?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'error' | 'success'
  size?: 'sm' | 'md' | 'lg'
  containerClassName?: string
  labelClassName?: string
  optionalLabel?: string
  hint?: string
  optionalLabelVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  isEditable?: boolean
}

const labelVariantStyles = {
  default: 'text-primary',
  error: 'text-destructive',
  success: 'text-success',
} as const

const tooltipIconVariantStyles = {
  default: 'text-primary',
  error: 'text-destructive',
  success: 'text-success',
} as const

const iconVariantStyles = {
  default: 'text-muted-foreground',
  error: 'text-destructive',
  success: 'text-success',
} as const

const sizeStyles = {
  sm: 'h-12 px-3 text-sm',
  md: 'h-16 px-3',
  lg: 'h-18 px-4 text-lg',
} as const

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      label,
      tooltip,
      leftIcon,
      rightIcon,
      variant = 'default',
      size = 'md',
      disabled = false,
      isEditable = true,
      className,
      containerClassName,
      labelClassName,
      id,
      optionalLabel,
      optionalLabelVariant,
      hint,
      ...props
    },
    ref
  ) => {
    const inputId = id
    const [showTooltip, setShowTooltip] = useState(false)

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <div className="flex items-center gap-2">
            <label
              htmlFor={inputId}
              className={cn(
                'text-sm font-normal',
                labelVariantStyles[variant],
                labelClassName
              )}
            >
              {label}
            </label>

            {tooltip && (
              <div className="relative">
                <Info
                  className={cn(
                    'h-4 w-4 cursor-help',
                    tooltipIconVariantStyles[variant]
                  )}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                />

                {showTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
                    <div className="bg-popover border border-border rounded-md px-3 py-2 shadow-md max-w-xs">
                      <p className="text-sm text-popover-foreground">
                        {tooltip}
                      </p>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-popover" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className={cn(
                'absolute left-5 top-1/2 transform -translate-y-1/2',
                iconVariantStyles[variant]
              )}
            >
              {leftIcon}
            </div>
          )}

          <Input
            ref={ref}
            id={inputId}
            disabled={disabled}
            readOnly={!isEditable}
            className={cn(
              'flex w-full rounded-md border-[1.4px] border-border bg-transparent focus:bg-card disabled:bg-card transition-colors text-card-foreground font-normal truncate focus:border-ring',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'placeholder:text-muted-foreground',
              'disabled:cursor-not-allowed disabled:opacity-50',
              sizeStyles[size],
              leftIcon && 'pl-15',
              rightIcon && 'pr-10',
              optionalLabel && !rightIcon && 'pr-[80px]',
              optionalLabel && rightIcon && 'pr-[140px]',
              !isEditable &&
                'focus:!outline-none focus:!bg-transparent focus:!border-border focus:!ring-0 focus:!ring-offset-0',
              className
            )}
            {...props}
          />

          {optionalLabel && (
            <Badge
              variant="destructive"
              className={cn(
                'absolute top-1/2 transform -translate-y-1/2 text-xs',
                rightIcon ? 'right-[60px]' : 'right-4'
              )}
            >
              {optionalLabel}
            </Badge>
          )}

          {rightIcon && (
            <div
              className={cn(
                'absolute right-5 top-1/2 transform -translate-y-1/2',
                iconVariantStyles[variant]
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>
    )
  }
)

CustomInput.displayName = 'CustomInput'
