import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import HeaderWrapperClient from '@/app/components/header-wrapper-client'
import { HomeBannerCarousel } from '@/app/components/home-banners/home-banner-carousel'
import HomeCategoriesGrid from '@/app/components/home-categories-grid'
import MostAccessedServiceCards from '@/app/components/most-accessed-services-cards'
import { OportunidadesCariocas } from '@/app/components/oportunidades-cariocas'
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
import { resolveMostAccessedServices } from '@/lib/carta-servicos/home-featured'
import { fetchCategories } from '@/lib/categories'
import {
  isHomeBannersV3Enabled,
  isHomeSolicitacoesEnabled,
  isSalesforceServicesEnabled,
} from '@/lib/feature-flags'
import { AuthStatusProvider } from '@/providers/auth-status-provider'

export default async function Home() {
  const isSalesforceEnabled = isSalesforceServicesEnabled()
  const [categories, mostAccessed] = await Promise.all([
    fetchCategories(),
    resolveMostAccessedServices(),
  ])
  const categoriesSlice = categories.slice(0, 15)
  const allCategories = [...categoriesSlice, ...aditionalCategoriesFull]

  return (
    <AuthStatusProvider>
      <main className="flex w-full mx-auto max-w-4xl flex-col bg-background text-foreground pb-6">
        <h1 className="sr-only">
          Pref Rio — Portal de serviços da Prefeitura do Rio
        </h1>
        <HeaderWrapperClient showSearchPlaceholder />

        {/* Requests in progress banner — only visible when logged in with recent requests */}
        {isSalesforceEnabled && <RequestsInProgressBanner />}

        <PendingInviteSection />

        {/* Banners: carrossel v3 só com FEATURE_HOME_BANNERS_V3; sem a flag, os banners de sugestão anteriores */}
        {isHomeBannersV3Enabled() ? (
          <HomeBannerCarousel />
        ) : (
          <ResponsiveWrapper
            mobileComponent={<SuggestionCards />}
            desktopComponent={<SuggestionCardsSwipe />}
            desktopSkeletonComponent={<SuggestionCardsSwipeSkeleton />}
          />
        )}

        {/* Home Categories Grid*/}
        <HomeCategoriesGrid categories={allCategories} />

        {/* Requests Section Cards */}
        {isSalesforceEnabled && isHomeSolicitacoesEnabled() && (
          <RequestsSectionCards />
        )}

        {/* Most Accessed Service Cards*/}
        <MostAccessedServiceCards services={mostAccessed} />

        {/* Oportunidades Cariocas */}
        <OportunidadesCariocas />

        {/* Carteira section - fetched client-side to avoid cache issues */}
        <WalletSectionClient isSalesforceEnabled={isSalesforceEnabled} />
        <FloatNavigationWrapper />
      </main>
    </AuthStatusProvider>
  )
}
