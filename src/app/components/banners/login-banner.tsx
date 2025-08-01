'use client'

import { BannerBase } from '@/components/ui/custom/banner-base'
import { deslogadoIcon } from '@/constants/bucket'
import Image from 'next/image'

export const LoginBanner = () => {
  return (
    <BannerBase
      title="Acesse sua carteira"
      subtitle="Faça login em gov.br"
      color="#13335A"
      route="/authentication-required/wallet"
      image={
        <Image
          src={deslogadoIcon}
          width={100}
          height={100}
          alt="Dois cartões."
          className="h-12 w-23 absolute bottom-6 right-3 z-20 md:right-12"
        />
      }
    />
  )
}
