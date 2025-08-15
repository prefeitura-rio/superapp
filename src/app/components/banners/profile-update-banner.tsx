'use client'

import { BannerBase } from '@/components/ui/custom/banner-base'
import { atualizarCadastroIcon } from '@/constants/bucket'
import Image from 'next/image'

interface ProfileUpdateBannerProps {
  onBannerClick?: () => void
  title: string
  subtitle: string
  route: string
}

export const ProfileUpdateBanner = ({
  onBannerClick,
  title,
  subtitle,
  route,
}: ProfileUpdateBannerProps) => {
  return (
    <BannerBase
      title={title}
      subtitle={subtitle}
      color="#589ECE"
      route={route}
      badge="Cadastro"
      onBannerClick={onBannerClick}
      image={
        <Image
          src={atualizarCadastroIcon}
          width={100}
          height={100}
          alt="Mão segurando o celular com check azul."
          className="h-30 w-auto absolute bottom-0 -right-6 z-20  md:right-4"
        />
      }
    />
  )
}
