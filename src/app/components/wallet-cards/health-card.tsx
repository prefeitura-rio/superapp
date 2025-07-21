'use client'

import { CardBackContent } from '@/components/ui/custom/card-back-content'
import { CardFrontContent } from '@/components/ui/custom/card-front-content'
import Link from 'next/link'
import { CardBase } from '../card-base'
import { CardWrapper } from '../card-wrapper'

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
  asLink?: boolean
  showInitialShine?: boolean
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
  enableFlip = true,
  asLink = false,
  showInitialShine = false,
}: WalletCardProps) {
  const bgColor = 'bg-[#3F6194]'

  const frontContent = (
    <CardBase bgColor={bgColor}>
      <CardFrontContent
        title={title}
        name={name}
        primaryLabel={primaryLabel}
        primaryValue={primaryValue}
        secondaryLabel={secondaryLabel}
        secondaryValue={secondaryValue}
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
      <Link href={href} className="block">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
