'use client'

import loginBanner from '@/assets/login-banner.png'
import { BannerBase } from '@/components/ui/custom/banner-base'
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
          src={loginBanner}
          alt="Dois cartões."
          className="h-12 w-23 absolute bottom-6 right-3 z-20 md:right-12"
        />
      }
    />
  )
}
