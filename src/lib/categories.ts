import Image from 'next/image'
import { type ReactNode, createElement } from 'react'

// Import PNG icons
import ambienteIcon from '@/assets/icons/png/ambiente-icon.png'
import animaisIcon from '@/assets/icons/png/animais-icon.png'
import cidadaniaIcon from '@/assets/icons/png/cidadania-icon.png'
import cidadeIcon from '@/assets/icons/png/cidade-icon.png'
import culturaIcon from '@/assets/icons/png/cultura-icon.png'
import educacaoIcon from '@/assets/icons/png/educacao-icon.png'
import emergenciaIcon from '@/assets/icons/png/emergencia-icon.png'
import esporteIcon from '@/assets/icons/png/esporte-icon.png'
import familiaIcon from '@/assets/icons/png/familia-icon.png'
import impostoIcon from '@/assets/icons/png/imposto-icon.png'
import licencaIcon from '@/assets/icons/png/licenca-icon.png'
import saudeIcon from '@/assets/icons/png/saude-icon.png'
import segurancaIcon from '@/assets/icons/png/seguranca-icon.png'
import servidorIcon from '@/assets/icons/png/servidor-icon.png'
import trabalhoIcon from '@/assets/icons/png/trabalho-icon.png'
import transporteIcon from '@/assets/icons/png/transporte-icon.png'

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
  ambiente: ambienteIcon,
  animais: animaisIcon,
  cidadania: cidadaniaIcon,
  cidade: cidadeIcon,
  cultura: culturaIcon,
  educacao: educacaoIcon,
  emergencia: emergenciaIcon,
  esportes: esporteIcon,
  familia: familiaIcon,
  taxas: impostoIcon,
  licencas: licencaIcon,
  saude: saudeIcon,
  seguranca: segurancaIcon,
  servidor: servidorIcon,
  trabalho: trabalhoIcon,
  transporte: transporteIcon,
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

export async function fetchCategories(
  recaptchaToken?: string
): Promise<Category[]> {
  try {
    const headers: HeadersInit = {}

    // Add reCAPTCHA token if provided
    if (recaptchaToken) {
      headers['X-Recaptcha-Token'] = recaptchaToken
    }

    // Use absolute URL for server-side fetching
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/categories`, {
      headers,
      next: { revalidate: 86400 }, // Cache for 1 day
    })

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
