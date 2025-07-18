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
import { getOperatingStatus } from '@/lib/operating-status'
import { getWalletDataInfo } from '@/lib/wallet-utils'
import Link from 'next/link'
import { CaretakerCard } from './wallet-cards/caretaker-card'
import { EducationCard } from './wallet-cards/education-card'
import { SocialAssistanceCard } from './wallet-cards/social-assistance-card'
import { WealthCard } from './wallet-cards/wealth-card'

interface CartereiraSectionProps {
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
    risco?: string
  }
}

export default function CarteiraSection({
  walletData,
  maintenanceRequests,
  healthCardData,
}: CartereiraSectionProps) {
  // Calculate maintenance requests statistics
  const maintenanceStats = getMaintenanceRequestStats(maintenanceRequests)

  // Get wallet data info (count and hasData)
  const walletInfo = getWalletDataInfo(walletData, maintenanceStats.total)

  // Calculate dynamic margin-bottom based on wallet count
  const dynamicMarginBottom = `calc(100lvh - (116px + 188px + ${(walletInfo.count - 1) * 80}px)`

  // Track current card index for dynamic positioning
  let cardIndex = 0

  return (
    <section className="px-4 mt-6 ">
      <div className="sticky top-20 flex items-center justify-between mb-4">
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
        <div
          className="grid w-full gap-2"
          style={{ marginBottom: dynamicMarginBottom }}
        >
          {(healthCardData || walletData?.saude?.clinica_familia?.nome) && (
            <div
              className="sticky"
              style={{ top: `${116 + cardIndex++ * 80}px` }}
            >
              <WealthCard
                href="/wallet/health"
                title="SAÚDE"
                name={
                  walletData?.saude?.clinica_familia?.nome || 'Não disponível'
                }
                primaryLabel="Status"
                primaryValue={getOperatingStatus(
                  walletData?.saude?.clinica_familia?.horario_atendimento
                )}
                secondaryLabel="Horário de Atendimento"
                secondaryValue={
                  walletData?.saude?.clinica_familia?.horario_atendimento ||
                  'Não informado'
                }
                address={walletData?.saude?.clinica_familia?.endereco}
                phone={walletData?.saude?.clinica_familia?.telefone}
                email={walletData?.saude?.clinica_familia?.email}
                enableFlip={false}
                showInitialShine={false}
                asLink
              />
            </div>
          )}

          {/* Card 2: Educação */}
          {walletData?.educacao?.escola?.nome && (
            <div
              className="sticky"
              style={{ top: `${116 + cardIndex++ * 80}px` }}
            >
              <EducationCard
                href="/wallet/education"
                title="ESCOLA"
                name={walletData?.educacao?.escola?.nome || 'Não disponível'}
                primaryLabel="Status"
                primaryValue={getOperatingStatus(
                  walletData?.educacao?.escola?.horario_funcionamento
                )}
                secondaryLabel="Horário de Atendimento"
                secondaryValue={
                  walletData?.educacao?.escola?.horario_funcionamento ||
                  'Não informado'
                }
                address={walletData?.educacao?.escola?.endereco}
                phone={walletData?.educacao?.escola?.telefone}
                email={walletData?.educacao?.escola?.email}
                enableFlip={false}
                showInitialShine={false}
                asLink
              />
            </div>
          )}

          {/* Card 3: Assistência social */}
          {walletData?.assistencia_social?.cras?.nome && (
            <div
              className="sticky"
              style={{ top: `${116 + cardIndex++ * 80}px` }}
            >
              <SocialAssistanceCard
                href="/wallet/social-assistance"
                title="CADÚNICO"
                number={
                  walletData?.assistencia_social?.cras?.nome || 'Não disponível'
                }
                badgeStatus={getCadUnicoStatus(
                  walletData?.assistencia_social?.cadunico
                )}
                primaryLabel="Data de recadastramento"
                primaryValue={formatRecadastramentoDate(
                  walletData?.assistencia_social?.cadunico
                    ?.data_limite_cadastro_atual
                )}
                unitName={walletData?.assistencia_social?.cras?.nome}
                address={walletData?.assistencia_social?.cras?.endereco}
                phone={walletData?.assistencia_social?.cras?.telefone}
                showInitialShine={false}
                enableFlip={false}
                asLink
              />
            </div>
          )}

          {/* Card 4: Cuidados com a Cidade (1746) */}
          {maintenanceStats.total > 0 && (
            <div
              className="sticky"
              style={{ top: `${116 + cardIndex++ * 80}px` }}
            >
              <CaretakerCard
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
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-6">
          <p className="text-muted-foreground text-center">
            No momento sua carteira está vazia.
          </p>
        </div>
      )}
    </section>
  )
}
