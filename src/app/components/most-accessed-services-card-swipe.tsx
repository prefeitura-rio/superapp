'use client'

import alvaraIcon from '@/assets/icons/png/alvara-icon.png'
import cadrioIcon from '@/assets/icons/png/cadrio-icon.png'
import cadunicoIcon from '@/assets/icons/png/cadunico-icon.png'
import dividaativaIcon from '@/assets/icons/png/dividaativa-icon.png'
import iptuIcon from '@/assets/icons/png/iptu-icon.png'
import licencasanitariaIcon from '@/assets/icons/png/licencasanitaria-icon.png'
import multasIcon from '@/assets/icons/png/multas-icon.png'
import { SwiperWrapper } from '@/components/ui/custom/swiper-wrapper'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const mostAccessedServices = [
  {
    id: 'iptu',
    href: '/services/category/Taxas/84702/carioca-digital',
    icon: iptuIcon,
    title: 'IPTU',
    description: 'Pague com desconto no PIX',
  },
  {
    id: 'cadrio',
    href: '/services/category/Família/92294/carioca-digital',
    icon: cadrioIcon,
    title: 'CAD Rio',
    description: 'Agende seu atendimento',
  },
  {
    id: 'multas',
    href: '/services/category/Transporte/71536/carioca-digital',
    icon: multasIcon,
    title: 'Multas',
    description: 'Consulta de multas de trânsito',
  },
  {
    id: 'alvara',
    href: '/services/category/Licenças/91037/carioca-digital',
    icon: alvaraIcon,
    title: 'Alvará',
    description: 'Consulta prévia de local',
  },
  {
    id: 'licenca-sanitaria',
    href: '/services/category/Licenças/69823/carioca-digital',
    icon: licencasanitariaIcon,
    title: 'Licença Sani...',
    description: 'Veja ou solicite o documento',
  },
  {
    id: 'cadunico',
    href: '/services/category/Família/10244935327515/1746',
    icon: cadunicoIcon,
    title: 'CadÚnico',
    description: 'Consulte e atualize seus dados',
  },
  {
    id: 'divida-ativa',
    href: '/services/category/Taxas/82000/carioca-digital',
    icon: dividaativaIcon,
    title: 'Dívida ativa',
    description: 'Consulte dívidas de IPTU',
  },
]

export function MostAccessedServiceCardsSwipeSkeleton() {
  return (
    <>
      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2 px-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex gap-2 px-4 w-max">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`mobile-${i}`} className="flex flex-col">
                  <Skeleton className="bg-card rounded-lg p-3.5 flex flex-col items-start justify-between w-[140px] h-[140px] min-w-[140px] max-w-[140px] min-h-[140px] max-h-[140px]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="px-4 pb-4 overflow-x-hidden hidden sm:block">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`service-${i}`} className="flex flex-col">
              <Skeleton className="w-full aspect-square rounded-lg mb-2 h-[140px]" />
            </div>
          ))}
        </div>
        <div className="justify-center items-center h-12 flex">
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-2 h-1.5 rounded-full" />
            <Skeleton className="w-2 h-1.5 rounded-full" />
          </div>
        </div>
      </div>
    </>
  )
}

export function MostAccessedServiceCardsSwipe({
  showMore,
}: { showMore: boolean }) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return <MostAccessedServiceCardsSwipeSkeleton />
  }

  return (
    <div className="px-4 pb-4 overflow-x-clip">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-md font-medium text-foreground">Mais acessados</h2>
        {showMore && (
          <Link
            href="/services"
            className="text-md text-muted-foreground cursor-pointer font-normal"
          >
            Ver mais
          </Link>
        )}
      </div>

      <div className="pb-0">
        <SwiperWrapper showArrows={true} showPagination={true}>
          {Array.from(
            { length: Math.ceil(mostAccessedServices.length / 4) },
            (_, slideIndex) => {
              const startIndex = slideIndex * 4
              const slideServices = mostAccessedServices.slice(
                startIndex,
                startIndex + 4
              )

              return (
                <div
                  key={`slide-${slideIndex}`}
                  className="grid grid-cols-4 gap-2"
                >
                  {slideServices.map(service => (
                    <Link key={service.id} href={service.href}>
                      <div className="bg-card rounded-lg p-3.5 hover:bg-card/50 transition-colors cursor-pointer flex flex-col items-start justify-between w-full max-h-[140px] aspect-square">
                        <div className="mb-4">
                          <img
                            src={service.icon.src}
                            alt={service.title}
                            className="w-10 h-10"
                          />
                        </div>
                        <div>
                          <h3 className="text-base font-medium break-words text-foreground">
                            {service.title}
                          </h3>
                          <p className="text-foreground-light text-xs leading-4 break-words">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            }
          )}
        </SwiperWrapper>
      </div>
    </div>
  )
}
