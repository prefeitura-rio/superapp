'use client'

import { CardBackContent } from '@/components/ui/custom/card-back-content'
import { CardFrontContent } from '@/components/ui/custom/card-front-content'
import type { StaticImageData } from 'next/image'
import Link from 'next/link'
import { CardBase } from '../card-base'
import { CardWrapper } from '../card-wrapper'

interface EducationCardProps {
  href?: string
  title: string
  name?: string
  primaryLabel: string
  primaryValue: string
  secondaryLabel: string
  secondaryValue: string
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

export function EducationCard({
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
}: EducationCardProps) {
  const bgColor = 'bg-[#B7632F]'

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
          },
          {
            label: 'Telefone da unidade',
            value: phone,
          },
          {
            label: 'Email da unidade',
            value: email,
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
