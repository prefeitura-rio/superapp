import type { Service1746 } from '@/types/1746'
import type { CariocaDigitalService } from '@/types/carioca-digital'
import type { ServicesApiResponse } from '@/types/service'
import { fetchCategories } from './categories'

const rootUrl = process.env.NEXT_PUBLIC_API_BUSCA_ROOT_URL

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
  categorySlug: string,
  recaptchaToken?: string
): Promise<ServicesApiResponse | null> {
  try {
    const headers: HeadersInit = {}

    // Add reCAPTCHA token if provided
    if (recaptchaToken) {
      headers['X-Recaptcha-Token'] = recaptchaToken
    }

    // Use absolute URL for server-side fetching
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(
      `${baseUrl}/api/services/category/${encodeURIComponent(categorySlug)}`,
      {
        headers,
        next: { revalidate: 86400 }, // Cache for 1 day
      }
    )

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
  id: string,
  recaptchaToken?: string
): Promise<CariocaDigitalService | Service1746 | null> {
  try {
    const headers: HeadersInit = {}

    // Add reCAPTCHA token if provided
    if (recaptchaToken) {
      headers['X-Recaptcha-Token'] = recaptchaToken
    }

    // Use absolute URL for server-side fetching
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(
      `${baseUrl}/api/services/${collection}/${id}`,
      {
        headers,
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch service: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching service:', error)
    return null
  }
}
