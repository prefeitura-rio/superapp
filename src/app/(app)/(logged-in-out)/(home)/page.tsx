import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import HeaderWrapperClient from '@/app/components/header-wrapper-client'
import HomeCategoriesGrid from '@/app/components/home-categories-grid'
import MostAccessedServiceCards from '@/app/components/most-accessed-services-cards'
import { PendingInviteSection } from '@/app/components/pending-invite-section'
import RequestsInProgressBanner from '@/app/components/requests-in-progress-banner'
import RequestsSectionCards from '@/app/components/requests-section-cards'
import SuggestionCards from '@/app/components/suggestion-cards'
import {
  SuggestionCardsSwipe,
  SuggestionCardsSwipeSkeleton,
} from '@/app/components/suggestion-cards-swipe'
import WalletSectionClient from '@/app/components/wallet-section-client'
import { ResponsiveWrapper } from '@/components/ui/custom/responsive-wrapper'
import { aditionalCategoriesFull } from '@/constants/aditional-services'
import { fetchCategories } from '@/lib/categories'
import { AuthStatusProvider } from '@/providers/auth-status-provider'

const isChamadosEnabled = process.env.NEXT_PUBLIC_FEATURE_CHAMADOS === 'true'

export default async function Home() {
  const categories = await fetchCategories()
  const categoriesSlice = categories.slice(0, 14)
  const allCategories = [...categoriesSlice, ...aditionalCategoriesFull]

  return (
    <AuthStatusProvider>
      <main className="flex w-full mx-auto max-w-4xl flex-col bg-background text-foreground pb-30">
        <HeaderWrapperClient />

        {/* Requests in progress banner — only visible when logged in with recent requests */}
        {isChamadosEnabled && <RequestsInProgressBanner />}

        <PendingInviteSection />

        {/* Suggestion Cards*/}
        <ResponsiveWrapper
          mobileComponent={<SuggestionCards />}
          desktopComponent={<SuggestionCardsSwipe />}
          desktopSkeletonComponent={<SuggestionCardsSwipeSkeleton />}
        />

        {/* Home Categories Grid*/}
        <HomeCategoriesGrid categories={allCategories} />

        {/* Requests Section Cards */}
        {isChamadosEnabled && <RequestsSectionCards />}

        {/* Most Accessed Service Cards*/}
        <MostAccessedServiceCards />

        {/* Carteira section - fetched client-side to avoid cache issues */}
        <WalletSectionClient />
        <FloatNavigationWrapper />
      </main>
    </AuthStatusProvider>
  )
}
