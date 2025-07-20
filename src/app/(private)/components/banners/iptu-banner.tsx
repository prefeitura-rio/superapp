'use client'

import smilingWoman from '@/assets/iptu-banner.png'
import { BannerBase } from '@/components/ui/custom/banner-base'
import Image from 'next/image'

export const IptuBanner = () => {
  return (
    <BannerBase
      title="Fique em dia!"
      subtitle="Emita sua guia ou saiba mais"
      color="#407137"
      route="/services/iptu"
      badge="IPTU 2025"
      image={
        <Image
          src={smilingWoman}
          alt="Pessoa sentada em uma poltrona azul"
          className="h-31 w-auto absolute bottom-0 -right-2 z-20"
        />
      }
    />
  )
}
