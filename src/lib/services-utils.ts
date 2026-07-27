import { CARTA_SERVICOS_API_ENABLED } from '@/constants/venvs'
import { getApiV1Categories } from '@/http-busca-search/categories/categories'
import type { ModelsFilteredCategoryResult } from '@/http-busca-search/models/modelsFilteredCategoryResult'
import type { ModelsPrefRioService } from '@/http-busca-search/models/modelsPrefRioService'
import { getApiV1SearchId } from '@/http-busca-search/search/search'
import { getApiV1ServicesSlug } from '@/http-busca-search/services/services'
import {
  fetchCartaServicosServiceBySlug,
  fetchCartaServicosServicesByCategory,
  fetchCartaServicosServicesBySubcategory,
  fetchCartaServicosSubcategoriesByCategory,
} from '@/lib/carta-servicos/fetch'
import {
  getDalCategoriesCategorySubcategories,
  getDalSubcategoriesSubcategoryServices,
} from '@/lib/dal'
import { fetchCategories, getIconForCategory } from './categories'

export async function getCategoryNameBySlug(
  categorySlug: string
): Promise<string> {
  try {
    const decodedSlug = decodeURIComponent(categorySlug)

    const categories = await fetchCategories()
    const category = categories.find(cat => cat.categorySlug === decodedSlug)
    return (
      category?.name ||
      decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1)
    )
  } catch (error) {
    console.error('Error in getCategoryNameBySlug:', error)
    try {
      const decodedSlug = decodeURIComponent(categorySlug)
      return decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1)
    } catch {
      return categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)
    }
  }
}

export interface ServicesByCategoryResponse {
  filtered_category?: ModelsFilteredCategoryResult
}

export async function fetchServicesByCategory(
  categorySlug: string
): Promise<ServicesByCategoryResponse | null> {
  try {
    let decodedSlug: string
    try {
      decodedSlug = decodeURIComponent(categorySlug)
    } catch {
      decodedSlug = categorySlug
    }

    if (CARTA_SERVICOS_API_ENABLED) {
      return fetchCartaServicosServicesByCategory(
        decodedSlug,
        getIconForCategory
      )
    }

    const categoryName = await getCategoryNameBySlug(decodedSlug)

    const response = await getApiV1Categories(
      {
        filter_category: categoryName,
        page: 1,
        per_page: 20,
        include_inactive: false,
      },
      {
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
      next: {
        revalidate: 600,
        tags: ['service', id],
      },
    })

    if (response.status === 404) {
      return null
    }

    if (response.status !== 200) {
      console.error(
        `Failed to fetch service ${id}: Status ${response.status}`,
        response.data
      )
      return null
    }

    return response.data
  } catch (error) {
    console.error('Error fetching service:', error)
    return null
  }
}

export async function fetchServiceBySlug(
  slug: string
): Promise<ModelsPrefRioService | null> {
  try {
    if (CARTA_SERVICOS_API_ENABLED) {
      return fetchCartaServicosServiceBySlug(slug)
    }

    const response = await getApiV1ServicesSlug(slug, {
      next: {
        revalidate: 600,
        tags: ['service', slug],
      },
    })

    if (response.status === 404) {
      return null
    }

    if (response.status === 301) {
      console.warn(`Service slug ${slug} redirected:`, response.data)
      return null
    }

    if (response.status !== 200) {
      console.error(
        `Failed to fetch service ${slug}: Status ${response.status}`,
        response.data
      )
      return null
    }

    return response.data
  } catch (error) {
    console.error('Error fetching service:', error)
    return null
  }
}

export async function fetchSubcategoriesByCategory(categorySlugOrName: string) {
  try {
    if (CARTA_SERVICOS_API_ENABLED) {
      return fetchCartaServicosSubcategoriesByCategory(
        categorySlugOrName,
        getIconForCategory
      )
    }

    const response = await getDalCategoriesCategorySubcategories(
      categorySlugOrName,
      {
        sort_by: 'count',
        order: 'desc',
        include_empty: false,
      }
    )

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
  subcategorySlugOrName: string,
  page = 1,
  perPage = 50,
  category?: string
) {
  try {
    if (CARTA_SERVICOS_API_ENABLED) {
      return fetchCartaServicosServicesBySubcategory(
        subcategorySlugOrName,
        page,
        perPage
      )
    }

    const response = await getDalSubcategoriesSubcategoryServices(
      subcategorySlugOrName,
      {
        page,
        per_page: perPage,
        include_inactive: false,
        category,
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
