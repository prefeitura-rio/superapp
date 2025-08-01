import { ChevronRightIcon } from '@/assets/icons'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import type React from 'react'

export function MenuItem({
  icon,
  label,
  href = '#',
  onClick,
  isFirst = false,
  isLast = false,
  isLoading = false,
}: {
  icon: React.ReactNode
  label: string
  href?: string
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
  isLoading?: boolean
}) {
  const isButton = !!onClick && (!href || href === '#')
  const borderClass = cn(
    !isLast && 'border-b color-border',
    isFirst && 'border-t color-border'
  )
  const contentClass = cn(
    'flex items-center justify-between w-full px-0 py-5 text-foreground',
    isLoading && 'opacity-75'
  )

  if (isButton) {
    return (
      <div className={borderClass}>
        <button
          type="button"
          onClick={onClick}
          disabled={isLoading}
          className={`${contentClass} cursor-pointer disabled:cursor-not-allowed`}
          style={{ width: '100%' }}
        >
          <div className="flex items-center gap-3">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
            <span>{label}</span>
          </div>
          {!isLoading && <ChevronRightIcon className="h-5 w-5 text-primary" />}
        </button>
      </div>
    )
  }

  return (
    <div className={borderClass}>
      <Link
        href={href}
        onClick={onClick}
        className={`${contentClass} cursor-pointer`}
        style={{ width: '100%' }}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </div>
        <ChevronRightIcon className="h-5 w-5 text-primary" />
      </Link>
    </div>
  )
}
