import { SecondaryHeader } from '@/app/components/secondary-header'
import { NEXT_PUBLIC_BUSCA_1746_COLLECTION, NEXT_PUBLIC_BUSCA_CARIOCA_DIGITAL_COLLECTION } from '@/constants/venvs'
import { fetchServiceById, getCategoryNameBySlug } from '@/lib/services-utils'
import type { Service1746 } from '@/types/1746'
import type { CariocaDigitalService } from '@/types/carioca-digital'
import { notFound } from 'next/navigation'
import { Service1746Component } from './components/1746-service'
import { CariocaDigitalServiceComponent } from './components/carioca-digital-service'

export default async function ServicePage({
  params,
}: {
  params: Promise<{ 'category-slug': string; 'service-params': string[] }>
}) {
  const { 'category-slug': categorySlug, 'service-params': serviceParams } =
    await params

  // Extract service ID and collection from params
  const [serviceId, collection] = serviceParams

  if (
    !serviceId ||
    (collection !== NEXT_PUBLIC_BUSCA_CARIOCA_DIGITAL_COLLECTION && collection !== NEXT_PUBLIC_BUSCA_1746_COLLECTION)
  ) {
    notFound()
  }

  // Fetch the service data
  const serviceData = await fetchServiceById(collection, serviceId)

  if (!serviceData) {
    notFound()
  }

  const categoryName = getCategoryNameBySlug(categorySlug)

  return (
    <div className="min-h-lvh max-w-4xl mx-auto flex flex-col">
      <SecondaryHeader title="Descrição do Serviço" showSearchButton />

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-20 md:pt-22 pb-20">
          {collection === NEXT_PUBLIC_BUSCA_CARIOCA_DIGITAL_COLLECTION && (
            <CariocaDigitalServiceComponent
              serviceData={serviceData as unknown as CariocaDigitalService}
            />
          )}

          {collection === NEXT_PUBLIC_BUSCA_1746_COLLECTION && (
            <Service1746Component
              serviceData={serviceData as unknown as Service1746}
            />
          )}
        </div>
      </div>
    </div>
  )
}
