import { FloatNavigation } from '../components/float-navation'
import MainHeader from '../components/main-header'
import MostAccessedServiceCards from '../components/most-accessed-services-cards'
import SuggestionCards from '../components/suggestion-cards'
import CarteiraSection from '../components/wallet-section'

export default async function Home() {
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/api/protected`, { credentials: 'include' });
  // const data = await res.json();
  // console.log("User Data:", data);

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
