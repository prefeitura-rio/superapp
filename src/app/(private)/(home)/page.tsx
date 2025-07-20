import {
  getCitizenCpfMaintenanceRequest,
  getCitizenCpfWallet,
} from '@/http/citizen/citizen'
import { fetchCategories } from '@/lib/categories'
import { getHealthUnitInfo, getHealthUnitRisk } from '@/lib/health-unit'
import {
  formatOperatingHours,
  getCurrentOperatingStatus,
  getHealthUnitRiskStatus,
} from '@/lib/health-unit-utils'
import { getUserInfoFromToken } from '@/lib/user-info'
import { FloatNavigation } from '../components/float-navigation'
import HeaderWrapper from '../components/header-wrapper'
import HomeCategoriesGrid from '../components/home-categories-grid'
import MostAccessedServiceCards from '../components/most-accessed-services-cards'
import SuggestionCards from '../components/suggestion-cards'
import CarteiraSection from '../components/wallet-section'

export default async function Home() {
  const userAuthInfo = await getUserInfoFromToken()
  let walletData
  let maintenanceRequests
  let healthUnitData
  let healthUnitRiskData

  if (userAuthInfo.cpf) {
    // Fetch wallet data
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

    // Fetch health unit info and risk if CNES is available
    const cnes = walletData?.saude?.clinica_familia?.id_cnes
    if (cnes) {
      try {
        const [unitResponse, riskResponse] = await Promise.all([
          getHealthUnitInfo(cnes, {
            cache: 'force-cache',
            next: { revalidate: 3600 }, //revalidate every hour
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
          per_page: 100, // Get all requests for counting : TODO: paginate
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

  // healthCardData
  let healthCardData = undefined
  if (walletData?.saude?.clinica_familia) {
    // Use wallet data as primary source, only supplement with API data for specific fields
    const clinicaFamilia = walletData.saude.clinica_familia

    // Only use health unit API for operating hours and current status
    const operatingHours = healthUnitData
      ? formatOperatingHours(
          healthUnitData.funcionamento_dia_util,
          healthUnitData.funcionamento_sabado
        )
      : 'Não informado'

    const statusValue = healthUnitData
      ? getCurrentOperatingStatus(
          healthUnitData.funcionamento_dia_util,
          healthUnitData.funcionamento_sabado
        )
      : 'Não informado'

    // Only use health unit API for risk status
    const riskStatus = healthUnitRiskData
      ? getHealthUnitRiskStatus(healthUnitRiskData)
      : null

    healthCardData = {
      href: '/wallet/health',
      title: 'CLÍNICA DA FAMÍLIA',
      name: clinicaFamilia.nome || 'Nome não disponível',
      statusLabel: 'Status',
      statusValue,
      extraLabel: 'Horário de atendimento',
      extraValue: operatingHours,
      address: clinicaFamilia.endereco || 'Endereço não disponível',
      phone: clinicaFamilia.telefone,
      email: clinicaFamilia.email,
      risco: riskStatus?.risco,
    }
  }

  const categories = await fetchCategories()

  return (
    <main className="flex max-w-md mx-auto flex-col bg-background text-foreground pb-30">
      <HeaderWrapper userName={userAuthInfo.name} />

      {/* Suggestion Cards*/}
      <SuggestionCards order={[1, 0]} />

      {/* Home Categories Grid*/}
      <HomeCategoriesGrid categories={categories} />

      {/* Most Accessed Service Cards*/}
      <MostAccessedServiceCards showMore={true} />

      {/* Carteira section */}
      {walletData && (
        <CarteiraSection
          walletData={walletData}
          maintenanceRequests={maintenanceRequests}
          healthCardData={healthCardData}
        />
      )}
      <FloatNavigation />
    </main>
  )
}
