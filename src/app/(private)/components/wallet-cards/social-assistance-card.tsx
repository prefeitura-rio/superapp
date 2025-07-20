'use client'

import { CardBackContent } from '@/components/ui/custom/card-back-content'
import { CardFrontContent } from '@/components/ui/custom/card-front-content'
import Link from 'next/link'
import { Badge } from '../../../../components/ui/badge'
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
  badgeStatus = 'Atualizado' as 'Atualizado' | 'Em atualização' | 'Atualizar',
}: SocialAssistanceCardProps) {
  const bgColor = 'bg-[#6BA26B]'

  const getBadgeComponent = () => {
    if (!badgeStatus) return null

    const badgeConfig = {
      Atualizado: {
        text: 'Atualizado',
        className: 'bg-green-500 text-white',
      },
      'Em atualização': {
        text: 'Em atualização',
        className: 'bg-orange-500 text-white',
      },
      Atualizar: {
        text: 'Atualizar',
        className: 'bg-red-500 text-white',
      },
    }

    const config = badgeConfig[badgeStatus as keyof typeof badgeConfig]

    return (
      <Badge
        className={`absolute bottom-6 right-6 text-xs z-30 ${config.className}`}
      >
        {config.text}
      </Badge>
    )
  }

  const frontContent = (
    <CardBase bgColor={bgColor}>
      <CardFrontContent
        title={title}
        name={number}
        primaryLabel={primaryLabel}
        primaryValue={primaryValue}
      />
      {getBadgeComponent()}
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
      <Link href={href} className="block">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
