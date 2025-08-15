'use client'

import { BannerBase } from '@/components/ui/custom/banner-base'
import { iptuBannerIcon } from '@/constants/bucket'
import Image from 'next/image'

interface IptuBannerProps {
  onBannerClick?: () => void
  title: string
  subtitle: string
  route: string
}

export const IptuBanner = ({
  onBannerClick,
  title,
  subtitle,
  route,
}: IptuBannerProps) => {
  return (
    <BannerBase
      title={title}
      subtitle={subtitle}
      color="#407137"
      route={route}
      badge="IPTU 2025"
      onBannerClick={onBannerClick}
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
