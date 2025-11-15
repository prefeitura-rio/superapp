import serviceIcon from '@/constants/bucket'
import { getApiV1Categories } from '@/http-busca-search/categories/categories'
import { GetApiV1CategoriesOrder } from '@/http-busca-search/models/getApiV1CategoriesOrder'
import { GetApiV1CategoriesSortBy } from '@/http-busca-search/models/getApiV1CategoriesSortBy'
import Image from 'next/image'
import { type ReactNode, createElement } from 'react'

// App Types
export interface Category {
  name: string
  icon: ReactNode
  categorySlug: string
  relevanciaMedia: number
  quantidadeServicos: number
  tag?: string
}

// Icon mapping based on category name (normalized to lowercase, no accents)
function normalizeCategoryName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .trim()
}

// Icon mapping based on normalized category name
const iconMap: Record<string, any> = {
  ambiente: serviceIcon.ambienteIcon,
  animais: serviceIcon.animaisIcon,
  cidadania: serviceIcon.cidadaniaIcon,
  cidade: serviceIcon.cidadeIcon,
  cultura: serviceIcon.culturaIcon,
  educacao: serviceIcon.educacaoIcon,
  emergencia: serviceIcon.emergenciaIcon,
  esportes: serviceIcon.esporteIcon,
  familia: serviceIcon.familiaIcon,
  taxas: serviceIcon.impostoIcon,
  licencas: serviceIcon.licencaIcon,
  saude: serviceIcon.saudeIcon,
  seguranca: serviceIcon.segurancaIcon,
  servidor: serviceIcon.servidorIcon,
  trabalho: serviceIcon.trabalhoIcon,
  transporte: serviceIcon.transporteIcon,
}

function getIconForCategory(categoryName: string): ReactNode {
  const normalized = normalizeCategoryName(categoryName)
  const iconSrc = iconMap[normalized]

  if (!iconSrc) {
    // Return null if no mapping found
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

export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await getApiV1Categories(
      {
        sort_by: GetApiV1CategoriesSortBy.popularity,
        order: GetApiV1CategoriesOrder.desc,
        include_inactive: true,
      },
      {
        // Cache the response for 10 minutes
        next: {
          revalidate: 600,
          tags: ['categories'],
        },
      }
    )

    if (response.status !== 200 || !response.data.categories) {
      throw new Error(`Failed to fetch categories: ${response.status}`)
    }

    // Transform API data to app format
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
      .filter(cat => cat.quantidadeServicos > 0) // Filter out empty categories
      .sort((a, b) => b.relevanciaMedia - a.relevanciaMedia) // Sort by popularity descending

    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Return empty array on error
    return []
  }
}
