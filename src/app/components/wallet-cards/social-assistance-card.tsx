'use client'

import { CardBackContent } from '@/components/ui/custom/card-back-content'
import { CardFrontContent } from '@/components/ui/custom/card-front-content'
import Link from 'next/link'
import { CardBase } from '../card-base'
import { CardWrapper } from '../card-wrapper'

interface SocialAssistanceCardProps {
  href?: string
  title: string
  number?: string
  primaryLabel: string
  primaryValue: string
  bgColor?: string
  address?: string
  phone?: string
  unitName?: string
  enableFlip?: boolean
  asLink?: boolean
  showInitialShine?: boolean
  badgeStatus?: string
  onClick?: () => void
}

export function SocialAssistanceCard({
  href,
  title,
  number,
  primaryLabel = 'Data de recadastramento',
  primaryValue,
  address,
  phone,
  unitName,
  enableFlip = true,
  asLink = false,
  showInitialShine = false,
  onClick,
}: SocialAssistanceCardProps) {
  const bgColor = 'bg-[#6BA26B]'

  const frontContent = (
    <CardBase bgColor={bgColor}>
      <CardFrontContent
        title={title}
        name={number}
        primaryLabel={primaryLabel}
        primaryValue={primaryValue}
      />
    </CardBase>
  )

  const backContent = (
    <CardBase bgColor={bgColor} isBack>
      <div className="flex flex-col gap-4 h-full">
        {unitName && (
          <div>
            <p className="text-lg font-medium text-white">{unitName}</p>
          </div>
        )}

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
          ]}
          lastFieldFullWidth={false}
        />
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
      <Link
        href={href}
        className="block"
        onClick={onClick}
        aria-label={`${title}: ${
          number || ''
        }. ${primaryLabel}: ${primaryValue}. Clique para mais detalhes.`}
      >
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
