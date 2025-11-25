import { FloatNavigation } from '@/app/components/float-navigation'
import HeaderWrapperClient from '@/app/components/header-wrapper-client'
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
import WalletSectionClient from '@/app/components/wallet-section-client'
import { ResponsiveWrapper } from '@/components/ui/custom/responsive-wrapper'
import { aditionalCategoriesFull } from '@/constants/aditional-services'
import { fetchCategories } from '@/lib/categories'
import { getUserInfoFromToken } from '@/lib/user-info'

export default async function Home() {
  const userAuthInfo = await getUserInfoFromToken()
  const isLoggedIn = !!(userAuthInfo.cpf && userAuthInfo.name)

  const categories = await fetchCategories()
  // const categoriesSlice = categories.slice(0, -3)
  const categoriesSlice = categories
  const allCategories = [...categoriesSlice, ...aditionalCategoriesFull]

  return (
    <main className="flex w-full mx-auto max-w-4xl flex-col bg-background text-foreground pb-30">
      <HeaderWrapperClient />

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

      {/* Carteira section - fetched client-side to avoid cache issues */}
      <WalletSectionClient />
      <FloatNavigation />
    </main>
  )
}
