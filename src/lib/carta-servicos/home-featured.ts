import { iptuIcon, multasIcon } from '@/constants/bucket'
import { MOST_ACCESSED_SERVICES } from '@/constants/most-accessed-services'
import { getApiPublicThemes } from '@/http-app-catalogo/carta/carta'
import type { ModelsCartaHomeFeatured } from '@/http-app-catalogo/models/modelsCartaHomeFeatured'
import { parseCartaServicosPayload } from '@/lib/carta-servicos/fetch'
import { getCategoryIconSrc } from '@/lib/categories'
import { isSalesforceServicesEnabled } from '@/lib/feature-flags'

const CACHE_10MIN = {
  next: { revalidate: 600, tags: ['home-featured'] },
}

/**
 * Slug canônico da ficha de débitos de IPTU em dívida ativa na app-catalogo.
 * Com `NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA`, o card continua em `/divida-ativa`.
 */
const DIVIDA_ATIVA_SERVICE_SLUG = 'consulta-de-debitos-de-iptu-em-divida-ativa'

/** Destaques da API na home. O sexto card é a Dívida Ativa fixa. */
const HOME_FEATURED_FROM_API = 5

/** Ícones da faixa antiga, no lugar do ícone genérico do tema. */
const FEATURED_ICON_BY_SLUG: Record<string, string> = {
  'iptu-2026': iptuIcon,
  'fiscalizacao-de-estacionamento-irregular-de-veiculo': multasIcon,
}

export interface MostAccessedCard {
  id: string
  href: string
  icon?: string
  title: string
  description: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function featuredHref(
  item: ModelsCartaHomeFeatured,
  dividaAtivaEnabled: boolean
): string {
  if (dividaAtivaEnabled && item.slug === DIVIDA_ATIVA_SERVICE_SLUG) {
    return '/divida-ativa'
  }

  return `/servicos/categoria/${encodeURIComponent(item.themeSlug ?? '')}/${encodeURIComponent(item.slug ?? '')}`
}

/**
 * Ordena por `position` e descarta item sem slug, nome ou tema.
 * `summary` fica de fora: é HTML e o card só mostra o nome.
 */
export function mapHomeFeatured(
  items: ModelsCartaHomeFeatured[],
  options?: { dividaAtivaEnabled?: boolean }
): MostAccessedCard[] {
  const dividaAtivaEnabled =
    options?.dividaAtivaEnabled ??
    process.env.NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA === 'true'

  return items
    .filter(
      (
        item
      ): item is ModelsCartaHomeFeatured & {
        slug: string
        name: string
        themeSlug: string
      } =>
        Boolean(
          item &&
            item.slug?.trim() &&
            item.name?.trim() &&
            item.themeSlug?.trim()
        )
    )
    .slice()
    .sort(
      (a, b) =>
        (a.position ?? Number.POSITIVE_INFINITY) -
        (b.position ?? Number.POSITIVE_INFINITY)
    )
    .map(item => ({
      id: item.slug,
      href: featuredHref(item, dividaAtivaEnabled),
      icon:
        FEATURED_ICON_BY_SLUG[item.slug] ??
        (item.themeName ? getCategoryIconSrc(item.themeName) : undefined),
      title: item.name,
      description: item.themeName ?? '',
    }))
}

/**
 * `null` quando a resposta não traz a lista (erro ou contrato quebrado).
 * Array vazio é curadoria explícita e não é erro.
 */
export async function fetchHomeFeaturedCards(): Promise<
  MostAccessedCard[] | null
> {
  const response = await getApiPublicThemes(
    { include_featured: true, per_page: 100 },
    CACHE_10MIN
  )

  if (response.status !== 200 || !response.data) {
    return null
  }

  const body = parseCartaServicosPayload<{ home_featured?: unknown }>(
    response.data
  )
  if (!body || !isRecord(body) || !Array.isArray(body.home_featured)) {
    return null
  }

  return mapHomeFeatured(body.home_featured as ModelsCartaHomeFeatured[])
}

/**
 * Cinco destaques da API e, no fim, o card de Dívida Ativa que já existia na faixa.
 * Lista vazia da curadoria continua vazia.
 */
function withHardcodedDividaAtiva(
  featured: MostAccessedCard[]
): MostAccessedCard[] {
  if (featured.length === 0) return []

  const dividaAtiva = MOST_ACCESSED_SERVICES.find(
    service => service.id === 'divida-ativa'
  )
  const fromApi = featured
    .filter(
      card =>
        card.id !== DIVIDA_ATIVA_SERVICE_SLUG && card.id !== 'divida-ativa'
    )
    .slice(0, HOME_FEATURED_FROM_API)

  if (!dividaAtiva) return fromApi
  return [...fromApi, dividaAtiva]
}

/**
 * Lista da faixa “Mais acessados”.
 *
 * Flag desligada: constante, sem chamar a app-catalogo.
 * Flag ligada: 5 itens de `home_featured` e, por último, o card fixo de Dívida Ativa.
 * `/servicos` corta em 4 no componente, então não mostra esse card fixo.
 * Falha de rede mantém a constante. Lista vazia da API permanece vazia.
 */
export async function resolveMostAccessedServices(): Promise<
  MostAccessedCard[]
> {
  if (!isSalesforceServicesEnabled()) {
    return MOST_ACCESSED_SERVICES
  }

  try {
    const featured = await fetchHomeFeaturedCards()
    if (featured === null) {
      console.error(
        JSON.stringify({
          scope: 'carta-servicos.home-featured',
          reason: 'fallback',
        })
      )
      return MOST_ACCESSED_SERVICES
    }

    return withHardcodedDividaAtiva(featured)
  } catch (error) {
    console.error(
      JSON.stringify({
        scope: 'carta-servicos.home-featured',
        reason: 'fallback',
        error: error instanceof Error ? error.message : String(error),
      })
    )
    return MOST_ACCESSED_SERVICES
  }
}
