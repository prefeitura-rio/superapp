import { CategoryGrid } from '@/app/components/category-grid'
import { FloatNavigation } from '@/app/components/float-navigation'
import {
  MostAccessedServiceCardsSwipe,
  MostAccessedServiceCardsSwipeSkeleton,
} from '@/app/components/most-accessed-services-card-swipe'
import MostAccessedServiceCards from '@/app/components/most-accessed-services-cards'
import { SearchButton } from '@/app/components/search-button'
import { ResponsiveWrapper } from '@/components/ui/custom/responsive-wrapper'
import { fetchCategories } from '@/lib/categories'

export default async function ServicesPage() {
  const categories = await fetchCategories()

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

      {/* Category Grid*/}
      <CategoryGrid title="Categorias" categories={categories} />

      <FloatNavigation />
    </main>
  )
}
