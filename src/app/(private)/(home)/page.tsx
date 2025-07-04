import { getCitizenCpf, getCitizenCpfWallet } from '@/http/citizen/citizen'
import { getUserInfoFromToken } from '@/lib/user-info'
import { FloatNavigation } from '../components/float-navigation'
import MainHeader from '../components/main-header'
import MostAccessedServiceCards from '../components/most-accessed-services-cards'
import SuggestionCards from '../components/suggestion-cards'
import CarteiraSection from '../components/wallet-section'

export default async function Home() {
  const userAuthInfo = await getUserInfoFromToken()
  let userInfo
  let walletData

  if (userAuthInfo.cpf) {
    try {
      const response = await getCitizenCpf(userAuthInfo.cpf, {
        cache: 'force-cache',
      })
      if (response.status === 200) {
        userInfo = response.data
      } else {
        console.error('Failed to fetch user data status:', response.data)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }

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
  }

  return (
    <main className="flex max-w-md mx-auto pt-15 flex-col bg-background text-foreground">
      <MainHeader />
      {/* Header */}
      <header className="p-5">
        <h1 className="text-2xl font-bold text-foreground">
          {userAuthInfo.name}
        </h1>
      </header>

      {/* Suggestion Cards*/}
      <SuggestionCards order={[0, 1, 2]} />

      {/* Most Accessed Service Cards*/}
      <MostAccessedServiceCards />

      {/* Carteira section */}
      <CarteiraSection walletData={walletData} />
      <FloatNavigation />
    </main>
  )
}
