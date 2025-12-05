'use client'

import { BannerBase } from '@/components/ui/custom/banner-base'
import { atualizarCadastroIcon } from '@/constants/bucket'
import Image from 'next/image'

interface ProfileUpdateBannerProps {
  onBannerClick?: () => void
  title: string
  subtitle: string
  route: string
}

export const ProfileUpdateBanner = ({
  onBannerClick,
  title,
  subtitle,
  route,
}: ProfileUpdateBannerProps) => {
  return (
    <BannerBase
      title={title}
      subtitle={subtitle}
      color="#007876"
      gradient={{
        from: '#007876',
        to: '#339C9B',
        direction: 'to right',
      }}
      showBlur={false}
      route={route}
      logo={
        <div className="flex flex-col">
          <span className="text-white font-medium text-base leading-5">
            Atualize seu cadastro
          </span>
          <span className="text-white text-normal text-sm leading-4">
            E personalize seu atendimento
          </span>
        </div>
      }
      badge="Atualizar"
      badgeClassName="bg-white text-[#026361] font-normal text-xs flex justify-center items-center"
      onBannerClick={onBannerClick}
      image={
        <Image
          src={atualizarCadastroIcon}
          alt="Atualize seu cadastro"
          width={200}
          height={200}
          className="h-32 w-auto absolute bottom-0 -right-8 z-20  md:right-0"
        />
      }
    />
  )
}
