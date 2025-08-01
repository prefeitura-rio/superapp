'use client'

import { BannerBase } from '@/components/ui/custom/banner-base'
import { licencaBannerIcon } from '@/constants/bucket'
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
          src={licencaBannerIcon}
          width={100}
          height={100}
          alt="Documentos de impostos."
          className="h-29 w-auto absolute bottom-1 -right-2 z-20  md:right-12"
        />
      }
    />
  )
}
