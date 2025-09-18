'use client'

import { ChevronRightIcon } from '@/assets/icons'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { MenuItemProps } from '@/types/menu-items'
import Link from 'next/link'
import { forwardRef } from 'react'

const variantStyles = {
  default: '',
  danger: 'text-destructive',
} as const

interface ExtendedMenuItemProps extends MenuItemProps {
  showBadge?: boolean
  badgeText?: string
}

export const MenuItem = forwardRef<HTMLAnchorElement, ExtendedMenuItemProps>(
  (
    {
      icon,
      label,
      title,
      href = '#',
      isFirst = false,
      isLast = false,
      disabled = false,
      variant = 'default',
      showBadge = false,
      badgeText = 'Atualizar',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Link
        ref={ref}
        href={disabled ? '#' : href}
        className={cn(
          'flex items-center justify-between py-5 text-foreground gap-4',
          'border-b border-border',
          isLast && 'border-b-0',
          disabled && 'opacity-50 cursor-not-allowed',
          variantStyles[variant],
          className
        )}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {icon}
          <div className="flex flex-col min-w-0 flex-1">
            {title && (
              <span className="text-sm text-muted-foreground">{title}</span>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <span className="min-w-0 truncate">{label}</span>
              {showBadge && (
                <Badge
                  variant="destructive"
                  className="px-3 py-0.5 text-sm rounded-full flex-shrink-0"
                >
                  {badgeText}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <ChevronRightIcon className="h-5 w-5 text-primary flex-shrink-0" />
      </Link>
    )
  }
)

MenuItem.displayName = 'MenuItem'
