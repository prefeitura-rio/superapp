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
          width={80}
          height={80}
          alt="Dois cartões."
          className="h-15 w-24 absolute bottom-5 right-2 z-20 md:right-12"
        />
      }
    />
  )
}
