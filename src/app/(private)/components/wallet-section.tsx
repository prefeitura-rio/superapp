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
import { WalletCaretakerCard } from './wallet-caretaker-card'
import { WalletEducationCard } from './wallet-education-card'
import { WalletHealthCard } from './wallet-health-card'
import { WalletSocialAssistanceCard } from './wallet-social-assistance-card'

interface CartereiraSectionProps {
  walletData?: ModelsCitizenWallet
  maintenanceRequests?: ModelsMaintenanceRequest[]
}

export default function CarteiraSection({
  walletData,
  maintenanceRequests,
}: CartereiraSectionProps) {
  // Calculate maintenance requests statistics
  const maintenanceStats = getMaintenanceRequestStats(maintenanceRequests)

  // Get wallet data info (count and hasData)
  const walletInfo = getWalletDataInfo(walletData, maintenanceStats.total)

  // Calculate dynamic margin-bottom based on wallet count
  const dynamicMarginBottom = `calc(100lvh - (116px + 188px + ${(walletInfo.count - 1) * 80}px))`

  // Track current card index for dynamic positioning
  let cardIndex = 0

  return (
    <section className="px-5 mt-6 ">
      <div className="sticky top-20 flex items-center justify-between mb-4">
        <h2 className="text-md font-medium text-foreground">Carteira</h2>
        {walletInfo.hasData && (
          <Link
            href="/wallet"
            className="text-md text-muted-foreground cursor-pointer font-medium"
          >
            ver tudo
          </Link>
        )}
      </div>

      {walletInfo.hasData ? (
        <div
          className="grid w-full gap-2"
          style={{ marginBottom: dynamicMarginBottom }}
        >
          {walletData?.saude?.clinica_familia?.nome && (
            <div
              className="sticky"
              style={{ top: `${116 + cardIndex++ * 80}px` }}
            >
              <WalletHealthCard
                href="/wallet/health"
                title="CLÍNICA DA FAMÍLIA"
                name={
                  walletData?.saude?.clinica_familia?.nome || 'Não disponível'
                }
                statusLabel="Situação"
                statusValue={getOperatingStatus(
                  walletData?.saude?.clinica_familia?.horario_atendimento
                )}
                extraLabel="Horário de atendimento"
                extraValue={
                  walletData?.saude?.clinica_familia?.horario_atendimento ||
                  'Não informado'
                }
                address={walletData?.saude?.clinica_familia?.endereco}
                phone={walletData?.saude?.clinica_familia?.telefone}
                email={walletData?.saude?.clinica_familia?.email}
              />
            </div>
          )}

          {/* Card 2: Educação */}
          {walletData?.educacao?.escola?.nome && (
            <div
              className="sticky"
              style={{ top: `${116 + cardIndex++ * 80}px` }}
            >
              <WalletEducationCard
                href="/wallet/education"
                title="ESCOLA"
                name={walletData?.educacao?.escola?.nome || 'Não disponível'}
                statusLabel="Status"
                statusValue={getOperatingStatus(
                  walletData?.educacao?.escola?.horario_funcionamento
                )}
                extraLabel="Horário de atendimento"
                extraValue={
                  walletData?.educacao?.escola?.horario_funcionamento ||
                  'Não informado'
                }
                address={walletData?.educacao?.escola?.endereco}
                phone={walletData?.educacao?.escola?.telefone}
                email={walletData?.educacao?.escola?.email}
              />
            </div>
          )}

          {/* Card 3: Assistência social */}
          {walletData?.assistencia_social?.cras?.nome && (
            <div
              className="sticky"
              style={{ top: `${116 + cardIndex++ * 80}px` }}
            >
              <WalletSocialAssistanceCard
                href="/wallet/social-assistance"
                title="CADÚNICO"
                name={
                  walletData?.assistencia_social?.cras?.nome || 'Não disponível'
                }
                statusLabel="Situação"
                statusValue={getCadUnicoStatus(
                  walletData?.assistencia_social?.cadunico
                )}
                extraLabel="Data de recadastramento"
                extraValue={formatRecadastramentoDate(
                  walletData?.assistencia_social?.cadunico
                    ?.data_limite_cadastro_atual
                )}
                crasName={walletData?.assistencia_social?.cras?.nome}
                address={walletData?.assistencia_social?.cras?.endereco}
                phone={walletData?.assistencia_social?.cras?.telefone}
              />
            </div>
          )}

          {/* Card 4: Cuidados com a Cidade (1746) */}
          {maintenanceStats.total > 0 && (
            <div
              className="sticky"
              style={{ top: `${116 + cardIndex++ * 80}px` }}
            >
              <WalletCaretakerCard
                href="/wallet/caretaker"
                title="CUIDADOS COM A CIDADE"
                name={formatMaintenanceRequestsCount(maintenanceStats.aberto)}
                statusLabel="Total de chamados"
                statusValue={maintenanceStats.total.toString()}
                extraLabel="Fechados"
                extraValue={maintenanceStats.fechados.toString()}
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
