'use client'

import { CategoryGrid } from '../components/category-grid'
import { FloatNavigation } from '../components/float-navigation'
import MostAccessedServiceCards from '../components/most-accessed-services-cards'
import { ServiceCategories } from '../components/service-categories'
import SuggestionCards from '../components/suggestion-cards'

export default function ServicesPage() {
  const categories = ServiceCategories()

  return (
    <main className="flex max-w-md mx-auto flex-col bg-background text-foreground">
      {/* <MainHeader /> */}
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
      <FloatNavigation />
    </main>
  )
}
