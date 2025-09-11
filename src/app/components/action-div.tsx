'use client'

import { InfoIcon } from '@/assets/icons/info-icon'
import { Badge } from '@/components/ui/badge'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import React, { useState } from 'react'

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
  hint?: string
  redirectLink?: string
  optionalLabelVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
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

export const ActionDiv = ({
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
  redirectLink,
  content,
  drawerContent,
  drawerTitle,
}: ActionDivProps) => {
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
      className={cn(
        'relative group cursor-pointer border-2 border-border rounded-xl text-card-foreground font-normal truncate transition-colors',
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
            iconVariantStyles[variant]
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
            iconVariantStyles[variant]
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
                labelVariantStyles[variant],
                labelClassName
              )}
            >
              {label}
            </div>

            {tooltip && (
              <div className="relative">
                <InfoIcon
                  className={cn(
                    'h-5 w-5 cursor-help',
                    tooltipIconVariantStyles[variant]
                  )}
                  onClick={handleDrawerOpen('tooltip')}
                />
              </div>
            )}
          </div>
        )}
        {redirectLink ? (
          <Link href={redirectLink}>{Content}</Link>
        ) : (
          Content
        )}
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
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

ActionDiv.displayName = 'ActionDiv'
