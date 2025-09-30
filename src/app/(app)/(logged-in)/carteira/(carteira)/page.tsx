import EmptyWallet from '@/app/components/empty-wallet'
import { FloatNavigation } from '@/app/components/float-navigation'
import PetsCardsDetail from '@/app/components/pets-cards'
import { SearchButton } from '@/app/components/search-button'
import { WalletCardsWrapper } from '@/app/components/wallet-cards-wrapper'
import { WalletTabs } from '@/app/components/wallet-tabs'
import {
  getDalCitizenCpfMaintenanceRequest,
  getDalCitizenCpfWallet,
  getDalHealthUnitInfo,
  getDalHealthUnitRisk,
} from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { getWalletDataInfo } from '@/lib/wallet-utils'

export default async function Wallet({
  searchParams,
}: {
  searchParams: { pets?: string }
}) {
  const userAuthInfo = await getUserInfoFromToken()
  const petParams = await searchParams
  const isPetsView = petParams.pets === 'true'

  if (isPetsView) {
    return (
      <main className="max-w-xl mx-auto text-white">
        <section className="pb-30 px-4 relative h-full">
          <div className="flex items-start justify-between pt-6 pb-4">
            <h2 className="relative text-2xl font-bold bg-background z-10 text-foreground">
              Carteira
            </h2>
            <SearchButton />
          </div>

          <WalletTabs activeTab="pets" />

          <div className="mt-6">
            <PetsCardsDetail />
          </div>
        </section>
        <FloatNavigation />
      </main>
    )
  }

  let walletData
  let maintenanceRequests: any[] | undefined = []
  let healthUnitData
  let healthUnitRiskData

  if (userAuthInfo.cpf) {
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

    // Fetch health unit data if CNES is available
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
          per_page: 100,
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

  // Get wallet data info (count and hasData)
  const walletInfo = getWalletDataInfo(
    walletData,
    maintenanceRequests?.length || 0
  )

  return (
    <main className="max-w-xl mx-auto text-white">
      {walletInfo?.hasData ? (
        <section className="pb-30 px-4 relative h-full">
          <div className="flex items-start justify-between pt-6 pb-4">
            <h2 className="relative text-2xl font-bold bg-background z-10 text-foreground">
              Carteira
            </h2>
            <SearchButton />
          </div>

          <WalletTabs activeTab="cards" />

          <div className="mt-6">
            <WalletCardsWrapper
              walletData={walletData}
              maintenanceRequests={maintenanceRequests}
              healthUnitData={healthUnitData}
              healthUnitRiskData={healthUnitRiskData}
            />
          </div>
        </section>
      ) : (
        <EmptyWallet />
      )}
      <FloatNavigation />
    </main>
  )
}
