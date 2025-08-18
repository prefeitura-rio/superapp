'use client'

import { CardFrontContent } from '@/components/ui/custom/card-front-content'
import Link from 'next/link'
import { CardBase } from '../card-base'
import { CardWrapper } from '../card-wrapper'

interface CaretakerCardProps {
  href?: string
  title: string
  name?: string
  primaryLabel: string
  primaryValue: string
  secondaryLabel: string
  secondaryValue: string
  enableFlip?: boolean
  asLink?: boolean
  showInitialShine?: boolean
  hasUpdateBadge?: boolean
  onClick?: () => void
}

export function CaretakerCard({
  href,
  title,
  name,
  primaryLabel = 'Total de chamados',
  primaryValue,
  secondaryLabel = 'Fechados',
  secondaryValue,
  enableFlip = true,
  asLink = false,
  showInitialShine = false,
  hasUpdateBadge,
  onClick,
}: CaretakerCardProps) {
  const bgColor = 'bg-[#A43B31]'
  const frontContent = (
    <CardBase bgColor={bgColor}>
      <CardFrontContent
        title={title}
        name={name}
        primaryLabel={primaryLabel}
        primaryValue={primaryValue}
        secondaryLabel={secondaryLabel}
        secondaryValue={secondaryValue}
        hasUpdateBadge={hasUpdateBadge}
      />
    </CardBase>
  )

  const cardContent = (
    <CardWrapper
      frontCard={frontContent}
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

  return cardContent
}
