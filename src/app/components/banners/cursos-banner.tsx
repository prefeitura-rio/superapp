'use client'

import { BannerBase } from '@/components/ui/custom/banner-base'
import { cursosBannerIcon } from '@/constants/bucket/banners'
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
      gradient={{
        from: '#125EBA',
        to: '#1F7AE8',
        direction: 'to right',
      }}
      showBlur={false}
      route={route}
      logo={
        <div className="flex flex-col">
          <span className="text-white font-medium text-base leading-5">
            Cursos da Prefeitura
          </span>
          <span className="text-white text-sm leading-4">
            gratuito e com certificado
          </span>
        </div>
      }
      badge="Ver cursos"
      badgeClassName="bg-white text-[#0A3870] font-normal text-xs flex justify-center items-center"
      onBannerClick={onBannerClick}
      image={
        <Image
          src={cursosBannerIcon}
          alt="Pessoa sentada com livros estudando."
          width={200}
          height={200}
          className="h-30 w-auto absolute bottom-0 right-0 z-20  md:right-0"
        />
      }
    />
  )
}
