import serviceIcon from '@/constants/bucket'
import Image from 'next/image'
import { type ReactNode, createElement } from 'react'

// API Types
interface ApiCategory {
  nome: string
  nome_normalizado: string
  relevancia_total: number
  quantidade_servicos: number
  relevancia_media: number
}

interface ApiResponse {
  categorias: ApiCategory[]
  total_categorias: number
  ultima_atualizacao: string
}

// App Types
export interface Category {
  name: string
  icon: ReactNode
  categorySlug: string
  relevanciaMedia: number
  quantidadeServicos: number
  tag?: string
}

// Icon mapping based on nome_normalizado
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

function getIconForCategory(nomeNormalizado: string): ReactNode {
  const iconSrc = iconMap[nomeNormalizado]

  if (!iconSrc) {
    // TODO: Return a default icon or null if no mapping found
    return null
  }

  return createElement(Image, {
    src: iconSrc,
    alt: nomeNormalizado,
    width: 48,
    height: 48,
    className: 'w-12 h-12',
  })
}

export async function fetchCategories(): Promise<Category[]> {
  const rootUrl = process.env.NEXT_PUBLIC_BASE_API_URL
  try {
    const response = await fetch(
      `${rootUrl}app-busca-search/api/v1/categorias-relevancia?collections=1746,carioca-digital`,
      {
        cache: 'force-cache',
        next: { revalidate: 86400 }, // Cache for 1 day
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`)
    }

    const data: ApiResponse = await response.json()

    // Transform API data to app format and sort by relevancia_media (desc)
    const categories = data.categorias
      .map(
        (apiCategory): Category => ({
          name: apiCategory.nome,
          icon: getIconForCategory(apiCategory.nome_normalizado),
          categorySlug: apiCategory.nome_normalizado,
          relevanciaMedia: apiCategory.relevancia_media,
          quantidadeServicos: apiCategory.quantidade_servicos,
        })
      )
      .sort((a, b) => b.relevanciaMedia - a.relevanciaMedia) // Sort by relevancia_media descending

    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Return empty array on error, or we could return fallback categories
    return []
  }
}
