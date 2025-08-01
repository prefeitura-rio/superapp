import { CategoryGridWithRecaptcha } from '@/app/components/category-grid-with-recaptcha'
import { FloatNavigation } from '@/app/components/float-navigation'
import {
  MostAccessedServiceCardsSwipe,
  MostAccessedServiceCardsSwipeSkeleton,
} from '@/app/components/most-accessed-services-card-swipe'
import MostAccessedServiceCards from '@/app/components/most-accessed-services-cards'
import { SearchButton } from '@/app/components/search-button'
import { ResponsiveWrapper } from '@/components/ui/custom/responsive-wrapper'
import { getUserInfoFromToken } from '@/lib/user-info'

export default async function ServicesPage() {
  const userAuthInfo = await getUserInfoFromToken()
  const isLoggedIn = !!(userAuthInfo.cpf && userAuthInfo.name)

  return (
    <main className="flex max-w-4xl mx-auto flex-col bg-background text-foreground">
      {/* Header */}
      <header className="px-4 py-6 flex justify-between items-start">
        <h1 className="text-2xl font-bold">Serviços</h1>

        <SearchButton />
      </header>

      {/* Most Accessed Service Cards*/}
      <ResponsiveWrapper
        mobileComponent={<MostAccessedServiceCards showMore={true} />}
        desktopComponent={<MostAccessedServiceCardsSwipe showMore={true} />}
        desktopSkeletonComponent={<MostAccessedServiceCardsSwipeSkeleton />}
      />

      {/* Category Grid with reCAPTCHA protection */}
      <CategoryGridWithRecaptcha title="Categorias" isLoggedIn={isLoggedIn} />

      <FloatNavigation />
    </main>
  )
}
