import { ServiceCategories } from '@/app/(private)/components/service-categories'
import type { ServiceDocument, ServicesApiResponse } from '@/types/service'

const rootUrl = process.env.NEXT_PUBLIC_API_BUSCA_ROOT_URL

export function getCategoryNameBySlug(categorySlug: string): string {
  // Decode the URL-encoded category slug
  const decodedSlug = decodeURIComponent(categorySlug)

  const categories = ServiceCategories()
  const category = categories.find(cat => cat.categorySlug === decodedSlug)
  return (
    category?.name || decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1)
  )
}

export async function fetchServicesByCategory(
  categorySlug: string
): Promise<ServicesApiResponse | null> {
  try {
    // Decode the URL-encoded category slug - no need to encode again
    const decodedSlug = decodeURIComponent(categorySlug)
    const url = `${rootUrl}/categoria/1746,carioca-digital?categoria=${decodedSlug}&page=1&per_page=20`

    const response = await fetch(url, {
      cache: 'force-cache', // Cache for performance in production
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching services:', error)
    return null
  }
}

export async function fetchServiceById(
  collection: string,
  id: string
): Promise<ServiceDocument | null> {
  try {
    const url = `${rootUrl}/documento/${collection}/${id}`

    const response = await fetch(url, {
      cache: 'force-cache', // Cache for performance in production
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch service: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching service:', error)
    return null
  }
}
