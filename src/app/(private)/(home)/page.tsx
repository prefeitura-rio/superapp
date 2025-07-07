import {
  getCitizenCpfMaintenanceRequest,
  getCitizenCpfWallet,
} from '@/http/citizen/citizen'
import { getUserInfoFromToken } from '@/lib/user-info'
import { FloatNavigation } from '../components/float-navigation'
import HomeServicesGrid from '../components/home-services-grid'
import MostAccessedServiceCards from '../components/most-accessed-services-cards'
import ScrollAwareHeader from '../components/scroll-aware-header'
import SuggestionCards from '../components/suggestion-cards'
import CarteiraSection from '../components/wallet-section'

export default async function Home() {
  const userAuthInfo = await getUserInfoFromToken()
  let walletData
  let maintenanceRequests

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

  return (
    <main className="flex max-w-md mx-auto pt-21 flex-col bg-background text-foreground">
      <ScrollAwareHeader userName={userAuthInfo.name} />

      {/* Suggestion Cards*/}
      <SuggestionCards order={[1, 0]} />

      {/* Home Services Grid*/}
      <HomeServicesGrid />

      {/* Most Accessed Service Cards*/}
      <MostAccessedServiceCards />

      {/* Carteira section */}
      <CarteiraSection
        walletData={walletData}
        maintenanceRequests={maintenanceRequests}
      />
      <FloatNavigation />
    </main>
  )
}
