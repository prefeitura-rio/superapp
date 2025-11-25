import { SecondaryHeader } from '@/app/components/secondary-header'
import {
  fetchServicesByCategory,
  getCategoryNameBySlug,
} from '@/lib/services-utils'
import { MenuItemClient } from './components/menu-item-client'

export const revalidate = 600

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ 'category-slug': string }>
}) {
  const { 'category-slug': categorySlug } = await params
  const categoryName = await getCategoryNameBySlug(categorySlug)

  // Fetch services data from API
  const servicesData = await fetchServicesByCategory(categorySlug)

  const services = servicesData?.filtered_category?.services || []

  return (
    <div className="min-h-lvh max-w-4xl mx-auto flex flex-col">
      <SecondaryHeader title={categoryName} showSearchButton />
      <div className="min-h-screen text-white">
        <div className="max-w-4xl mx-auto pt-20 md:pt-22 px-4 pb-20">
          <nav className="flex flex-col">
            {services.length > 0 ? (
              services.map((service, index) => (
                <MenuItemClient
                  key={service.id}
                  href={`/servicos/categoria/${categorySlug}/${service.id}`}
                  title={service.title || ''}
                  description={service.description || ''}
                  category={categoryName}
                  listPosition={index + 1}
                >
                  <span className="text-card-foreground">
                    {service.title}
                  </span>
                </MenuItemClient>
              ))
            ) : (
              <div className="py-8 text-center text-card-foreground">
                <p>Nenhum serviço encontrado para esta categoria.</p>
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>
  )
}
