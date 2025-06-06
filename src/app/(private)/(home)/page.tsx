import { getCitizenCpfFirstlogin } from '@/http/citizen/citizen'
import { getUserInfoFromToken } from '@/lib/user-info'

import { setFirstLoginFalse } from '@/http/actions/firstlogin'
import { FloatNavigation } from '../components/float-navation'
import MainHeader from '../components/main-header'
import MostAccessedServiceCards from '../components/most-accessed-services-cards'
import Onboarding from '../components/on-boarding'
import SuggestionCards from '../components/suggestion-cards'
import CarteiraSection from '../components/wallet-section'

export default async function Home() {
  const userInfo = await getUserInfoFromToken() || { cpf: '', name: '' };
  const { data, status } = await getCitizenCpfFirstlogin(userInfo.cpf);
  const firstLogin = status === 200 && data.firstlogin;

  if (firstLogin) {
    return (
      <main className="flex max-w-md mx-auto flex-col bg-background text-foreground">
        <Onboarding userInfo={userInfo} setFirstLoginFalse={setFirstLoginFalse} />
      </main>
    )
  }

  return (
    <main className="flex max-w-md mx-auto pt-15 flex-col bg-background text-foreground">
      <MainHeader />
      {/* Header */}
      <header className="p-5">
        <h1 className="text-2xl font-bold text-foreground">Marina Duarte</h1>
      </header>

      {/* Suggestion Cards*/}
      <SuggestionCards order={[0, 1, 2]} />

      {/* Most Accessed Service Cards*/}
      <MostAccessedServiceCards />

      {/* Carteira section */}
      <CarteiraSection />

      <FloatNavigation />
    </main>
  )
}