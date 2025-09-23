'use client'

import { PetCardBackContent } from '@/components/ui/custom/pet-card-back-content'
import { PetCardFrontContent } from '@/components/ui/custom/pet-card-front-content'
import Link from 'next/link'
import { CardWrapper } from '../card-wrapper'
import { PetCardBase } from '../pet-card-base'

interface WalletCardProps {
  href?: string
  enableFlip?: boolean
  asLink?: boolean
  showInitialShine?: boolean
  onClick?: () => void
}

export function PetCard({
  href,
  enableFlip = true,
  asLink = false,
  showInitialShine = false,
  onClick,
}: WalletCardProps) {
  const frontContent = (
    <PetCardBase>
      {/* <PetCardFrontContent
        title="REGISTRO GERAL DE ANIMAIS"
        name={petName}
        species={species}
        sex={sex}
        microchipStatus={microchipStatus}
        petImageUrl={petImageUrl}
      /> */}
      <PetCardFrontContent
        title="REGISTRO GERAL DE ANIMAIS"
        name="Toddysvaldo"
        species="Canina"
        sex="Macho"
        microchipStatus="Pendente"
        petImageUrl="https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=300&h=300&fit=crop&crop=face"
      />
    </PetCardBase>
  )

  const backContent = (
    <PetCardBase isBack>
      {/* <PetCardBackContent
        birthDate={birthDate}
        castrated={castrated}
        registrationDate={registrationDate}
        communityAnimal={communityAnimal}
        breed={breed}
      /> */}
      <PetCardBackContent
        birthDate="12/04/2013"
        castrated="Sim"
        registrationDate="05/09/2023"
        communityAnimal="Não"
        breed="SRD (Sem Raça Definida)"
      />
    </PetCardBase>
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

  return <>{cardContent}</>
}
