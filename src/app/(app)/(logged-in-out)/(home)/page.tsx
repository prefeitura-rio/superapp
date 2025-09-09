import { FloatNavigation } from '@/app/components/float-navigation'
import HeaderWrapper from '@/app/components/header-wrapper'
import HomeCategoriesGrid from '@/app/components/home-categories-grid'
import {
  MostAccessedServiceCardsSwipe,
  MostAccessedServiceCardsSwipeSkeleton,
} from '@/app/components/most-accessed-services-card-swipe'
import MostAccessedServiceCards from '@/app/components/most-accessed-services-cards'
import SuggestionCards from '@/app/components/suggestion-cards'
import {
  SuggestionCardsSwipe,
  SuggestionCardsSwipeSkeleton,
} from '@/app/components/suggestion-cards-swipe'
import CarteiraSection from '@/app/components/wallet-section'
import CarteiraSectionSwipe, {
  CarteiraSectionSwipeSkeleton,
} from '@/app/components/wallet-section-swipe'
import { ResponsiveWrapper } from '@/components/ui/custom/responsive-wrapper'
import { aditionalCategoriesFull } from '@/constants/aditional-services'
import { fetchCategories } from '@/lib/categories'
import {
  getDalCitizenCpf,
  getDalCitizenCpfAvatar,
  getDalCitizenCpfMaintenanceRequest,
  getDalCitizenCpfWallet,
  getDalHealthUnitInfo,
  getDalHealthUnitRisk,
} from '@/lib/dal'
import { getHealthUnitRiskStatus } from '@/lib/health-unit-utils'
import { getMaintenanceRequestStats } from '@/lib/maintenance-requests-utils'
import {
  formatHealthOperatingHours,
  getHealthOperatingStatus,
} from '@/lib/operating-status'
import { getUserInfoFromToken } from '@/lib/user-info'
import { formatUserName, getDisplayName } from '@/lib/utils'
import { getWalletDataInfo } from '@/lib/wallet-utils'

export default async function Home() {
  const userAuthInfo = await getUserInfoFromToken()
  const isLoggedIn = !!(userAuthInfo.cpf && userAuthInfo.name)
  let walletData
  let maintenanceRequests
  let healthUnitData
  let healthUnitRiskData
  let userAvatarUrl: string | null = null
  let userAvatarName: string | null = null
  let userDisplayName = ''

  if (isLoggedIn) {
    // Buscar dados completos do usuário para obter nome_exibicao
    try {
      const userDataResponse = await getDalCitizenCpf(userAuthInfo.cpf)
      if (userDataResponse.status === 200) {
        const userData = userDataResponse.data
        userDisplayName = getDisplayName(
          userData.nome_exibicao,
          userAuthInfo.name
        )
      } else {
        userDisplayName = formatUserName(userAuthInfo.name)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      userDisplayName = formatUserName(userAuthInfo.name)
    }

    // Fetch user's current avatar using DAL
    try {
      const userAvatarResponse = await getDalCitizenCpfAvatar(userAuthInfo.cpf)
      if (userAvatarResponse.status === 200 && userAvatarResponse.data.avatar) {
        userAvatarUrl = userAvatarResponse.data.avatar.url || null
        userAvatarName = userAvatarResponse.data.avatar.name || null
      }
    } catch (error) {
      console.log('Could not fetch user avatar:', error)
    }

    // Fetch wallet data
    try {
      const walletResponse = await getDalCitizenCpfWallet(userAuthInfo.cpf)
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
          getDalHealthUnitInfo(cnes),
          getDalHealthUnitRisk(cnes),
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
      const maintenanceResponse = await getDalCitizenCpfMaintenanceRequest(
        userAuthInfo.cpf,
        {
          page: 1,
          per_page: 100, // Get all requests for counting : TODO: paginate
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

  // healthCardData - only create if clinica_familia exists and indicador is true
  let healthCardData = undefined
  if (
    walletData?.saude?.clinica_familia &&
    walletData?.saude?.clinica_familia?.indicador === true
  ) {
    // Use wallet data as primary source, only supplement with API data for specific fields
    const clinicaFamilia = walletData.saude.clinica_familia

    // Only use health unit API for operating hours and current status
    const operatingHours = healthUnitData
      ? formatHealthOperatingHours(healthUnitData.funcionamento_dia_util)
      : 'Não informado'

    const statusValue = healthUnitData
      ? getHealthOperatingStatus(healthUnitData.funcionamento_dia_util)
      : 'Não informado'

    // Only use health unit API for risk status
    const riskStatus = healthUnitRiskData
      ? getHealthUnitRiskStatus(healthUnitRiskData)
      : null

    healthCardData = {
      href: '/carteira/clinica-da-familia',
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
  const categoriesSlice = categories.slice(0, -3)
  const allCategories = [...categoriesSlice, ...aditionalCategoriesFull]

  // Calculate maintenance requests statistics
  const maintenanceStats = getMaintenanceRequestStats(maintenanceRequests)

  // Get wallet data info (count and hasData)
  const walletInfo = getWalletDataInfo(walletData, maintenanceStats.total)

  // Check if wallet section should be displayed
  const shouldShowWallet = isLoggedIn && walletInfo.hasData

  return (
    <main className="flex w-full mx-auto max-w-4xl flex-col bg-background text-foreground pb-30">
      <HeaderWrapper
        userName={userDisplayName || userAuthInfo.name}
        isLoggedIn={isLoggedIn}
        userAvatarUrl={userAvatarUrl}
        userAvatarName={userAvatarName}
      />

      {/* Suggestion Cards*/}
      <ResponsiveWrapper
        mobileComponent={<SuggestionCards isLoggedIn={isLoggedIn} />}
        desktopComponent={<SuggestionCardsSwipe isLoggedIn={isLoggedIn} />}
        desktopSkeletonComponent={<SuggestionCardsSwipeSkeleton />}
      />

      {/* Home Categories Grid*/}
      <HomeCategoriesGrid categories={allCategories} />

      {/* Most Accessed Service Cards*/}
      <ResponsiveWrapper
        mobileComponent={<MostAccessedServiceCards />}
        desktopComponent={<MostAccessedServiceCardsSwipe />}
        desktopSkeletonComponent={<MostAccessedServiceCardsSwipeSkeleton />}
      />

      {/* Carteira section - only show for authenticated users with actual data */}
      {shouldShowWallet && (
        <ResponsiveWrapper
          mobileComponent={
            <CarteiraSection
              walletData={walletData}
              maintenanceRequests={maintenanceRequests}
              healthCardData={healthCardData}
            />
          }
          desktopComponent={
            <CarteiraSectionSwipe
              walletData={walletData}
              maintenanceRequests={maintenanceRequests}
              healthCardData={healthCardData}
            />
          }
          desktopSkeletonComponent={<CarteiraSectionSwipeSkeleton />}
        />
      )}
      <FloatNavigation />
    </main>
  )
}
