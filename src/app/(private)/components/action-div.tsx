'use client'

import { Badge } from '@/components/ui/badge'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { Info } from 'lucide-react'
import React, { useState } from 'react'
import { TransitionLink } from '../../../components/ui/transition-link'

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
  const [showTooltip, setShowTooltip] = useState(false)
  const [open, setOpen] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    if (drawerContent) {
      e.preventDefault()
      setOpen(true)
    }
  }

  const Content = (
    <div
      className={cn(
        'relative group cursor-pointer border-[1.4px] rounded-md text-card-foreground font-normal truncate transition-colors',
        disabled ? 'bg-card' : 'bg-transparent hover:bg-accent/40',
        sizeStyles[size],
        leftIcon && 'pl-15',
        rightIcon && 'pr-10',
        optionalLabel && !rightIcon && 'pr-[80px]',
        optionalLabel && rightIcon && 'pr-[140px]',
        redirectLink && 'pointer-events-none',
        className
      )}
      onClick={handleClick}
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
                <Info
                  className={cn(
                    'h-4 w-4 cursor-help',
                    tooltipIconVariantStyles[variant]
                  )}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
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
        {redirectLink && !drawerContent ? (
          <TransitionLink href={redirectLink}>{Content}</TransitionLink>
        ) : (
          Content
        )}
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>
      {drawerContent && (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="p-8 max-w-md mx-auto !rounded-t-3xl">
            <div className="flex justify-center pt-0 pb-1">
              <div className="w-8.5 h-1 -mt-2 rounded-full bg-popover-line" />
            </div>
            {drawerTitle && (
              <DrawerHeader className="sr-only">
                <DrawerTitle>{drawerTitle}</DrawerTitle>
              </DrawerHeader>
            )}
            {React.isValidElement(drawerContent)
              ? React.cloneElement(drawerContent as React.ReactElement<any>, {
                  onClose: () => setOpen(false),
                })
              : drawerContent}
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}

ActionDiv.displayName = 'ActionDiv'
