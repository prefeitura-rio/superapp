'use client'

import { BannerBase } from '@/components/ui/custom/banner-base'
import Image from 'next/image'
import { cariocaIcon } from '../../../constants/bucket'

interface LicensesBannerProps {
  onBannerClick?: () => void
  title: string
  subtitle: string
  route: string
}

export const LicensesBanner = ({
  onBannerClick,
  title,
  subtitle,
  route,
}: LicensesBannerProps) => {
  return (
    <BannerBase
      title={title}
      subtitle={subtitle}
      color="#A24821"
      route={route}
      badge="Licenças"
      onBannerClick={onBannerClick}
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
