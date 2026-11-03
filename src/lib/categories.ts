import serviceIcon from '@/constants/bucket'
import { CARTA_SERVICOS_API_ENABLED } from '@/constants/venvs'
import { getApiV1Categories } from '@/http-busca-search/categories/categories'
import { GetApiV1CategoriesOrder } from '@/http-busca-search/models/getApiV1CategoriesOrder'
import { GetApiV1CategoriesSortBy } from '@/http-busca-search/models/getApiV1CategoriesSortBy'
import { fetchCartaServicosCategoryCatalog } from '@/lib/carta-servicos/fetch'
import { normalizeCategoryName } from '@/lib/carta-servicos/normalize-category-name'
import Image from 'next/image'
import { type ReactNode, createElement } from 'react'

export { normalizeCategoryName }

// App Types
export interface Category {
  name: string
  icon: ReactNode
  categorySlug: string
  relevanciaMedia: number
  quantidadeServicos: number
  tag?: string
  /** Theme slug from Carta de Serviços API (when CARTA_SERVICOS_API_ENABLED). */
  themeSlug?: string
}

// Icon mapping based on normalized category name
const iconMap: Record<string, string> = {
  'meio ambiente': serviceIcon.ambienteIcon,
  animais: serviceIcon.animaisIcon,
  'central anticorrupcao': serviceIcon.anticorrupcaoIcon,
  cidadania: serviceIcon.cidadaniaIcon,
  cidade: serviceIcon.cidadeIcon,
  cultura: serviceIcon.culturaIcon,
  cursos: serviceIcon.cursosIcon,
  'defesa civil': serviceIcon.trabalhoIcon,
  educacao: serviceIcon.educacaoIcon,
  emergencia: serviceIcon.emergenciaIcon,
  esportes: serviceIcon.esporteIcon,
  familia: serviceIcon.familiaIcon,
  'lei de acesso a informacao': serviceIcon.laiIcon,
  'lei de acesso a informacao (lai)': serviceIcon.laiIcon,
  lai: serviceIcon.laiIcon,
  'lei geral de protecao de dados (lgpd)': serviceIcon.lgpdIcon,
  lgpd: serviceIcon.lgpdIcon,
  taxas: serviceIcon.impostoIcon,
  tributos: serviceIcon.impostoIcon,
  licencas: serviceIcon.licencaIcon,
  obras: serviceIcon.obrasIcon,
  'ordem publica': serviceIcon.ordemPublicaIcon,
  ouvidoria: serviceIcon.ouvidoriaIcon,
  peticionamentos: serviceIcon.peticionamentosIcon,
  saude: serviceIcon.saudeIcon,
  seguranca: serviceIcon.segurancaIcon,
  servidor: serviceIcon.servidorIcon,
  trabalho: serviceIcon.trabalhoIcon,
  transito: serviceIcon.transitoIcon,
  transporte: serviceIcon.transporteIcon,
}

export function getIconForCategory(categoryName: string): ReactNode {
  const normalized = normalizeCategoryName(categoryName)
  const iconSrc = iconMap[normalized]

  if (!iconSrc) {
    return null
  }

  return createElement(Image, {
    src: iconSrc,
    alt: categoryName,
    width: 48,
    height: 48,
    className: 'w-12 h-12',
  })
}

/** Fail fast so RSC pages (home/serviços) don't stay on loading.tsx. */
const CATEGORIES_FETCH_TIMEOUT_MS = 4_000

const BUSCA_CATEGORIES_PER_PAGE = 40

/** Categories read from the catalog, and whether the single page holds all. */
interface CategoryCatalog {
  categories: Category[]
  complete: boolean
}

async function fetchCategoriesFromBuscaSearch(
  options?: RequestInit
): Promise<CategoryCatalog> {
  const response = await getApiV1Categories(
    {
      sort_by: GetApiV1CategoriesSortBy.popularity,
      order: GetApiV1CategoriesOrder.desc,
      include_inactive: false,
      include_empty: false,
      per_page: BUSCA_CATEGORIES_PER_PAGE,
    },
    {
      next: {
        revalidate: 600,
        tags: ['categories'],
      },
      ...options,
    }
  )

  if (response.status !== 200 || !response.data.categories) {
    throw new Error(`Failed to fetch categories: ${response.status}`)
  }

  const received = response.data.categories.length
  const total = response.data.total_categories
  const categories = response.data.categories
    .map((apiCategory): Category => {
      const normalizedSlug = normalizeCategoryName(apiCategory.name || '')
      return {
        name: apiCategory.name || '',
        icon: getIconForCategory(apiCategory.name || ''),
        categorySlug: normalizedSlug,
        relevanciaMedia: apiCategory.popularity_score || 0,
        quantidadeServicos: apiCategory.count || 0,
      }
    })
    .filter(cat => cat.quantidadeServicos > 0)
    .sort((a, b) => b.relevanciaMedia - a.relevanciaMedia)

  return {
    categories,
    complete:
      typeof total === 'number'
        ? total <= received
        : received < BUSCA_CATEGORIES_PER_PAGE,
  }
}

async function fetchCategoryCatalog(): Promise<CategoryCatalog> {
  const signal = AbortSignal.timeout(CATEGORIES_FETCH_TIMEOUT_MS)

  if (CARTA_SERVICOS_API_ENABLED) {
    return await fetchCartaServicosCategoryCatalog(getIconForCategory, {
      signal,
    })
  }

  return await fetchCategoriesFromBuscaSearch({ signal })
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const catalog = await fetchCategoryCatalog()
    return catalog.categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Timeout / network / API errors: render page without categories
    // instead of keeping the user stuck on the route loading UI.
    return []
  }
}

/**
 * Result of looking a category slug up in the catalog. `unavailable` means the
 * catalog could not be read in full (error, timeout, empty list or a page
 * shorter than the total), so the caller cannot tell whether the category
 * exists and must not answer 404.
 */
export type CategoryLookup =
  | { status: 'found'; category: Category }
  | { status: 'not_found' }
  | { status: 'unavailable' }

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function findCategoryInList(
  categories: Category[],
  categorySlug: string,
  complete = true
): CategoryLookup {
  if (categories.length === 0) return { status: 'unavailable' }

  const decoded = safeDecode(categorySlug)
  const normalized = normalizeCategoryName(decoded)
  const category = categories.find(
    cat =>
      cat.categorySlug === decoded ||
      cat.categorySlug === normalized ||
      cat.themeSlug === decoded ||
      normalizeCategoryName(cat.name) === normalized
  )

  if (category) return { status: 'found', category }
  return complete ? { status: 'not_found' } : { status: 'unavailable' }
}

export async function lookupCategoryBySlug(
  categorySlug: string
): Promise<CategoryLookup> {
  let catalog: CategoryCatalog
  try {
    catalog = await fetchCategoryCatalog()
  } catch (error) {
    console.error('Error looking up category:', error)
    return { status: 'unavailable' }
  }
  return findCategoryInList(catalog.categories, categorySlug, catalog.complete)
}
