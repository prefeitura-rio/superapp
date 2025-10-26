'use client'

import { BannerBase } from '@/components/ui/custom/banner-base'
import { cicloCariocaIcon, cursosBannerIcon } from '@/constants/bucket/banners'
import Image from 'next/image'

interface CursosBannerProps {
  onBannerClick?: () => void
  title: string
  subtitle: string
  route: string
}

export const CursosBanner = ({
  onBannerClick,
  title,
  subtitle,
  route,
}: CursosBannerProps) => {
  return (
    <BannerBase
      title={title}
      subtitle={subtitle}
      color="#0A56A0"
      route={route}
      logo={
        <Image
          src={cicloCariocaIcon}
          width={123}
          className="-mt-1 w-auto h-auto"
          height={123}
          alt="Cursos"
        />
      }
      onBannerClick={onBannerClick}
      image={
        <Image
          src={cursosBannerIcon}
          alt="Pessoa sentada com livros estudando."
          width={90}
          height={90}
          className="h-30 w-auto absolute bottom-0 right-1.5 z-20  md:right-12"
        />
      }
    />
  )
}
