'use client'

import { BannerBase } from '@/components/ui/custom/banner-base'
import { empregabilidadeBannerIcon } from '@/constants/bucket/banners'
import Image from 'next/image'

interface EmpregabilidadeBannerProps {
  onBannerClick?: () => void
  title: string
  subtitle: string
  route: string
}

export const EmpregabilidadeBanner = ({
  onBannerClick,
  title,
  subtitle,
  route,
}: EmpregabilidadeBannerProps) => {
  return (
    <BannerBase
      title=""
      subtitle=""
      color="#4D58CE"
      gradient={{
        from: '#4D58CE',
        to: '#6470EC',
        direction: 'to right',
      }}
      showBlur={false}
      route={route}
      logo={
        <div className="flex flex-col">
          <span className="text-white font-medium text-base leading-5">
            {title}
          </span>
          <span className="text-white text-sm leading-4">{subtitle}</span>
        </div>
      }
      badge="Ver vagas"
      badgeClassName="bg-white text-[#0A3870] font-normal text-xs flex justify-center items-center"
      onBannerClick={onBannerClick}
      image={
        <Image
          src={empregabilidadeBannerIcon}
          alt="Encontre seu emprego no Oportunidades Cariocas."
          width={200}
          height={200}
          className="h-30 w-auto absolute bottom-0 right-0 z-20 md:right-0"
        />
      }
    />
  )
}
