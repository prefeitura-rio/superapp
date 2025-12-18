'use client'

import { cn } from '@/lib/utils'
import type { ComponentType, SVGProps } from 'react'

interface QuickInfoItemProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  value: string
  className?: string
}

export function QuickInfoItem({
  icon: Icon,
  label,
  value,
  className,
}: QuickInfoItemProps) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div className="shrink-0 mt-0.5">
        <Icon className="w-5 h-5 text-foreground-light" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-foreground-light">{label}</span>
        <span className="text-sm text-foreground wrap-break-word">{value}</span>
      </div>
    </div>
  )
}
