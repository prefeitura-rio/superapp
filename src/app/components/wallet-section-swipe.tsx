'use client'

import { Skeleton } from '@/components/ui/skeleton'
import type {
  ModelsCitizenWallet,
  ModelsMaintenanceRequest,
} from '@/http/models'
import {
  formatRecadastramentoDate,
  getCadUnicoStatus,
} from '@/lib/cadunico-utils'
import {
  formatMaintenanceRequestsCount,
  getMaintenanceRequestStats,
} from '@/lib/maintenance-requests-utils'
import {
  formatEducationOperatingHours,
  getOperatingStatus,
} from '@/lib/operating-status'
import { getWalletDataInfo } from '@/lib/wallet-utils'
import type { RiskStatusProps } from '@/types/health'
import Link from 'next/link'
import type { JSX } from 'react'
import { useEffect, useState } from 'react'
import 'swiper/css'
import 'swiper/css/pagination'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { CaretakerCard } from './wallet-cards/caretaker-card'
import { EducationCard } from './wallet-cards/education-card'
import { HealthCard } from './wallet-cards/health-card'
import { SocialAssistanceCard } from './wallet-cards/social-assistance-card'

interface CartereiraSectionSwipeProps {
  walletData?: ModelsCitizenWallet
  maintenanceRequests?: ModelsMaintenanceRequest[]
  healthCardData?: {
    href: string
    title: string
    name?: string
    statusLabel: string
    statusValue: string
    extraLabel: string
    extraValue: string
    address?: string
    phone?: string
    email?: string
    risco?: RiskStatusProps
  }
}

export function CarteiraSectionSwipeSkeleton() {
  return (
    <section className="mt-4 w-full overflow-x-auto sm:mt-0">
      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-center px-4 justify-between mb-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
          <div className="flex px-4 gap-2 w-max">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`wallet-card-mobile-${i}`} className="min-w-[300px]">
                <Skeleton className="w-[310px] h-[188px] rounded-3xl" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:block">
        <div className="flex items-center px-4 justify-between mb-4">
          <Skeleton className="h-5 w-16 rounded-3xl" />
          <Skeleton className="h-5 w-20 rounded-3xl" />
        </div>
        <div className="px-4 pb-2">
          <div className="grid grid-cols-2 gap-2 mb-0">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={`wallet-card-desktop-${i}`} className="w-full">
                <Skeleton className="w-full h-[188px] rounded-3xl" />
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
      </div>
    </section>
  )
}

export default function CarteiraSectionSwipe({
  walletData,
  maintenanceRequests,
  healthCardData,
}: CartereiraSectionSwipeProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  // Calculate maintenance requests statistics
  const maintenanceStats = getMaintenanceRequestStats(maintenanceRequests)

  // Get wallet data info (count and hasData)
  const walletInfo = getWalletDataInfo(walletData, maintenanceStats.total)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return <CarteiraSectionSwipeSkeleton />
  }

  // Prepare wallet cards array
  const walletCards: JSX.Element[] = []

  if (walletData?.saude?.clinica_familia) {
    walletCards.push(
      <HealthCard
        key="health"
        href="/wallet/health"
        title="CLÍNICA DA FAMÍLIA"
        name={walletData.saude.clinica_familia.nome || 'Nome não disponível'}
        primaryLabel="Status"
        primaryValue={healthCardData?.statusValue || 'Não informado'}
        secondaryLabel="Horário de Atendimento"
        secondaryValue={healthCardData?.extraValue || 'Não informado'}
        address={walletData.saude.clinica_familia.endereco}
        phone={walletData.saude.clinica_familia.telefone}
        email={walletData.saude.clinica_familia.email}
        riskStatus={healthCardData?.risco}
        enableFlip={false}
        showInitialShine={false}
        asLink
      />
    )
  }

  if (walletData?.educacao?.escola?.nome) {
    walletCards.push(
      <EducationCard
        key="education"
        href="/wallet/education"
        title="ESCOLA"
        name={walletData?.educacao?.escola?.nome || 'Não disponível'}
        primaryLabel="Status"
        primaryValue={getOperatingStatus(
          walletData?.educacao?.escola?.horario_funcionamento
        )}
        secondaryLabel="Horário de Atendimento"
        secondaryValue={formatEducationOperatingHours(
          walletData?.educacao?.escola?.horario_funcionamento
        )}
        address={walletData?.educacao?.escola?.endereco}
        phone={walletData?.educacao?.escola?.telefone}
        email={walletData?.educacao?.escola?.email}
        enableFlip={false}
        showInitialShine={false}
        asLink
      />
    )
  }

  if (walletData?.assistencia_social?.cras?.nome) {
    walletCards.push(
      <SocialAssistanceCard
        key="social"
        href="/wallet/social-assistance"
        title="CADÚNICO"
        number={walletData?.assistencia_social?.cras?.nome || 'Não disponível'}
        badgeStatus={getCadUnicoStatus(
          walletData?.assistencia_social?.cadunico
        )}
        primaryLabel="Data de recadastramento"
        primaryValue={formatRecadastramentoDate(
          walletData?.assistencia_social?.cadunico?.data_limite_cadastro_atual
        )}
        unitName={walletData?.assistencia_social?.cras?.nome}
        address={walletData?.assistencia_social?.cras?.endereco}
        phone={walletData?.assistencia_social?.cras?.telefone}
        showInitialShine={false}
        enableFlip={false}
        asLink
      />
    )
  }

  if (maintenanceStats.total > 0) {
    walletCards.push(
      <CaretakerCard
        key="caretaker"
        href="/wallet/caretaker"
        title="CUIDADOS COM A CIDADE"
        name={formatMaintenanceRequestsCount(maintenanceStats.aberto)}
        primaryLabel="Total de chamados"
        primaryValue={maintenanceStats.total.toString()}
        secondaryLabel="Fechados"
        secondaryValue={maintenanceStats.fechados.toString()}
        enableFlip={false}
        showInitialShine={false}
        asLink
      />
    )
  }

  return (
    <section className="mt-6 w-full overflow-x-auto">
      <div className="flex items-center px-4 justify-between mb-4">
        <h2 className="text-md font-medium text-foreground">Carteira</h2>
        {walletInfo.hasData && (
          <Link
            href="/wallet"
            className="text-md text-muted-foreground cursor-pointer font-normal"
          >
            Ver mais
          </Link>
        )}
      </div>

      {walletInfo.hasData ? (
        <>
          <div className="hidden sm:block px-4 pb-4">
            <Swiper
              slidesPerView={1}
              slidesPerGroup={1}
              spaceBetween={8}
              pagination={{
                clickable: true,
              }}
              modules={[Pagination]}
              className="carteira-swiper"
            >
              {Array.from(
                { length: Math.ceil(walletCards.length / 2) },
                (_, slideIndex) => {
                  const startIndex = slideIndex * 2
                  const slideCards = walletCards.slice(
                    startIndex,
                    startIndex + 2
                  )

                  return (
                    <SwiperSlide key={`slide-${slideIndex}`}>
                      <div className="grid grid-cols-2 gap-2">
                        {slideCards.map((card, cardIndex) => (
                          <div
                            key={`card-${startIndex + cardIndex}`}
                            className="w-full"
                          >
                            {card}
                          </div>
                        ))}
                      </div>
                    </SwiperSlide>
                  )
                }
              )}
            </Swiper>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center py-6">
          <p className="text-muted-foreground text-center">
            No momento sua carteira está vazia.
          </p>
        </div>
      )}

      <style jsx global>{`
        .swiper-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
          height: 10px;
        }
        .carteira-swiper .swiper-pagination {
          position: relative !important;
          bottom: auto !important;
          margin-top: 1rem !important;
        }
        .swiper-pagination-bullet { 
          background: var(--terciary);
          height: 6px;
          width: 6px;
          opacity: 1;
          margin: 0 !important;
        }
        .swiper-pagination-bullet-active {
          background: var(--foreground);
        }
      `}</style>
    </section>
  )
}
