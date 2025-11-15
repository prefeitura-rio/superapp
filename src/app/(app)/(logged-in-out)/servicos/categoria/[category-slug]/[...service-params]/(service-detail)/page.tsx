import { SecondaryHeader } from '@/app/components/secondary-header'
import { fetchServiceById, getCategoryNameBySlug } from '@/lib/services-utils'
import { notFound } from 'next/navigation'
import { PortalInternoServiceComponent } from './components/portal-interno-service'

const SERVICE_WHITELIST = [
  '94ff5567-17e5-47f3-8336-4ae209f1a601',
  '5b6ac4fc-b4c7-4ce4-9d0a-3b6f48619694',
  '770618f7-a031-4802-bd44-73520dd45846',
  'b774f0a8-53dd-44d3-850f-50087f9b62c3',
  'd1343d86-eb7d-4e65-85c9-47b975896f2a',
  'ffa3f857-1cc8-406e-8acd-9279399d7123',
  '4fecdbea-be40-45c3-ac71-6641bf4a0f1e',
  '6a5daf79-0022-4cab-af61-96f3a10360e0',
]

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
  // Skip this check if the service ID is in the whitelist
  if (
    !SERVICE_WHITELIST.includes(serviceId) &&
    (serviceData.status !== 1 || serviceData.awaiting_approval === true)
  ) {
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
