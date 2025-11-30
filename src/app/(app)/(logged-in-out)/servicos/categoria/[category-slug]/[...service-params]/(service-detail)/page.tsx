import { getDepartmentsCdUa } from '@/http/departments/departments'
import { fetchServiceById, getCategoryNameBySlug } from '@/lib/services-utils'
import { notFound } from 'next/navigation'
import { PageClientWrapper } from './page-client-wrapper'

export const revalidate = 1800

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
  console.log(`DATAAA${JSON.stringify(serviceData)}`)

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

  // Fetch orgao gestor name from Departments API
  let orgaoGestorName: string | null = null
  const orgaoGestorValue = serviceData?.orgao_gestor?.[0]

  if (orgaoGestorValue) {
    // Check if it's a number (ID) or a string (name)
    const numericValue = Number(orgaoGestorValue)
    const isNumericId =
      !Number.isNaN(numericValue) && String(orgaoGestorValue).trim() !== ''

    if (isNumericId) {
      // It's an ID - fetch from API
      try {
        const departmentResult = await getDepartmentsCdUa(
          String(orgaoGestorValue)
        )

        if (departmentResult.status === 200 && departmentResult.data) {
          const { nome_ua, sigla_ua } = departmentResult.data

          if (nome_ua) {
            orgaoGestorName = sigla_ua ? `${nome_ua} (${sigla_ua})` : nome_ua
          }
        }
      } catch (error) {
        console.error('Error fetching orgao gestor:', error)
        // Fallback to the ID
        orgaoGestorName = String(orgaoGestorValue)
      }
    } else {
      // It's already a name - use it directly
      orgaoGestorName = String(orgaoGestorValue)
    }
  }

  return (
    <PageClientWrapper
      serviceData={serviceData}
      orgaoGestorName={orgaoGestorName}
      categorySlug={categorySlug}
    />
  )
}
