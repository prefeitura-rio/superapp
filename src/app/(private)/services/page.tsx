'use client'

import { PageFadeInWrapper } from '@/components/ui/page-fade-in'
import { CategoryGrid } from '../components/category-grid'
import { FloatNavigation } from '../components/float-navation'
import MainHeader from '../components/main-header'
import MostAccessedServiceCards from '../components/most-accessed-services-cards'
import { ServiceCategories } from '../components/service-categories'
import SuggestionCards from '../components/suggestion-cards'

export default function ServicesPage() {
  const categories = ServiceCategories()

  return (
    <>
      <PageFadeInWrapper>
        <main className="flex max-w-md mx-auto pt-15 flex-col bg-background text-foreground">
          <MainHeader />
          {/* Header */}
          <header className="p-5">
            <h1 className="text-2xl font-bold">Serviços</h1>
          </header>

          {/* Suggestion Cards*/}
          <SuggestionCards order={[1, 2, 0]} />

          {/* Most Accessed Service Cards*/}
          <MostAccessedServiceCards />

          {/* Carteira section */}
          <CategoryGrid title="Todos" categories={categories} />
        </main>
      </PageFadeInWrapper>
      <FloatNavigation />
    </>
  )
}
