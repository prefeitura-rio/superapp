import {
  getCitizenCpfMaintenanceRequest,
  getCitizenCpfWallet,
} from '@/http/citizen/citizen'
import {
  formatRecadastramentoDate,
  getCadUnicoStatus,
} from '@/lib/cadunico-utils'
import { getHealthUnitInfo, getHealthUnitRisk } from '@/lib/health-unit'
import {
  formatAddress,
  formatOperatingHours,
  getCurrentOperatingStatus,
  getHealthUnitRiskStatus,
  getPrimaryPhone,
} from '@/lib/health-unit-utils'
import {
  formatMaintenanceRequestsCount,
  getMaintenanceRequestStats,
} from '@/lib/maintenance-requests-utils'
import { getOperatingStatus } from '@/lib/operating-status'
import { getUserInfoFromToken } from '@/lib/user-info'
import { getWalletDataInfo } from '@/lib/wallet-utils'
import { FloatNavigation } from '../../components/float-navigation'
import { SearchButton } from '../../components/search-button'
import { WalletCaretakerCard } from '../../components/wallet-caretaker-card'
import { WalletEducationCard } from '../../components/wallet-education-card'
import { WalletHealthCard } from '../../components/wallet-health-card'
import { WalletSocialAssistanceCard } from '../../components/wallet-social-assistance-card'

export default async function Wallet() {
  const userAuthInfo = await getUserInfoFromToken()
  let walletData
  let maintenanceRequests
  let healthUnitData
  let healthUnitRiskData

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

    // Fetch health unit data if CNES is available
    const cnes = walletData?.saude?.clinica_familia?.id_cnes
    if (cnes) {
      try {
        const [unitResponse, riskResponse] = await Promise.all([
          getHealthUnitInfo(cnes, {
            cache: 'force-cache',
            next: { revalidate: 3600 },
          }),
          getHealthUnitRisk(cnes),
        ])

        if (unitResponse.status === 200) {
          healthUnitData = unitResponse.data
        } else {
          console.error('Failed to fetch health unit data:', unitResponse.data)
        }

        if (riskResponse.status === 200) {
          healthUnitRiskData = riskResponse.data
        } else {
          console.error(
            'Failed to fetch health unit risk data:',
            riskResponse.data
          )
        }
      } catch (error) {
        console.error('Error fetching health unit data:', error)
      }
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

  // Get wallet data info (count and hasData)
  const walletInfo = getWalletDataInfo(walletData, maintenanceStats.total)

  // Calculate dynamic margin-bottom based on wallet count
  const dynamicMarginBottom = `calc(100lvh - (80px + 188px + ${(walletInfo.count - 1) * 80}px))`

  // Track current card index for dynamic positioning
  let cardIndex = 0

  // Prepare health card data
  const hasHealthData =
    healthUnitData || walletData?.saude?.clinica_familia?.nome

  // Get risk status data
  const riskStatus =
    healthUnitData && healthUnitRiskData
      ? getHealthUnitRiskStatus(healthUnitRiskData)
      : null

  const healthName =
    healthUnitData?.nome ||
    walletData?.saude?.clinica_familia?.nome ||
    'Não disponível'

  // Status value should be "Aberto" or "Fechado" based on operating hours
  const healthStatusValue = healthUnitData
    ? getCurrentOperatingStatus(
        healthUnitData.funcionamento_dia_util,
        healthUnitData.funcionamento_sabado
      )
    : getOperatingStatus(
        walletData?.saude?.clinica_familia?.horario_atendimento
      )

  const healthOperatingHours = healthUnitData
    ? formatOperatingHours(
        healthUnitData.funcionamento_dia_util,
        healthUnitData.funcionamento_sabado
      )
    : walletData?.saude?.clinica_familia?.horario_atendimento || 'Não informado'
  const healthAddress = healthUnitData
    ? formatAddress(healthUnitData)
    : walletData?.saude?.clinica_familia?.endereco
  const healthPhone = healthUnitData
    ? getPrimaryPhone(healthUnitData) || undefined
    : walletData?.saude?.clinica_familia?.telefone
  const healthEmail = walletData?.saude?.clinica_familia?.email

  return (
    <>
      {/* <MainHeader /> */}
      <main className="max-w-md mx-auto text-white">
        <section className="px-4 relative h-full ">
          <div className="flex items-center justify-between pt-6 pb-6">
            <h2 className="sticky top-6 text-2xl font-bold bg-background z-10 text-foreground">
              Carteira
            </h2>

            <SearchButton />
          </div>

          {walletInfo.hasData ? (
            <div
              className="grid w-full gap-2 pt-6"
              style={{ marginBottom: dynamicMarginBottom }}
            >
              {hasHealthData && (
                <div
                  className="sticky"
                  style={{ top: `${80 + cardIndex++ * 80}px` }}
                >
                  <WalletHealthCard
                    href="/wallet/health"
                    title="CLÍNICA DA FAMÍLIA"
                    name={healthName}
                    statusLabel="Status"
                    statusValue={healthStatusValue}
                    extraLabel="Horário de atendimento"
                    extraValue={healthOperatingHours}
                    address={healthAddress}
                    phone={healthPhone}
                    email={healthEmail}
                    risco={riskStatus?.risco}
                  />
                </div>
              )}

              {/* Card 2: Educação */}
              {walletData?.educacao?.escola?.nome && (
                <div
                  className="sticky"
                  style={{ top: `${80 + cardIndex++ * 80}px` }}
                >
                  <WalletEducationCard
                    href="/wallet/education"
                    title="ESCOLA"
                    name={
                      walletData?.educacao?.escola?.nome || 'Não disponível'
                    }
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
              )}

              {/* Card 3: Assistência social */}
              {walletData?.assistencia_social?.cras?.nome && (
                <div
                  className="sticky"
                  style={{ top: `${80 + cardIndex++ * 80}px` }}
                >
                  <WalletSocialAssistanceCard
                    href="/wallet/social-assistance"
                    title="CADÚNICO"
                    name={
                      walletData?.assistencia_social?.cras?.nome ||
                      'Não disponível'
                    }
                    statusLabel="Status"
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
                  style={{ top: `${80 + cardIndex++ * 80}px` }}
                >
                  <WalletCaretakerCard
                    href="/wallet/caretaker"
                    title="CUIDADOS COM A CIDADE"
                    name={formatMaintenanceRequestsCount(
                      maintenanceStats.aberto
                    )}
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
        <FloatNavigation />
      </main>
    </>
  )
}
