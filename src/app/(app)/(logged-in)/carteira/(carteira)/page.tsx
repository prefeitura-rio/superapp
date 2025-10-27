import EmptyWallet from '@/app/components/empty-wallet'
import { FloatNavigation } from '@/app/components/float-navigation'
import { SearchButton } from '@/app/components/search-button'
import { WalletContent } from '@/app/components/wallet-content'
import { getCitizenCpfPets } from '@/http/citizen/citizen'
import {
  getDalCitizenCpfMaintenanceRequest,
  getDalCitizenCpfWallet,
  getDalHealthUnitInfo,
  getDalHealthUnitRisk,
} from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { getWalletDataInfo } from '@/lib/wallet-utils'

export default async function Wallet() {
  const userAuthInfo = await getUserInfoFromToken()

  // Fetch pets data
  const petsResponse = await getCitizenCpfPets(userAuthInfo.cpf)
  const pets =
    petsResponse.status === 200 &&
    'data' in petsResponse.data &&
    Array.isArray(petsResponse.data.data)
      ? petsResponse.data.data
      : []

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
      {walletInfo?.hasData || pets.length > 0 ? (
        <section className="pb-30 px-4 relative h-full">
          <div className="flex items-start justify-between pt-6 pb-4">
            <h2 className="relative text-2xl font-bold bg-background z-10 text-foreground">
              Carteira
            </h2>
            <SearchButton />
          </div>

          <WalletContent
            hasPets={pets.length > 0}
            pets={pets}
            walletData={walletData}
            maintenanceRequests={maintenanceRequests}
            healthUnitData={healthUnitData}
            healthUnitRiskData={healthUnitRiskData}
          />
        </section>
      ) : (
        <EmptyWallet />
      )}
      <FloatNavigation />
    </main>
  )
}
