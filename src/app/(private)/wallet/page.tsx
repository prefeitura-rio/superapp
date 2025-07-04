import {
  getCitizenCpfMaintenanceRequest,
  getCitizenCpfWallet,
} from '@/http/citizen/citizen'
import {
  formatRecadastramentoDate,
  getCadUnicoStatus,
} from '@/lib/cadunico-utils'
import { getOperatingStatus } from '@/lib/clinic-operating-status'
import { getMaintenanceRequestStats } from '@/lib/maintenance-requests-utils'
import { getUserInfoFromToken } from '@/lib/user-info'
import { FloatNavigation } from '../components/float-navigation'
import MainHeader from '../components/main-header'
import { WalletCaretakerCard } from '../components/wallet-caretaker-card'
import { WalletEducationCard } from '../components/wallet-education-card'
import { WalletHealthCard } from '../components/wallet-health-card'
import { WalletSocialAssistanceCard } from '../components/wallet-social-assistance-card'

export default async function Wallet() {
  const userAuthInfo = await getUserInfoFromToken()
  let walletData
  let maintenanceRequests

  if (userAuthInfo.cpf) {
    try {
      const walletResponse = await getCitizenCpfWallet(userAuthInfo.cpf, {
        cache: 'force-cache',
      })
      if (walletResponse.status === 200) {
        walletData = walletResponse.data
      } else {
        console.error(
          'Failed to fetch wallet data status:',
          walletResponse.data
        )
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error)
    }

    // Fetch maintenance requests data
    try {
      const maintenanceResponse = await getCitizenCpfMaintenanceRequest(
        userAuthInfo.cpf,
        {
          page: 1,
          per_page: 100, // Get all requests: TODO: paginate
        },
        {
          cache: 'force-cache',
        }
      )
      if (maintenanceResponse.status === 200) {
        maintenanceRequests = maintenanceResponse.data.data
      } else {
        console.error(
          'Failed to fetch maintenance requests status:',
          maintenanceResponse.data
        )
      }
    } catch (error) {
      console.error('Error fetching maintenance requests:', error)
    }
  }

  // Calculate maintenance requests statistics
  const maintenanceStats = getMaintenanceRequestStats(maintenanceRequests)

  return (
    <>
      <MainHeader />
      <main className="max-w-md mx-auto pt-15 text-white">
        <section className="px-5 relative h-full pb-24">
          <h2 className="sticky top-16 text-2xl font-bold mb-6 bg-background z-10 pt-5 text-foreground">
            Carteira
          </h2>

          <div className="grid w-full gap-3">
            <div className="sticky top-34">
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

            {/* Card 2: Educação */}
            <div className="sticky top-34">
              <WalletEducationCard
                href="/wallet/education"
                title="ESCOLA"
                name={walletData?.educacao?.escola?.nome || 'Não disponível'}
                statusLabel="Status"
                statusValue={getOperatingStatus(
                  walletData?.educacao?.escola?.horario_funcionamento
                )}
                extraLabel="Horário de Atendimento"
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
            <div className="sticky top-34">
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
            <div className="sticky top-34">
              <WalletCaretakerCard
                href="/wallet/caretaker"
                title="CUIDADOS COM A CIDADE"
                name={`${maintenanceStats.aberto} chamados em aberto`}
                statusLabel="Total de chamados"
                statusValue={maintenanceStats.total.toString()}
                extraLabel="Fechados"
                extraValue={maintenanceStats.fechados.toString()}
              />
            </div>
          </div>
        </section>
        <FloatNavigation />
      </main>
    </>
  )
}
