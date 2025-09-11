'use client'

import { ChevronRightIcon } from '@/assets/icons'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface CertificateMenuItemProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  isFirst?: boolean
  isLast?: boolean
  className?: string
}

export const CertificateMenuItem = forwardRef<HTMLButtonElement, CertificateMenuItemProps>(
  (
    {
      icon,
      label,
      onClick,
      disabled = false,
      isFirst = false,
      isLast = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between py-5 text-foreground text-left',
          'border-b border-border cursor-pointer',
          isLast && 'border-b-0',
          disabled && 'opacity-50 cursor-not-allowed',
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
      </button>
    )
  }
)

CertificateMenuItem.displayName = 'CertificateMenuItem'
