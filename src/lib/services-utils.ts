import {
  NEXT_PUBLIC_BUSCA_1746_COLLECTION,
  NEXT_PUBLIC_BUSCA_CARIOCA_DIGITAL_COLLECTION,
} from '@/constants/venvs'
import type { Service1746 } from '@/types/1746'
import type { CariocaDigitalService } from '@/types/carioca-digital'
import type { ServicesApiResponse } from '@/types/service'
import { fetchCategories } from './categories'

const rootUrl = process.env.NEXT_PUBLIC_BASE_API_URL_APP_BUSCA_SEARCH

export async function getCategoryNameBySlug(
  categorySlug: string
): Promise<string> {
  // Decode the URL-encoded category slug
  const decodedSlug = decodeURIComponent(categorySlug)

  const categories = await fetchCategories()
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
    const url = `${rootUrl}api/v1/categoria/${NEXT_PUBLIC_BUSCA_1746_COLLECTION},${NEXT_PUBLIC_BUSCA_CARIOCA_DIGITAL_COLLECTION}?categoria=${decodedSlug}&page=1&per_page=20`

    const response = await fetch(url, {
      cache: 'force-cache', // Cache for performance in production
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    })
    console.log(url)
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
): Promise<CariocaDigitalService | Service1746 | null> {
  try {
    const url = `${rootUrl}api/v1/documento/${collection}/${id}`

    const response = await fetch(url, {
      cache: 'force-cache', // Cache for performance in production
      next: { revalidate: 300 }, // Revalidate every 5 minutes
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
