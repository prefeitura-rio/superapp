// components/ui/custom/card-front-content.tsx
'use client'

import { PrefLogo } from '@/assets/icons/pref-logo'
import type { ReactNode } from 'react'

interface CardFrontContentProps {
  title: string
  name?: string
  primaryLabel: string
  primaryValue: string
  primaryValueSlot?: ReactNode
  secondaryLabel?: string
  secondaryValue?: string
  hasUpdateBadge?: boolean
}

export function CardFrontContent({
  title,
  name,
  primaryLabel,
  primaryValue,
  primaryValueSlot,
  secondaryLabel,
  secondaryValue,
}: CardFrontContentProps) {
  return (
    <div className="flex h-[140px] justify-between items-start relative">
      <PrefLogo fill="white" className="text-white absolute top-0 right-0" />

      <div className="flex flex-col h-full w-full">
        <div className="min-h-0">
          <p className="text-xs font-normal">{title}</p>
          {name && (
            <p className="text-xl leading-6 font-medium max-w-[232px] min-[540px]:max-w-[90vw] break-words line-clamp-2">
              {name}
            </p>
          )}
        </div>

        <div className="mt-auto">
          {primaryValueSlot && (
            <div className="flex-shrink-0 mb-1">{primaryValueSlot}</div>
          )}

          <div className="flex items-center gap-7">
            <div className="relative">
              <div className="flex items-center gap-1">
                <p className="text-sm font-normal text-white/80">
                  {primaryLabel}
                </p>
              </div>
              <p className="text-sm font-normal">{primaryValue}</p>
            </div>

            <div>
              <p className="text-sm font-normal text-white/80">
                {secondaryLabel}
              </p>
              <p className="text-sm font-normal">{secondaryValue}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
