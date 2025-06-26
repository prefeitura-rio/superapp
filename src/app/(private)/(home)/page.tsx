import { PageFadeInWrapper } from '@/components/ui/page-fade-in'
import { getCitizenCpf } from '@/http/citizen/citizen'
import { getUserInfoFromToken } from '@/lib/user-info'
import { FloatNavigation } from '../components/float-navation'
import MainHeader from '../components/main-header'
import MostAccessedServiceCards from '../components/most-accessed-services-cards'
import SuggestionCards from '../components/suggestion-cards'
import CarteiraSection from '../components/wallet-section'

export default async function Home() {
  const userAuthInfo = await getUserInfoFromToken()
  let userInfo
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
  }

  return (
    <>
      <PageFadeInWrapper>
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
          <CarteiraSection />
        </main>
      </PageFadeInWrapper>
      <FloatNavigation />
    </>
  )
}
