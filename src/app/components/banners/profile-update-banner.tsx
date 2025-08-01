'use client'

import { BannerBase } from '@/components/ui/custom/banner-base'
import { atualizarCadastroIcon } from '@/constants/bucket'
import Image from 'next/image'

export const ProfileUpdateBanner = () => {
  return (
    <BannerBase
      title="Atualize seu cadastro"
      subtitle="E personalize seu atendimento"
      color="#589ECE"
      route="/"
      badge="Marina"
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
