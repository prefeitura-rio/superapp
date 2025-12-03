import { getApiV1Categories } from '@/http-busca-search/categories/categories'
import type { ModelsFilteredCategoryResult } from '@/http-busca-search/models/modelsFilteredCategoryResult'
import type { ModelsPrefRioService } from '@/http-busca-search/models/modelsPrefRioService'
import { getApiV1SearchId } from '@/http-busca-search/search/search'
import {
  getDalCategoriesCategorySubcategories,
  getDalSubcategoriesSubcategoryServices,
} from '@/lib/dal'
import { fetchCategories } from './categories'

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

export interface ServicesByCategoryResponse {
  filtered_category?: ModelsFilteredCategoryResult
}

export async function fetchServicesByCategory(
  categorySlug: string
): Promise<ServicesByCategoryResponse | null> {
  try {
    // Decode the URL-encoded category slug
    const decodedSlug = decodeURIComponent(categorySlug)

    // First, get the category name from the slug
    const categoryName = await getCategoryNameBySlug(decodedSlug)

    // Use the categories endpoint with filter_category parameter
    const response = await getApiV1Categories(
      {
        filter_category: categoryName,
        page: 1,
        per_page: 20,
        include_inactive: false,
      },
      {
        // Cache the response for 10 minutes
        next: {
          revalidate: 600,
          tags: ['category-services', categorySlug],
        },
      }
    )

    if (response.status !== 200) {
      throw new Error(`Failed to fetch services: ${response.status}`)
    }

    return {
      filtered_category: response.data.filtered_category,
    }
  } catch (error) {
    console.error('Error fetching services:', error)
    return null
  }
}

export async function fetchServiceById(
  id: string
): Promise<ModelsPrefRioService | null> {
  try {
    const response = await getApiV1SearchId(id, {
      // Cache the response for 10 minutes
      next: {
        revalidate: 600,
        tags: ['service', id],
      },
    })

    if (response.status === 404) {
      // Service not found - return null to trigger notFound()
      return null
    }

    if (response.status !== 200) {
      console.error(
        `Failed to fetch service ${id}: Status ${response.status}`,
        response.data
      )
      return null
    }

    // Return the API response directly - no mapping needed
    return response.data
  } catch (error) {
    console.error('Error fetching service:', error)
    return null
  }
}

export async function fetchSubcategoriesByCategory(categoryName: string) {
  try {
    const response = await getDalCategoriesCategorySubcategories(categoryName, {
      sort_by: 'count',
      order: 'desc',
      include_empty: false,
    })

    if (response.status !== 200) {
      console.error(
        `Failed to fetch subcategories: ${response.status}`,
        response.data
      )
      return null
    }

    return response.data
  } catch (error) {
    console.error('Error fetching subcategories:', error)
    return null
  }
}

export async function fetchServicesBySubcategory(
  subcategoryName: string,
  page = 1,
  perPage = 50
) {
  try {
    const response = await getDalSubcategoriesSubcategoryServices(
      subcategoryName,
      {
        page,
        per_page: perPage,
        include_inactive: false,
      }
    )

    if (response.status !== 200) {
      console.error(
        `Failed to fetch services for subcategory: ${response.status}`,
        response.data
      )
      return null
    }

    return response.data
  } catch (error) {
    console.error('Error fetching services by subcategory:', error)
    return null
  }
}
