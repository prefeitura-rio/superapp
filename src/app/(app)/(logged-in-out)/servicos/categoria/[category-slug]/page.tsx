import { CategorySubcategoriesAccordion } from '@/app/components/category-subcategories-accordion'
import { MostAccessedServiceLink } from '@/app/components/most-accessed-service-link'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { PrefLogo } from '@/assets/icons/pref-logo'
import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import { getCardColorForCategory } from '@/constants/category-color-palettes'
import { VIDEO_SOURCES } from '@/constants/videos-sources'
import type { ModelsServiceDocument } from '@/http-busca-search/models/modelsServiceDocument'
import {
  fetchServicesByCategory,
  fetchSubcategoriesByCategory,
  getCategoryNameBySlug,
} from '@/lib/services-utils'
import Link from 'next/link'

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

  // Fetch subcategories data from API
  const subcategoriesResponse = await fetchSubcategoriesByCategory(categoryName)
  const subcategories = subcategoriesResponse?.subcategories || []

  // Extract services from the response
  const servicesDocuments = servicesData?.filtered_category?.services || []

  // Map services to the format expected by MostAccessedServiceLink
  // Limit to 4 services for color palette application
  const services = servicesDocuments
    .filter(
      (service): service is ModelsServiceDocument =>
        service.slug !== undefined &&
        service.title !== undefined &&
        service.description !== undefined
    )
    .slice(0, 4)
    .map(service => ({
      id: service.id!,
      href: `/servicos/categoria/${categorySlug}/${service.slug}`,
      icon: '',
      title: service.title!,
      description: service.description!,
    }))

  return (
    <div className="min-h-lvh max-w-4xl mx-auto flex flex-col">
      <SecondaryHeader
        logo={
          <Link href="/" className="cursor-pointer">
            <PrefLogo fill="var(--primary)" className="h-8 w-20" />
          </Link>
        }
        showSearchButton
        className="max-w-[896px]"
        defaultRoute="/"
      />

      <div className="min-h-screen text-white">
        <div className="max-w-4xl mx-auto pt-20 md:pt-22 px-4 pb-4">
          <h1 className="text-4xl font-bold text-foreground">{categoryName}</h1>
        </div>
        {services.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-2 px-4">
              <h2 className="text-md font-medium text-foreground">
                Mais acessados
              </h2>
            </div>
            {/* Cards: expand to fill width, same size, with horizontal scroll when needed */}
            <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
              <div className="flex gap-2 px-4 min-w-full">
                {services.map((service, index) => {
                  // Get color for this card position (0-3) based on category
                  const cardColor = getCardColorForCategory(categoryName, index)

                  return (
                    <MostAccessedServiceLink
                      key={service.id}
                      service={service}
                      position={index + 1}
                      className="flex-1 min-w-[140px] basis-0"
                    >
                      <div
                        className="rounded-2xl p-4 transition-all cursor-pointer flex flex-col items-start justify-end min-h-[130px] w-full h-full hover:brightness-110 hover:shadow-lg"
                        style={{
                          backgroundColor: cardColor,
                        }}
                      >
                        <div className="w-full">
                          <h3 className="text-sm line-clamp-5 font-normal leading-4.5 break-words text-white">
                            {service.title}
                          </h3>
                        </div>
                      </div>
                    </MostAccessedServiceLink>
                  )
                })}
                {/* Spacer to ensure padding at the end */}
                <div className="flex-shrink-0 sm:hidden w-2" />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center justify-center py-8">
            <ThemeAwareVideo
              source={VIDEO_SOURCES.emptyAddress}
              containerClassName="mb-6 flex items-center justify-center h-[min(328px,40vh)] max-h-[328px]"
            />
            <p className="text-lg text-muted-foreground">
              Ops... nenhum serviço encontrado nesta categoria
            </p>
          </div>
        )}

        {/* Subcategories Accordion */}
        {subcategories.length > 0 && (
          <CategorySubcategoriesAccordion
            categorySlug={categorySlug}
            categoryName={categoryName}
            subcategories={subcategories}
          />
        )}
      </div>
    </div>
  )
}
