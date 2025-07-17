import { fetchCategories } from '@/lib/categories'
import { CategoryGrid } from '../components/category-grid'
import { FloatNavigation } from '../components/float-navigation'
import MostAccessedServiceCards from '../components/most-accessed-services-cards'
import { SearchButton } from '../components/search-button'

export default async function ServicesPage() {
  const categories = await fetchCategories()

  return (
    <main className="flex max-w-md mx-auto flex-col bg-background text-foreground">
      {/* Header */}
      <header className="px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Serviços</h1>

        <SearchButton />
      </header>

      {/* Most Accessed Service Cards*/}
      <MostAccessedServiceCards showMore={false} />

      {/* Category Grid*/}
      <CategoryGrid title="Categorias" categories={categories} />

      <FloatNavigation />
    </main>
  )
}
