'use client'

import smilingWoman from '@/assets/taxes-banner.png'
import { BannerBase } from '@/components/ui/custom/banner-base'
import Image from 'next/image'

export const TaxesBanner = () => {
  return (
    <BannerBase
      title="Carioca em dia"
      subtitle="Desconto até 30 de agosto"
      color="#977926"
      route="/"
      badge="Impostos"
      image={
        <Image
          src={smilingWoman}
          alt="Pessoa sentada em uma poltrona azul"
          className="h-29 w-auto absolute bottom-1 -right-2 z-20"
        />
      }
    />
  )
}
