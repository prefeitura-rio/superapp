import { CategoryGrid } from '@/app/components/category-grid'
import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import HeaderWrapperClient from '@/app/components/header-wrapper-client'
import MostAccessedServiceCards from '@/app/components/most-accessed-services-cards'
import { additionalCategories } from '@/constants/aditional-services'
import { fetchCategories } from '@/lib/categories'

export const revalidate = 600

export default async function ServicesPage() {
  const categories = await fetchCategories()
  const allCategories = [...categories, ...additionalCategories]

  return (
    <div className="bg-background text-foreground">
      <HeaderWrapperClient />
      <main className="flex max-w-4xl mx-auto flex-col px-4">
        {/* Most Accessed Service Cards*/}
        <MostAccessedServiceCards limit={4} />

        {/* Category Grid*/}
        <CategoryGrid title="Categorias" categories={allCategories} />

        <FloatNavigationWrapper />
      </main>
    </div>
  )
}
