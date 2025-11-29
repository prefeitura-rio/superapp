'use client'

import { cn } from '@/lib/utils'
import type React from 'react'
import { Button } from '../button'

export interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: React.ElementType
  iconPosition?: 'left' | 'right'
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

const variantStyles = {
  primary: 'bg-primary hover:bg-primary/70 text-background border-0',
  secondary: 'bg-card hover:bg-card/70 text-foreground border-0',
  ghost: 'bg-transparent text-foreground hover:bg-foreground/10',
  outline:
    'bg-transparent text-foreground border border-foreground-light hover:bg-foreground/10',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm h-8',
  md: 'px-4 py-2 text-sm h-10',
  lg: 'px-6 py-3 text-sm h-12',
  xl: 'px-6 py-4 text-sm h-14',
}

export function CustomButton({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}: CustomButtonProps) {
  const isDisabled = disabled || loading

  return (
    <Button
      className={cn(
        'inline-flexitems-center justify-center gap-2 rounded-2xl font-normal text-sm cursor-pointer',
        'border transition-all duration-200 focus:outline-none focus:ring-none!',
        'disabled:cursor-not-allowed disabled:bg-card disabled:text-muted-foreground',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      )}

      {Icon && iconPosition === 'left' && !loading && (
        <Icon className="w-4 h-4" />
      )}

      <span>{children}</span>

      {Icon && iconPosition === 'right' && !loading && (
        <Icon className="w-4 h-4" />
      )}
    </Button>
  )
}
