import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
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
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center justify-between py-5 text-foreground',
        'border-b color-border',
        isFirst && 'border-t color-border'
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      <ChevronRight className="h-5 w-5 text-primary" />
    </Link>
  )
}
