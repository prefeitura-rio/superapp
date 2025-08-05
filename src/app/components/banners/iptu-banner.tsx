'use client'

import { BannerBase } from '@/components/ui/custom/banner-base'
import { iptuBannerIcon } from '@/constants/bucket'
import Image from 'next/image'

export const IptuBanner = () => {
  return (
    <BannerBase
      title="Fique em dia!"
      subtitle="Emita sua guia ou saiba mais"
      color="#407137"
      route="/services/category/taxas/84670/carioca-digital"
      badge="IPTU 2025"
      image={
        <Image
          src={iptuBannerIcon}
          alt="Pessoa acessando serviços pelo celular."
          width={100}
          height={100}
          className="h-31 w-auto absolute bottom-0 -right-2 z-20  md:right-12"
        />
      }
    />
  )
}
