// components/ui/custom/pet-card-front-content.tsx
'use client'

import { PrefLogo } from '@/assets/icons/pref-logo'
import Image from 'next/image'
import { Badge } from '../badge'

interface PetCardFrontContentProps {
  title: string
  name: string
  species: string
  sex: string
  microchipStatus: 'Pendente' | 'Ativo' | 'Inativo'
  petImageUrl?: string
}

export function PetCardFrontContent({
  title,
  name,
  species,
  sex,
  microchipStatus,
  petImageUrl,
}: PetCardFrontContentProps) {
  const getMicrochipStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-500'
      case 'Pendente':
        return 'bg-red-500'
      case 'Inativo':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="h-[140px] relative">
      <PrefLogo fill="#406BCC" className="absolute top-0 right-0" />

      {/* Primeiro container: Título e Nome do pet */}
      <div className="mb-4">
        <p className="text-xs font-normal text-[#2A2D32] mb-1 leading-4">
          {title}
        </p>
        <p className="text-xl font-medium text-[#2A2D32] break-words line-clamp-2 leading-6">
          {name}
        </p>
      </div>

      {/* Segundo container: Foto e informações */}
      <div className="flex gap-4">
        {/* Foto do pet */}
        <div className="w-20 h-20 rounded-xl overflow-hidden text-[#2A2D32] flex-shrink-0">
          {petImageUrl ? (
            <Image
              src={petImageUrl}
              alt={`Foto de ${name}`}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full text-[#2A2D32]flex items-center justify-center">
              <span className="text-[#2A2D32] text-xs">Sem foto</span>
            </div>
          )}
        </div>

        {/* Informações do pet */}
        <div className="flex flex-col justify-between flex-1">
          {/* Primeira linha: Espécie e Sexo */}
          <div className="flex gap-8">
            <div>
              <p className="text-xs font-normal text-[#2A2D32]">Espécie</p>
              <p className="text-sm font-medium text-[#2A2D32]">{species}</p>
            </div>
            <div>
              <p className="text-xs font-normal text-[#2A2D32]">Sexo</p>
              <p className="text-sm font-medium text-[#2A2D32]">{sex}</p>
            </div>
          </div>

          {/* Segunda linha: Microchip */}
          <div>
            <p className="text-xs font-normal text-[#2A2D32] mt-1">Microchip</p>
            <Badge
              className={`text-xs font-medium ${getMicrochipStatusColor(
                microchipStatus
              )} text-white`}
            >
              {microchipStatus}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
