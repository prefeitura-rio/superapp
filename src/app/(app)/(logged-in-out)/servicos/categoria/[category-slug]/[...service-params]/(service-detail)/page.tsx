import { SecondaryHeader } from '@/app/components/secondary-header'
import { fetchServiceById, getCategoryNameBySlug } from '@/lib/services-utils'
import { notFound } from 'next/navigation'
import { PortalInternoServiceComponent } from './components/portal-interno-service'

export default async function ServicePage({
  params,
}: {
  params: Promise<{ 'category-slug': string; 'service-params': string[] }>
}) {
  const { 'category-slug': categorySlug, 'service-params': serviceParams } =
    await params

  // Extract service ID from params (first param is the service ID)
  const serviceId = serviceParams?.[0]

  if (!serviceId) {
    notFound()
  }

  // Fetch the service data using the new endpoint
  const serviceData = await fetchServiceById(serviceId)

  if (!serviceData) {
    notFound()
  }

  // Check if service status is different from 1 (Published) or awaiting approval
  if (serviceData.status !== 1 || serviceData.awaiting_approval === true) {
    notFound()
  }

  await getCategoryNameBySlug(categorySlug)

  return (
    <div className="min-h-lvh max-w-4xl mx-auto flex flex-col">
      <SecondaryHeader title="Descrição do Serviço" showSearchButton />

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-20 md:pt-22 pb-20">
          <PortalInternoServiceComponent serviceData={serviceData} />
        </div>
      </div>
    </div>
  )
}
