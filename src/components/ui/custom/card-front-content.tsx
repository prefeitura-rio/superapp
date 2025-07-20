// components/ui/custom/card-front-content.tsx
'use client'

import { PrefLogo } from '@/assets/icons/pref-logo'

interface CardFrontContentProps {
  title: string
  name?: string
  primaryLabel: string
  primaryValue: string
  secondaryLabel?: string
  secondaryValue?: string
  hasUpdateBadge?: boolean
}

export function CardFrontContent({
  title,
  name,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
}: CardFrontContentProps) {
  return (
    <div className="flex h-[140px] justify-between items-start relative">
      <PrefLogo className="text-white absolute top-0 right-0" />

      <div className="flex flex-col justify-between h-full">
        <div>
          <p className="text-xs font-normal">{title}</p>
          {name && (
            <p className="text-xl leading-6 font-medium max-w-[232px] break-words">
              {name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm font-normal text-white/80">{primaryLabel}</p>
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
  )
}
