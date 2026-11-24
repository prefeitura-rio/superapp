'use client'

import { BannerBase } from '@/components/ui/custom/banner-base'
import { licencaBannerIcon } from '@/constants/bucket'
import Image from 'next/image'

interface TaxesBannerProps {
  onBannerClick?: () => void
  title: string
  subtitle: string
  route: string
}

export const TaxesBanner = ({
  onBannerClick,
  title,
  subtitle,
  route,
}: TaxesBannerProps) => {
  return (
    <BannerBase
      title={title}
      subtitle={subtitle}
      color="#977926"
      route={route}
      badge="Impostos"
      onBannerClick={onBannerClick}
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
