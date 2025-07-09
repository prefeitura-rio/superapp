'use client'

import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Grid, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/grid'
import 'swiper/css/pagination'

// Import PNG icons
import ambienteIcon from '@/assets/icons/png/ambiente-icon.png'
import animaisIcon from '@/assets/icons/png/animais-icon.png'
import cidadaniaIcon from '@/assets/icons/png/cidadania-icon.png'
import cidadeIcon from '@/assets/icons/png/cidade-icon.png'
import culturaIcon from '@/assets/icons/png/cultura-icon.png'
import educacaoIcon from '@/assets/icons/png/educacao-icon.png'
import emergenciaIcon from '@/assets/icons/png/emergencia-icon.png'
import esporteIcon from '@/assets/icons/png/esporte-icon.png'
import familiaIcon from '@/assets/icons/png/familia-icon.png'
import impostosIcon from '@/assets/icons/png/imposto-icon.png'
import licencaIcon from '@/assets/icons/png/licenca-icon.png'
import saudeIcon from '@/assets/icons/png/saude-icon.png'
import segurancaIcon from '@/assets/icons/png/seguranca-icon.png'
import servidorIcon from '@/assets/icons/png/servidor-icon.png'
import trabalhoIcon from '@/assets/icons/png/trabalho-icon.png'
import transporteIcon from '@/assets/icons/png/transporte-icon.png'

interface ServiceItem {
  id: string
  title: string
  icon: string | ReactNode
  route?: string
}

const services: ServiceItem[] = [
  {
    id: '1',
    title: 'Transporte',
    icon: (
      <Image
        src={transporteIcon}
        alt="Transporte"
        width={48}
        height={48}
        className="w-12 h-12"
      />
    ),
  },
  {
    id: '2',
    title: 'Cidade',
    icon: (
      <Image
        src={cidadeIcon}
        alt="Cidade"
        width={48}
        height={48}
        className="w-12 h-12"
      />
    ),
  },
  {
    id: '3',
    title: 'Saúde',
    icon: (
      <Image
        src={saudeIcon}
        alt="Saúde"
        width={48}
        height={48}
        className="w-12 h-12"
      />
    ),
  },
  {
    id: '4',
    title: 'Educação',
    icon: (
      <Image
        src={educacaoIcon}
        alt="Educação"
        width={48}
        height={48}
        className="w-12 h-12"
      />
    ),
  },
  {
    id: '5',
    title: 'Ambiente',
    icon: (
      <Image
        src={ambienteIcon}
        alt="Ambiente"
        width={48}
        height={48}
        className="w-12 h-12"
      />
    ),
  },
  {
    id: '6',
    title: 'Segurança',
    icon: (
      <Image
        src={segurancaIcon}
        alt="Segurança"
        width={48}
        height={48}
        className="w-12 h-12"
      />
    ),
  },
  {
    id: '7',
    title: 'Cidadania',
    icon: (
      <Image
        src={cidadaniaIcon}
        alt="Cidadania"
        width={48}
        height={48}
        className="w-12 h-12"
      />
    ),
  },
  {
    id: '8',
    title: 'Cultura',
    icon: (
      <Image
        src={culturaIcon}
        alt="Cultura"
        width={48}
        height={48}
        className="w-12 h-12"
      />
    ),
  },
  {
    id: '9',
    title: 'Trabalho',
    icon: (
      <Image
        src={trabalhoIcon}
        alt="Trabalho"
        width={48}
        height={48}
        className="w-12 h-12"
      />
    ),
  },
  {
    id: '10',
    title: 'Emergência',
    icon: (
      <Image
        src={emergenciaIcon}
        alt="Emergência"
        width={48}
        height={48}
        className="w-12 h-12"
      />
    ),
  },
  {
    id: '11',
    title: 'Esportes',
    icon: (
      <Image
        src={esporteIcon}
        alt="Esportes"
        width={48}
        height={48}
        className="w-12 h-12"
      />
    ),
  },
  {
    id: '12',
    title: 'Família',
    icon: (
      <Image
        src={familiaIcon}
        alt="Família"
        width={48}
        height={48}
        className="w-12 h-12"
      />
    ),
  },
  {
    id: '13',
    title: 'Licenças',
    icon: (
      <Image
        src={licencaIcon}
        alt="Licenças"
        width={48}
        height={48}
        className="w-12 h-12"
      />
    ),
  },
  {
    id: '14',
    title: 'Servidor',
    icon: (
      <Image
        src={servidorIcon}
        alt="Servidor"
        width={48}
        height={48}
        className="w-12 h-12"
      />
    ),
  },
  {
    id: '15',
    title: 'Taxas',
    icon: (
      <Image
        src={impostosIcon}
        alt="Taxas"
        width={48}
        height={48}
        className="w-12 h-12"
      />
    ),
  },
  {
    id: '16',
    title: 'Animais',
    icon: (
      <Image
        src={animaisIcon}
        alt="Animais"
        width={48}
        height={48}
        className="w-12 h-12"
      />
    ),
  },
]

export default function HomeServicesGrid() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return (
      <div className="px-4 pb-4">
        <div className="grid grid-cols-4 gap-2">
          {/* First row */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`row1-${i}`} className="flex flex-col items-center">
              <Skeleton className="w-full aspect-square rounded-2xl mb-2 min-h-12 min-w-12 sm:min-h-16 sm:min-w-16" />
              <Skeleton className="h-3 w-8 sm:w-12" />
            </div>
          ))}
          {/* Second row */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`row2-${i}`} className="flex flex-col items-center">
              <Skeleton className="w-full aspect-square rounded-2xl mb-2 min-h-12 min-w-12 sm:min-h-16 sm:min-w-16" />
              <Skeleton className="h-3 w-8 sm:w-12" />
            </div>
          ))}
        </div>

        {/* Skeleton pagination bullets */}
        <div className="flex justify-center items-center h-12">
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-3 h-2 rounded-full" />
            <Skeleton className="w-2 h-2 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pb-4">
      <div className="pb-0">
        <Swiper
          slidesPerView={4}
          slidesPerGroup={8}
          grid={{
            rows: 2,
            fill: 'row',
          }}
          spaceBetween={8}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          modules={[Grid, Pagination]}
          className="home-services-swiper animate-fade-in"
        >
          {services.map(service => (
            <SwiperSlide key={service.id}>
              <Link href={`/services/category/${service.title}`}>
                <div className="flex flex-col items-center justify-center p-2 bg-card rounded-2xl aspect-square cursor-pointer hover:bg-card/80 transition-colors">
                  <div className="flex items-center justify-center text-3xl mb-1">
                    {typeof service.icon === 'string'
                      ? service.icon
                      : service.icon}
                  </div>
                </div>
                <span className="flex flex-col items-center justify-center pt-2 text-xs sm:text-sm text-foreground text-center leading-tight font-medium">
                  {service.title}
                </span>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .swiper-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 10px;
        }
        .home-services-swiper .swiper-pagination {
          position: relative !important;
          bottom: auto !important;
          margin-top: 1rem !important;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .swiper-pagination-bullet { 
          background: var(--muted-foreground);
          opacity: 1;
          margin-left: 3px !important;
          margin-right: 3px !important;
          transition: all 0.2s ease-in-out !important;
          width: 8px;
          height: 8px;
          border-radius: 50% !important;
        }
        .swiper-pagination-bullet-active {
          background: var(--primary);
          width: 15px;
          border-radius: 16px !important;
          height: 5px;
        }
      `}</style>
    </div>
  )
}
