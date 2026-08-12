'use client'

import { BannerBase } from '@/components/ui/custom/banner-base'
import {
  cadmicroBannerIcon,
  empregabilidadeBannerIcon,
} from '@/constants/bucket/banners'
import Image from 'next/image'

interface CadMicroBannerProps {
  onBannerClick?: () => void
  title: string
  subtitle: string
  route: string
}

export const CadMicroBanner = ({
  onBannerClick,
  title,
  subtitle,
  route,
}: CadMicroBannerProps) => {
  return (
    <BannerBase
      title=""
      subtitle=""
      color="#007876"
      gradient={{
        from: '#007876',
        to: '#259795',
        direction: 'to right',
      }}
      showBlur={false}
      route={route}
      logo={
        <div className="flex flex-col">
          <span className="text-white font-medium text-base leading-5">
            {title}
          </span>
          <span className="text-white text-xs md:text-sm leading-4">
            {subtitle}
          </span>
        </div>
      }
      badge="Cadastrar"
      badgeClassName="bg-white text-[#198382] font-normal text-xs flex justify-center items-center"
      onBannerClick={onBannerClick}
      image={
        <Image
          src={cadmicroBannerIcon}
          alt="Cadastre seu veículo para habilitar o uso em toda a cidade."
          width={200}
          height={200}
          className="h-30 w-auto rounded-br-xl rounded-tr-xl absolute bottom-0 right-0 z-20 md:right-0"
        />
      }
    />
  )
}
