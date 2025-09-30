'use client'

import { PetCardBackContent } from '@/components/ui/custom/pet-card-back-content'
import { PetCardFrontContent } from '@/components/ui/custom/pet-card-front-content'
import type { ModelsPet } from '@/http/models'
import Link from 'next/link'
import { CardWrapper } from '../card-wrapper'
import { PetCardBase } from '../pet-card-base'

interface WalletCardProps {
  href?: string
  enableFlip?: boolean
  asLink?: boolean
  showInitialShine?: boolean
  petData: ModelsPet
  onClick?: () => void
}

const sexSerializer: Record<string, string> = {
  M: 'Macho',
  F: 'Fêmea',
}

export function PetCard({
  href,
  enableFlip = true,
  petData,
  asLink = false,
  showInitialShine = false,
  onClick,
}: WalletCardProps) {
  const specieSerialized =
    petData.especie_nome!.charAt(0).toUpperCase() +
    petData.especie_nome!.slice(1).toLowerCase()

  const registerDate = petData.registro_data
    ? new Date(petData.registro_data).toLocaleDateString('pt-BR')
    : 'Não disponível'

  const birthDate = petData.nascimento_data
    ? new Date(petData.nascimento_data).toLocaleDateString('pt-BR')
    : 'Não disponível'

  const frontContent = (
    <PetCardBase>
      <PetCardFrontContent
        title="REGISTRO GERAL DE ANIMAIS"
        name={petData.animal_nome!}
        species={specieSerialized}
        sex={sexSerializer[petData.sexo_sigla!] || 'Indefinido'}
        microchipStatus={
          petData.microchip_numero
            ? String(petData.microchip_numero)
            : 'Pendente'
        }
        petImageUrl={petData.foto_url!}
      />
    </PetCardBase>
  )

  const backContent = (
    <PetCardBase isBack>
      <PetCardBackContent
        birthDate={birthDate}
        castrated={petData.indicador_castrado ? 'Sim' : 'Não'}
        registrationDate={registerDate}
        communityAnimal={'Não disponível'}
        breed={petData.raca_nome!}
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
