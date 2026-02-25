'use client'

import { InfoIcon } from '@/assets/icons/info-icon'
import { Badge } from '@/components/ui/badge'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import React, { forwardRef, useState } from 'react'

interface ActionDivProps {
  label?: string
  tooltip?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'error' | 'success'
  size?: 'sm' | 'md' | 'lg'
  containerClassName?: string
  labelClassName?: string
  optionalLabel?: string
  optionalLabelVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  hint?: string
  error?: string
  redirectLink?: string
  isRequired?: boolean
  className?: string
  content?: React.ReactNode
  disabled?: boolean
  drawerContent?: React.ReactNode
  drawerTitle?: string
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
  default: 'text-black',
  error: 'text-destructive',
  success: 'text-success',
} as const

const sizeStyles = {
  sm: 'h-12 px-3 text-sm',
  md: 'h-16 px-3',
  lg: 'h-18 px-4 text-lg',
} as const

export const ActionDiv = forwardRef<HTMLDivElement, ActionDivProps>(
  (
    {
      label,
      tooltip,
      leftIcon,
      rightIcon,
      variant = 'default',
      size = 'md',
      disabled = false,
      className,
      containerClassName,
      labelClassName,
      optionalLabel,
      optionalLabelVariant = 'default',
      hint,
      error,
      redirectLink,
      isRequired = false,
      content,
      drawerContent,
      drawerTitle,
    },
    ref
  ) => {
    const effectiveVariant = error ? 'error' : variant
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [drawerType, setDrawerType] = useState<'tooltip' | 'content' | null>(
      null
    )

    const handleDrawerOpen =
      (type: 'tooltip' | 'content') => (e: React.MouseEvent) => {
        e.preventDefault()
        setDrawerType(type)
        setDrawerOpen(true)
      }

    const Content = (
      <div
        ref={ref}
        tabIndex={-1}
        aria-invalid={!!error}
        role={drawerContent ? 'button' : undefined}
        className={cn(
          'relative group cursor-pointer border-2 rounded-xl text-card-foreground font-normal truncate transition-colors',
          error ? 'border-destructive' : 'border-border',
          disabled
            ? 'bg-transparent hover:bg-accent/40'
            : 'bg-card text-muted-foreground',
          sizeStyles[size],
          leftIcon && 'pl-15',
          rightIcon && 'pr-10',
          optionalLabel && !rightIcon && 'pr-[80px]',
          optionalLabel && rightIcon && 'pr-[140px]',
          className
        )}
        onClick={
          redirectLink
            ? undefined // Deixa o Link do Next.js lidar com o clique
            : drawerContent
              ? handleDrawerOpen('content')
              : undefined
        }
      >
        {leftIcon && (
          <div
            className={cn(
              'absolute left-5 top-1/2 transform -translate-y-1/2',
              iconVariantStyles[effectiveVariant]
            )}
          >
            {leftIcon}
          </div>
        )}

        <div className="flex items-center h-full w-full">
          <span className="truncate block flex-1 min-w-0">{content}</span>
        </div>

        {optionalLabel && (
          <Badge
            variant={optionalLabelVariant}
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
              iconVariantStyles[effectiveVariant]
            )}
          >
            {rightIcon}
          </div>
        )}
      </div>
    )

    return (
      <>
        <div className={cn('space-y-2', containerClassName)}>
          {label && (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'text-sm font-normal',
                  labelVariantStyles[effectiveVariant],
                  labelClassName
                )}
              >
                {label}
                {isRequired && <span className="text-destructive ml-1">*</span>}
              </div>

              {tooltip && (
                <div className="relative">
                  <InfoIcon
                    className={cn(
                      'h-5 w-5 cursor-help',
                      tooltipIconVariantStyles[effectiveVariant]
                    )}
                    onClick={handleDrawerOpen('tooltip')}
                  />
                </div>
              )}
            </div>
          )}
          {redirectLink ? <Link href={redirectLink}>{Content}</Link> : Content}
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          {hint && !error && (
            <p className="text-xs text-muted-foreground mt-1">{hint}</p>
          )}
        </div>
        {drawerType !== null && (
          <BottomSheet
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            title={drawerTitle}
            showHandle
          >
            {drawerType === 'content' &&
            drawerContent &&
            React.isValidElement(drawerContent)
              ? React.cloneElement(drawerContent as React.ReactElement<any>, {
                  onClose: () => setDrawerOpen(false),
                })
              : drawerContent}
          </BottomSheet>
        )}
      </>
    )
  }
)

ActionDiv.displayName = 'ActionDiv'
