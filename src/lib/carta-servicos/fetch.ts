import type { ModelsFilteredCategoryResult } from '@/http-busca-search/models/modelsFilteredCategoryResult'
import type { ModelsPrefRioService } from '@/http-busca-search/models/modelsPrefRioService'
import type { ModelsSubcategoryResponse } from '@/http-busca-search/models/modelsSubcategoryResponse'
import type { ModelsSubcategoryServicesResponse } from '@/http-busca-search/models/modelsSubcategoryServicesResponse'
import {
  getServiceDetail,
  getServicesBySubtheme,
  getSubthemesByTheme,
  getThemes,
} from '@/http-pref-rio-carta-servicos/default/default'
import type { ServiceDetail } from '@/http-pref-rio-carta-servicos/models/serviceDetail'
import type { ServiceListItem } from '@/http-pref-rio-carta-servicos/models/serviceListItem'
import type { Subtheme } from '@/http-pref-rio-carta-servicos/models/subtheme'
import type { Theme } from '@/http-pref-rio-carta-servicos/models/theme'
import type { ThemesResponse } from '@/http-pref-rio-carta-servicos/models/themesResponse'
import {
  mapServiceDetailToPrefRioService,
  mapServiceFilteredItemToServiceDocument,
  mapServiceListItemToServiceDocument,
  mapSubthemeToSubcategory,
  mapThemeToCategory,
} from '@/lib/carta-servicos/mappers'
import { normalizeCategoryName } from '@/lib/carta-servicos/normalize-category-name'
import {
  type CartaServicosThemesWithFilterResponse,
  getFilteredCategoryServices,
} from '@/lib/carta-servicos/themes-filter-response'
import type { Category } from '@/lib/categories'
import type { ReactNode } from 'react'

const CACHE_10MIN = {
  next: { revalidate: 600 },
} as const

function parseCartaServicosPayload<T>(payload: unknown): T | null {
  if (payload === null || payload === undefined) {
    return null
  }

  if (typeof payload === 'string') {
    const trimmed = payload.trim()
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return null
    }

    try {
      return JSON.parse(trimmed) as T
    } catch {
      return null
    }
  }

  if (typeof payload === 'object') {
    return payload as T
  }

  return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getThemesFromPayload(payload: unknown): Theme[] {
  const body = parseCartaServicosPayload<
    ThemesResponse | CartaServicosThemesWithFilterResponse
  >(payload)
  if (!body || !isRecord(body) || !Array.isArray(body.data)) {
    return []
  }

  return body.data
}

export async function fetchCartaServicosCategories(
  getIconForCategory: (name: string) => ReactNode
): Promise<Category[]> {
  const response = await getThemes(
    { include_empty: false, per_page: 100 },
    { ...CACHE_10MIN, next: { ...CACHE_10MIN.next, tags: ['categories'] } }
  )

  if (response.status !== 200 || !response.data) {
    throw new Error(`Failed to fetch themes: ${response.status}`)
  }

  const themes = getThemesFromPayload(response.data)

  return themes
    .map(theme => mapThemeToCategory(theme, getIconForCategory))
    .filter(category => category.quantidadeServicos > 0)
    .sort((a, b) => b.quantidadeServicos - a.quantidadeServicos)
}

export async function resolveThemeSlug(
  categorySlugOrName: string,
  getIconForCategory: (name: string) => ReactNode
): Promise<{ themeSlug: string; categoryName: string } | null> {
  const decoded = decodeURIComponent(categorySlugOrName)
  const normalized = normalizeCategoryName(decoded)

  const categories = await fetchCartaServicosCategories(getIconForCategory)
  const match = categories.find(
    category =>
      category.categorySlug === decoded ||
      category.categorySlug === normalized ||
      category.themeSlug === decoded ||
      normalizeCategoryName(category.name) === normalized
  )

  if (!match?.themeSlug) return null

  return { themeSlug: match.themeSlug, categoryName: match.name }
}

export async function fetchCartaServicosServicesByCategory(
  categorySlug: string,
  getIconForCategory: (name: string) => ReactNode
): Promise<{ filtered_category?: ModelsFilteredCategoryResult } | null> {
  const resolved = await resolveThemeSlug(categorySlug, getIconForCategory)
  if (!resolved) return null

  const response = await getThemes(
    {
      filter_category: resolved.themeSlug,
      page: 1,
      per_page: 20,
    },
    {
      ...CACHE_10MIN,
      next: {
        ...CACHE_10MIN.next,
        tags: ['category-services', categorySlug],
      },
    }
  )

  if (response.status !== 200) {
    return null
  }

  const filteredCategory = getFilteredCategoryServices(response.data)
  if (!filteredCategory) {
    return null
  }

  const categoryName = filteredCategory.name ?? resolved.categoryName
  const services = (filteredCategory.services ?? []).map(item =>
    mapServiceFilteredItemToServiceDocument(item, categoryName)
  )

  return {
    filtered_category: {
      name: categoryName,
      page: filteredCategory.page,
      per_page: filteredCategory.per_page,
      services,
      total_services: filteredCategory.total_services,
    },
  }
}

export async function fetchCartaServicosSubcategoriesByCategory(
  categorySlugOrName: string,
  getIconForCategory: (name: string) => ReactNode
): Promise<ModelsSubcategoryResponse | null> {
  const resolved = await resolveThemeSlug(
    categorySlugOrName,
    getIconForCategory
  )
  if (!resolved) return null

  const response = await getSubthemesByTheme(resolved.themeSlug, {
    per_page: 100,
  })

  if (response.status !== 200) return null

  const subthemesBody = parseCartaServicosPayload<{ data?: Subtheme[] }>(
    response.data
  )
  const subthemes = subthemesBody?.data ?? []
  const subcategories = subthemes
    .map(subtheme => mapSubthemeToSubcategory(subtheme, resolved.categoryName))
    .filter(sub => (sub.count ?? 0) > 0)
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))

  return {
    category: resolved.categoryName,
    subcategories,
    total_subcategories: subcategories.length,
  }
}

export async function fetchCartaServicosServicesBySubcategory(
  subcategorySlug: string,
  page = 1,
  perPage = 50
): Promise<ModelsSubcategoryServicesResponse | null> {
  const response = await getServicesBySubtheme(subcategorySlug, {
    page,
    per_page: perPage,
  })

  if (response.status !== 200) return null

  const servicesBody = parseCartaServicosPayload<{
    data?: ServiceListItem[]
    meta?: { page?: number; per_page?: number; total?: number }
  }>(response.data)
  const items = servicesBody?.data ?? []
  const services = items.map(item => mapServiceListItemToServiceDocument(item))

  return {
    subcategory: subcategorySlug,
    page: servicesBody?.meta?.page ?? page,
    per_page: servicesBody?.meta?.per_page ?? perPage,
    total_services: servicesBody?.meta?.total,
    services,
  }
}

export async function fetchCartaServicosServiceBySlug(
  slug: string
): Promise<ModelsPrefRioService | null> {
  const response = await getServiceDetail(slug, {
    ...CACHE_10MIN,
    next: { ...CACHE_10MIN.next, tags: ['service', slug] },
  })

  if (response.status === 404) return null

  if (response.status === 301) {
    const redirectBody = parseCartaServicosPayload<{ redirect?: string }>(
      response.data
    )
    const redirectSlug = redirectBody?.redirect
    if (redirectSlug && redirectSlug !== slug) {
      return fetchCartaServicosServiceBySlug(redirectSlug)
    }
    return null
  }

  const detailBody = parseCartaServicosPayload<{ data?: ServiceDetail }>(
    response.data
  )
  if (response.status !== 200 || !detailBody?.data) {
    console.error(
      `Failed to fetch service ${slug}: Status ${response.status}`,
      response.data
    )
    return null
  }

  return mapServiceDetailToPrefRioService(detailBody.data)
}
