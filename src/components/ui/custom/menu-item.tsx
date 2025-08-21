'use-client'

import { ChevronRightIcon } from '@/assets/icons'
import { cn } from '@/lib/utils'
import type { MenuItemProps } from '@/types/menu-items'
import Link from 'next/link'
import { forwardRef } from 'react'

const variantStyles = {
  default: '',
  danger: 'text-destructive',
} as const

export const MenuItem = forwardRef<HTMLAnchorElement, MenuItemProps>(
  (
    {
      icon,
      label,
      href = '#',
      isFirst = false,
      isLast = false,
      disabled = false,
      variant = 'default',
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
          'flex items-center justify-between py-5 text-foreground',
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
        <div className="flex items-center gap-4">
          {icon}
          <span>{label}</span>
        </div>
        <ChevronRightIcon className="h-5 w-5 text-primary" />
      </Link>
    )
  }
)

MenuItem.displayName = 'MenuItem'
