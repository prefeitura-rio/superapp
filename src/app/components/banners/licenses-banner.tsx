'use client'

import { BannerBase } from '@/components/ui/custom/banner-base'
import Image from 'next/image'
import { cariocaIcon } from '../../../constants/bucket'

export const LicensesBanner = () => {
  return (
    <BannerBase
      title="Regularize sua obra!"
      subtitle="E ganhe até 50% de desconto"
      color="#A24821"
      route="/services/category/Cidade/82608/carioca-digital"
      badge="Licenças"
      image={
        <Image
          src={cariocaIcon}
          width={100}
          height={100}
          alt="Pessoa de capacete segurando documentos."
          className="h-28 w-auto absolute bottom-0 right-0 z-20  md:right-7"
        />
      }
    />
  )
}
