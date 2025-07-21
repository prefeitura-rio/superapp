import { ChevronRightIcon } from '@/assets/icons'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type React from 'react'

export function MenuItem({
  icon,
  label,
  href = '#',
  onClick,
  isFirst = false,
}: {
  icon: React.ReactNode
  label: string
  href?: string
  onClick?: () => void
  isFirst?: boolean
}) {
  const isButton = !!onClick && (!href || href === '#')
  const borderClass = cn(
    'border-b color-border',
    isFirst && 'border-t color-border'
  )
  const contentClass =
    'flex items-center justify-between w-full px-0 py-5 text-foreground'

  if (isButton) {
    return (
      <div className={borderClass}>
        <button
          type="button"
          onClick={onClick}
          className={`${contentClass} cursor-pointer`}
          style={{ width: '100%' }}
        >
          <div className="flex items-center gap-3">
            {icon}
            <span>{label}</span>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-primary" />
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
