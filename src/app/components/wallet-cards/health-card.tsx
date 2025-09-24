'use client'

import { Badge } from '@/components/ui/badge'
import { CardBackContent } from '@/components/ui/custom/card-back-content'
import { CardFrontContent } from '@/components/ui/custom/card-front-content'
import type { RiskStatusProps } from '@/types/health'
import Link from 'next/link'
import { useState } from 'react'
import { CardBase } from '../card-base'
import { CardWrapper } from '../card-wrapper'
import { WalletHealthStatusDrawerContent } from '../drawer-contents/wallet-health-status-drawer-content'

const BADGE_COLOR_BY_STATUS: Record<
  Exclude<RiskStatusProps, 'Verde'>,
  string
> = {
  Amarelo: 'bg-[#D79A00]',
  Laranja: 'bg-card-5',
  Vermelho: 'bg-destructive',
}

interface WalletCardProps {
  href?: string
  title: string
  name?: string
  primaryLabel: string
  primaryValue: string
  secondaryLabel: string
  secondaryValue: string
  bgColor?: string
  address?: string
  phone?: string
  email?: string
  enableFlip?: boolean
  riskStatus?: RiskStatusProps
  asLink?: boolean
  showInitialShine?: boolean
  onClick?: () => void
}

export function HealthCard({
  href,
  title,
  name,
  primaryLabel = 'Status',
  primaryValue,
  secondaryLabel = 'Horário de Atendimento',
  secondaryValue,
  address,
  phone,
  email,
  riskStatus,
  enableFlip = true,
  asLink = false,
  showInitialShine = false,
  onClick,
}: WalletCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const bgColor = 'bg-[#3F6194]'

  const shouldEnableStatusClick = !asLink && !href && enableFlip

  const handleStatusClick = (e: React.MouseEvent) => {
    if (shouldEnableStatusClick) {
      e.stopPropagation()
      setIsDrawerOpen(prev => !prev)
    }
  }

  const shouldRenderHealthStatusIndicator =
    primaryValue !== 'Fechado' && riskStatus

  const frontContent = (
    <CardBase bgColor={bgColor}>
      <CardFrontContent
        title={title}
        name={name}
        primaryLabel={primaryLabel}
        primaryValue={primaryValue}
        secondaryLabel={secondaryLabel}
        secondaryValue={secondaryValue}
        primaryValueSlot={
          riskStatus && (
            <Badge
              className={`
        ${BADGE_COLOR_BY_STATUS[riskStatus as 'Amarelo' | 'Laranja' | 'Vermelho']} 
        text-white -mb-6 text-xs
      `}
            >
              Área em risco
            </Badge>
          )
        }
      />
    </CardBase>
  )

  const backContent = (
    <CardBase bgColor={bgColor} isBack>
      <CardBackContent
        fields={[
          {
            label: 'Endereço',
            value: address,
            fallback: 'Endereço não disponível',
          },
          {
            label: 'Telefone da unidade',
            value: phone,
            fallback: 'Telefone não disponível',
          },
          {
            label: 'Email da unidade',
            value: email,
            fallback: 'Email não disponível',
          },
        ]}
      />
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
      <Link
        href={href}
        className="block"
        onClick={onClick}
        aria-label={`${title}: ${name || ''}. ${primaryLabel}: ${primaryValue}. ${secondaryLabel}: ${secondaryValue}. Clique para mais detalhes.`}
      >
        {cardContent}
      </Link>
    )
  }

  return (
    <>
      {cardContent}
      {isDrawerOpen && (
        <WalletHealthStatusDrawerContent
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          riskStatus={riskStatus}
        />
      )}
    </>
  )
}
