'use client'

import { Badge } from '@/components/ui/badge'
import { CardBackContent } from '@/components/ui/custom/card-back-content'
import { CardFrontContent } from '@/components/ui/custom/card-front-content'
import { isBigQueryOrigin, isMCPOrigin } from '@/helpers/health'
import { formatTitleCase } from '@/lib/utils'
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

const RISK_LEVEL: Record<Exclude<RiskStatusProps, 'Verde'>, string> = {
  Amarelo: 'Área em risco moderado',
  Laranja: 'Área em risco alto',
  Vermelho: 'Área em risco grave',
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
  origin?: string
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
  origin,
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

  const getPrimaryValueSlot = () => {
    if (isMCPOrigin(origin)) {
      return (
        <Badge className="text-xs bg-white/15 text-white">
          Efetue seu cadastro na CF
        </Badge>
      )
    }

    if (isBigQueryOrigin(origin) && riskStatus) {
      return (
        <Badge
          className={`${BADGE_COLOR_BY_STATUS[riskStatus as 'Amarelo' | 'Laranja' | 'Vermelho']} text-white text-xs`}
        >
          {RISK_LEVEL[riskStatus as 'Amarelo' | 'Laranja' | 'Vermelho']}
        </Badge>
      )
    }

    return null
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
        primaryValueSlot={getPrimaryValueSlot()}
      />
    </CardBase>
  )

  const backContent = (
    <CardBase bgColor={bgColor} isBack>
      <CardBackContent
        fields={[
          {
            label: 'Endereço',
            value: formatTitleCase(address as string),
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
      <Link href={href} className="block" onClick={onClick}>
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
