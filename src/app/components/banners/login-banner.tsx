'use client'

import { BannerBase } from '@/components/ui/custom/banner-base'
import { acessarCarteiraIcon } from '@/constants/bucket/banners'
import Image from 'next/image'

interface LoginBannerProps {
  onBannerClick?: () => void
  title: string
  subtitle: string
  route: string
}

export const LoginBanner = ({
  onBannerClick,
  title,
  subtitle,
  route,
}: LoginBannerProps) => {
  return (
    <BannerBase
      title=""
      subtitle=""
      color="#5987DB"
      showBlur={false}
      route={route}
      logo={
        <div className="flex flex-col">
          <span className="text-white font-medium text-base leading-5">
            Acesse sua carteira e os
          </span>
          <span className="text-white font-medium text-base leading-5">
            serviços municipais
          </span>
        </div>
      }
      badge="Fazer login"
      badgeClassName="bg-white text-[#0A3870] font-normal text-xs flex justify-center items-center"
      onBannerClick={onBannerClick}
      image={
        <Image
          src={acessarCarteiraIcon}
          alt="Acesse sua carteira e os serviços municipais."
          width={200}
          height={200}
          className="h-30 w-auto absolute bottom-0 right-0 z-20 md:right-0"
        />
      }
    />
  )
}
