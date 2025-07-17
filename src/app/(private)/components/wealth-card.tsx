'use client'

import { Button } from '@/components/ui/button'
import { mapRiskToColor } from '@/lib/health-unit-utils'
import { InfoIcon } from 'lucide-react'
import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { CardBase } from './card-base'
import { CardWrapper } from './card-wrapper'
import { WalletHealthStatusDrawerContent } from './drawer-contents/wallet-health-status-drawer-content'

interface WalletCardProps {
  href?: string
  title: string
  name?: string
  statusLabel: string
  statusValue: string
  extraLabel: string
  extraValue: string
  bgColor?: string
  icon?: { src: StaticImageData; alt: string }
  gapClass?: string
  showStatusIcon?: boolean
  showEyeButton?: boolean
  showInfoButton?: boolean
  risco?: string
  address?: string
  phone?: string
  email?: string
  enableFlip?: boolean
  asLink?: boolean
  showInitialShine?: boolean
}

const statusBgClassMap: Record<string, string> = {
  verde: 'bg-card-3',
  amarelo: 'bg-card-5',
  laranja: 'bg-card-5',
  vermelho: 'bg-destructive',
}

export function WalletCard({
  href,
  title,
  name,
  statusLabel,
  statusValue,
  extraLabel,
  extraValue,
  bgColor = 'bg-[#3F6194]',
  icon,
  showStatusIcon = false,
  showEyeButton = false,
  showInfoButton = true,
  risco,
  address,
  phone,
  email,
  enableFlip = true,
  asLink = false,
  showInitialShine = false,
  gapClass = `${showEyeButton ? 'gap-0' : 'gap-8'}`,
}: WalletCardProps) {
  const [showStatusSheet, setShowStatusSheet] = useState(false)

  const frontContent = (
    <CardBase bgColor={bgColor}>
      <div className="flex h-[70px] justify-between items-start">
        <div>
          <h3 className="text-xs font-normal">{title}</h3>
          {name && <h2 className="text-lg font-medium">{name}</h2>}
        </div>
        {icon && (
          <div className="h-10 w-20 relative">
            <Image
              src={icon.src}
              alt={icon.alt}
              width={80}
              height={40}
              className="object-contain"
            />
          </div>
        )}
      </div>
      <div
        className={`mt-4 flex ${gapClass} items-start ${showEyeButton ? 'justify-between' : ''}`}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-xs block">{statusLabel}</span>
            {showInfoButton && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Status Info"
                  className="hover:bg-transparent hover:cursor-pointer"
                  onClick={e => {
                    e.stopPropagation()
                    setShowStatusSheet(true)
                  }}
                >
                  <InfoIcon className="h-4 w-4" />
                </Button>

                <WalletHealthStatusDrawerContent
                  open={showStatusSheet}
                  onOpenChange={setShowStatusSheet}
                  statusValue={statusValue}
                  risco={risco}
                />
              </>
            )}
          </div>
          <div className="flex items-center mt-1">
            {showStatusIcon && statusValue !== 'Fechado' && (
              <span
                className={`w-2.5 h-2.5 mr-1 rounded-full ${statusBgClassMap[mapRiskToColor(risco ?? '')] || ''} border-2 border-card`}
              />
            )}
            <span className="text-sm font-normal">{statusValue}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span
            className={`text-xs${showEyeButton ? ' block max-[321px]:truncate max-[321px]:max-w-[100px]' : ''}`}
            title={extraLabel}
          >
            {extraLabel}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-normal">{extraValue}</span>
          </div>
        </div>
      </div>
    </CardBase>
  )

  const backContent = (
    <CardBase bgColor={bgColor} isBack>
      <div>
        <span className="text-sm opacity-70 block">Endereço</span>
        <span className="text-sm block">
          {address || 'Endereço não disponível'}
        </span>
      </div>
      <div>
        <span className="text-sm opacity-70 block">Telefone da unidade</span>
        <span className="text-sm block">
          {phone || 'Telefone não disponível'}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm opacity-70 block">Email da unidade</span>
          <span className="text-sm block">
            {email || 'Email não disponível'}
          </span>
        </div>
      </div>
    </CardBase>
  )

  const cardContent = (
    <CardWrapper
      frontCard={frontContent}
      backCard={backContent}
      enableFlip={enableFlip}
      showInitialShine={showInitialShine}
    />
  )

  if (asLink && href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
