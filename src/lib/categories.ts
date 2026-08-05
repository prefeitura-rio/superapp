import serviceIcon from '@/constants/bucket'
import { CARTA_SERVICOS_API_ENABLED } from '@/constants/venvs'
import { getApiV1Categories } from '@/http-busca-search/categories/categories'
import { GetApiV1CategoriesOrder } from '@/http-busca-search/models/getApiV1CategoriesOrder'
import { GetApiV1CategoriesSortBy } from '@/http-busca-search/models/getApiV1CategoriesSortBy'
import { fetchCartaServicosCategories } from '@/lib/carta-servicos/fetch'
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

async function fetchCategoriesFromBuscaSearch(
  options?: RequestInit
): Promise<Category[]> {
  const response = await getApiV1Categories(
    {
      sort_by: GetApiV1CategoriesSortBy.popularity,
      order: GetApiV1CategoriesOrder.desc,
      include_inactive: false,
      include_empty: false,
      per_page: 40,
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

  return response.data.categories
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
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const signal = AbortSignal.timeout(CATEGORIES_FETCH_TIMEOUT_MS)

    if (CARTA_SERVICOS_API_ENABLED) {
      return await fetchCartaServicosCategories(getIconForCategory, { signal })
    }

    return await fetchCategoriesFromBuscaSearch({ signal })
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Timeout / network / API errors: render page without categories
    // instead of keeping the user stuck on the route loading UI.
    return []
  }
}
