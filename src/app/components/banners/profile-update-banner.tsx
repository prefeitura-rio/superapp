'use client'

import smilingWoman from '@/assets/profile-update-banner.png'
import { BannerBase } from '@/components/ui/custom/banner-base'
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
          src={smilingWoman}
          alt="Mão segurando o celular com check azul."
          className="h-30 w-auto absolute bottom-0 -right-6 z-20  md:right-4"
        />
      }
    />
  )
}
