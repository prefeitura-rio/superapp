'use client'

import { useRouter } from 'next/navigation'

import type React from 'react'
import { Badge } from '../badge'

type BannerBaseProps = {
  title: string
  subtitle?: string
  badge?: string
  color: string
  route?: string
  logo?: React.ReactNode
  image?: React.ReactNode
  onBannerClick?: () => void
}

export const BannerBase: React.FC<BannerBaseProps> = ({
  title,
  subtitle,
  badge,
  color,
  route,
  logo,
  image,
  onBannerClick,
}) => {
  const router = useRouter()

  const handleClick = () => {
    if (onBannerClick) {
      onBannerClick()
    }
    if (route) router.push(route)
  }

  const getAriaLabel = () => {
    if (!route) return undefined

    let label = `${title}`
    if (subtitle) label += ` - ${subtitle}`
    if (badge) label += ` (${badge})`
    label += '. Clique para acessar.'

    return label
  }

  return (
    <div
      onClick={handleClick}
      onKeyDown={e => {
        if ((e.key === 'Enter' || e.key === ' ') && route) {
          e.preventDefault()
          router.push(route)
        }
      }}
      role={route ? 'button' : undefined}
      tabIndex={route ? 0 : undefined}
      className={`relative rounded-xl pt-4 pl-[23px] pr-[23px] h-[104px] min-w-[320px] sm:min-w-[300px] overflow-visible w-full ${route ? 'cursor-pointer' : ''}`}
      aria-label={getAriaLabel()}
      style={{ backgroundColor: color }}
    >
      {/* Blur */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div className="absolute right-[89px] top-[-9px] w-[82px] h-[82px] bg-white/15 blur-[30px] z-0 md:right-32" />
        <div className="absolute right-[-14px] bottom-[-54px] w-[144px] h-[144px] bg-white/20 blur-[30px] z-0 md:right-6" />
      </div>

      {/* Image */}
      {image}

      {/* Content */}
      <div className="relative z-20 flex flex-col gap-3 h-full">
        <div className="flex items-center gap-2">
          {logo}
          <Badge
            className={`bg-secondary/30 font-normal text-white text-xs flex justify-center items-center ${
              badge ? '' : 'invisible'
            }`}
          >
            {badge || 'placeholder'}
          </Badge>
        </div>

        <div className="flex flex-col gap-0">
          <h3 className="text-xl font-semibold leading-6 text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-white/60 leading-4">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}
