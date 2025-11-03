'use client'

import { PrefLogo } from '@/assets/icons/pref-logo'
import Image from 'next/image'
import { createElement, useState } from 'react'
import { Badge } from '../badge'

interface PetCardFrontContentProps {
  title: string
  name: string
  species: string
  sex: string
  microchipStatus: string
  petImageUrl?: string
}

interface FallbackImageProps {
  src?: string
  alt?: string
  width?: number
  height?: number
  className?: string
}

const FallbackImage = ({ src, alt, ...props }: FallbackImageProps) => {
  const fallback =
    'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/avatars/avatar9.png'

  const [imgSrc, setImgSrc] = useState(src)

  return createElement(Image, {
    ...props,
    src: imgSrc || fallback,
    alt: alt || 'Imagem',
    onError: () => setImgSrc(fallback),
  })
}

export function PetCardFrontContent({
  title,
  name,
  species,
  sex,
  microchipStatus,
  petImageUrl,
}: PetCardFrontContentProps) {
  return (
    <div className="h-[140px] relative">
      <PrefLogo fill="#406BCC" className="absolute top-0 right-0" />

      <div className="mb-4">
        <p className="text-xs font-normal text-[#2A2D32] mb-1 leading-4">
          {title}
        </p>
        <p className="text-xl font-medium text-[#2A2D32] break-words line-clamp-2 leading-6">
          {name}
        </p>
      </div>

      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden text-[#2A2D32] flex-shrink-0">
          <FallbackImage
            src={petImageUrl}
            alt={`Foto de ${name}`}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-between flex-1">
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

          {/* Microchip */}
          <div>
            <p className="text-xs font-normal text-[#2A2D32] mt-1">Microchip</p>
            {microchipStatus === 'Pendente' ? (
              <Badge className="text-xs font-medium bg-destructive text-white">
                {microchipStatus}
              </Badge>
            ) : (
              <p className="leading-5 text-sm font-normal tracking-normal text-[#2A2D32]">
                {microchipStatus}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
