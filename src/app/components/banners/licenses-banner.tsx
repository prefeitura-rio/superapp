'use client'

import smilingWoman from '@/assets/licenses-banner.png'
import { BannerBase } from '@/components/ui/custom/banner-base'
import Image from 'next/image'

export const LicensesBanner = () => {
  return (
    <BannerBase
      title="Regularize sua obra!"
      subtitle="E ganhe até 50% de desconto"
      color="#A24821"
      route="/"
      badge="Licenças"
      image={
        <Image
          src={smilingWoman}
          alt="Pessoa de capacete segurando documentos."
          className="h-28 w-auto absolute bottom-0 right-0 z-20  md:right-7"
        />
      }
    />
  )
}
