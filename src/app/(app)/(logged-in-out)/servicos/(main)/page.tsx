import { CategoryGrid } from '@/app/components/category-grid'
import { FloatNavigation } from '@/app/components/float-navigation'
import MostAccessedServiceCards from '@/app/components/most-accessed-services-cards'
import { SearchButton } from '@/app/components/search-button'
import { additionalCategories } from '@/constants/aditional-services'
import { fetchCategories } from '@/lib/categories'

export const revalidate = 600

export default async function ServicesPage() {
  const categories = await fetchCategories()
  const allCategories = [...categories, ...additionalCategories]

  return (
    <main className="flex max-w-4xl mx-auto flex-col bg-background text-foreground">
      {/* Header */}
      <header className="px-4 py-6 flex justify-between items-start">
        <h1 className="text-2xl font-bold">Serviços</h1>

        <SearchButton />
      </header>

      {/* Most Accessed Service Cards*/}
      <MostAccessedServiceCards limit={4} />

      {/* Category Grid*/}
      <CategoryGrid title="Categorias" categories={allCategories} />

      <FloatNavigation />
    </main>
  )
}
