import type {
  ModelsCitizenWallet,
  ModelsMaintenanceRequest,
} from '@/http/models'
import {
  formatRecadastramentoDate,
  getCadUnicoStatus,
} from '@/lib/cadunico-utils'
import { getOperatingStatus } from '@/lib/clinic-operating-status'
import {
  formatMaintenanceRequestsCount,
  getMaintenanceRequestStats,
} from '@/lib/maintenance-requests-utils'
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

  return (
    <section className="px-5 mt-6 pb-24">
      <div className="sticky top-20 flex items-center justify-between mb-4">
        <h2 className="text-md font-medium text-foreground">Carteira</h2>
        <Link
          href="/wallet"
          className="text-md text-muted-foreground cursor-pointer font-medium"
        >
          ver tudo
        </Link>
      </div>

      <div className="grid w-full gap-3">
        <div className="sticky top-30">
          <WalletHealthCard
            href="/wallet/health"
            title="CLÍNICA DA FAMÍLIA"
            name={walletData?.saude?.clinica_familia?.nome || 'Não disponível'}
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

        {/* Card 2: Educação */}
        <div className="sticky top-30">
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

        {/* Card 3: Assistência social */}
        <div className="sticky top-30">
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

        {/* Card 4: Cuidados com a Cidade (1746) */}
        <div className="sticky top-30">
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
      </div>
    </section>
  )
}
