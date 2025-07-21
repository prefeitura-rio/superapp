import { FloatNavigation } from '@/app/components/float-navigation'
import { SearchButton } from '@/app/components/search-button'
import { CaretakerCard } from '@/app/components/wallet-cards/caretaker-card'
import { EducationCard } from '@/app/components/wallet-cards/education-card'
import { HealthCard } from '@/app/components/wallet-cards/health-card'
import { SocialAssistanceCard } from '@/app/components/wallet-cards/social-assistance-card'
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
  formatOperatingHours,
  getCurrentOperatingStatus,
  getHealthUnitRiskStatus,
} from '@/lib/health-unit-utils'
import {
  formatMaintenanceRequestsCount,
  getMaintenanceRequestStats,
} from '@/lib/maintenance-requests-utils'
import {
  formatEducationOperatingHours,
  getOperatingStatus,
} from '@/lib/operating-status'
import { getUserInfoFromToken } from '@/lib/user-info'
import { getWalletDataInfo } from '@/lib/wallet-utils'

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

  // Prepare health card data - only use wallet data as source of truth
  const hasHealthData = walletData?.saude?.clinica_familia

  // Only use health unit API for operating hours and risk status
  let healthStatusValue = 'Não informado'
  let healthOperatingHours = 'Não informado'
  let riskStatus = null

  if (healthUnitData) {
    healthStatusValue = getCurrentOperatingStatus(
      healthUnitData.funcionamento_dia_util,
      healthUnitData.funcionamento_sabado
    )
    healthOperatingHours = formatOperatingHours(
      healthUnitData.funcionamento_dia_util,
      healthUnitData.funcionamento_sabado
    )
  }

  if (healthUnitRiskData) {
    riskStatus = getHealthUnitRiskStatus(healthUnitRiskData)
  }

  return (
    <>
      {/* <MainHeader /> */}
      <main className="pb-30 max-w-md mx-auto text-white">
        <section className="px-4 relative h-full ">
          <div className="flex items-start justify-between pt-6 pb-6">
            <h2 className="relative text-2xl font-bold bg-background z-10 text-foreground">
              Carteira
            </h2>

            <SearchButton />
          </div>

          {walletInfo.hasData ? (
            <div className="grid w-full gap-2">
              {/* Health Card - only show if wallet has health data */}
              {hasHealthData && (
                <div>
                  <HealthCard
                    title="CLÍNICA DA FAMÍLIA"
                    name={
                      walletData!.saude!.clinica_familia!.nome ||
                      'Nome não disponível'
                    }
                    primaryLabel="Status"
                    primaryValue={healthStatusValue}
                    secondaryLabel="Horário de Atendimento"
                    secondaryValue={healthOperatingHours}
                    address={walletData!.saude!.clinica_familia!.endereco}
                    phone={walletData!.saude!.clinica_familia!.telefone}
                    email={walletData!.saude!.clinica_familia!.email}
                    enableFlip={false}
                    asLink
                    href="/wallet/health"
                    showInitialShine={false}
                  />
                </div>
              )}

              {/* Card 2: Educação */}
              {walletData?.educacao?.escola?.nome && (
                <div>
                  <EducationCard
                    title="ESCOLA"
                    name={
                      walletData?.educacao?.escola?.nome || 'Não disponível'
                    }
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
                    asLink
                    enableFlip={false}
                    href="/wallet/education"
                    showInitialShine={false}
                  />
                </div>
              )}

              {/* Card 3: Assistência social */}
              {walletData?.assistencia_social?.cras?.nome && (
                <div>
                  <SocialAssistanceCard
                    title="CADÚNICO"
                    number={
                      walletData?.assistencia_social?.cras?.nome ||
                      'Não disponível'
                    }
                    primaryLabel="Data de recadastramento"
                    primaryValue={formatRecadastramentoDate(
                      walletData?.assistencia_social?.cadunico
                        ?.data_limite_cadastro_atual
                    )}
                    badgeStatus={getCadUnicoStatus(
                      walletData?.assistencia_social?.cadunico
                    )}
                    unitName={walletData?.assistencia_social?.cras?.nome}
                    address={walletData?.assistencia_social?.cras?.endereco}
                    phone={walletData?.assistencia_social?.cras?.telefone}
                    asLink
                    enableFlip={false}
                    href="/wallet/social-assistance"
                    showInitialShine={false}
                  />
                </div>
              )}

              {/* Card 4: Cuidados com a Cidade (1746) */}
              {maintenanceStats.total > 0 && (
                <div>
                  <CaretakerCard
                    title="CUIDADOS COM A CIDADE"
                    name={formatMaintenanceRequestsCount(
                      maintenanceStats.aberto
                    )}
                    primaryLabel="Total de chamados"
                    primaryValue={maintenanceStats.total.toString()}
                    secondaryLabel="Fechados"
                    secondaryValue={maintenanceStats.fechados.toString()}
                    showInitialShine={false}
                    enableFlip={false}
                    asLink
                    href="/wallet/caretaker"
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
