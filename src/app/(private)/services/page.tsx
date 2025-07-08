'use client'

import { CategoryGrid } from '../components/category-grid'
import { FloatNavigation } from '../components/float-navigation'
import MostAccessedServiceCards from '../components/most-accessed-services-cards'
import { ServiceCategories } from '../components/service-categories'

export default function ServicesPage() {
  const categories = ServiceCategories()

  return (
    <main className="flex max-w-md mx-auto flex-col bg-background text-foreground">
      {/* <MainHeader /> */}
      {/* Header */}
      <header className="px-4 py-6">
        <h1 className="text-2xl font-bold">Serviços</h1>
      </header>

      {/* Most Accessed Service Cards*/}
      <MostAccessedServiceCards showMore={false} />

      {/* Carteira section */}
      <CategoryGrid title="Categorias" categories={categories} />
      <FloatNavigation />
    </main>
  )
}
