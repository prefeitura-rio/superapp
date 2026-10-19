import type { ClientsCartaChannel } from '@/http-app-catalogo/models/clientsCartaChannel'
import type { ClientsCartaServiceDetail } from '@/http-app-catalogo/models/clientsCartaServiceDetail'
import type { ModelsCartaServiceSummary } from '@/http-app-catalogo/models/modelsCartaServiceSummary'
import type { ModelsCartaSubtheme } from '@/http-app-catalogo/models/modelsCartaSubtheme'
import type { ModelsCartaTheme } from '@/http-app-catalogo/models/modelsCartaTheme'
import type { ModelsButton } from '@/http-busca-search/models/modelsButton'
import type { ModelsPrefRioService } from '@/http-busca-search/models/modelsPrefRioService'
import type { ModelsServiceDocument } from '@/http-busca-search/models/modelsServiceDocument'
import { normalizeCategoryName } from '@/lib/carta-servicos/normalize-category-name'
import type { AppSubcategory } from '@/lib/carta-servicos/types'
import type { Category } from '@/lib/categories'
import type { ReactNode } from 'react'

function isChannelType(channel: ClientsCartaChannel, type: string): boolean {
  return channel.type?.toLowerCase() === type.toLowerCase()
}

function mapChannelsToPresenciais(channels?: ClientsCartaChannel[]): string[] {
  if (!channels) return []

  return channels
    .filter(channel => isChannelType(channel, 'Presencial'))
    .map(channel => channel.endereco ?? channel.titulo ?? '')
    .filter(Boolean)
}

function mapChannelsToDigitais(channels?: ClientsCartaChannel[]): string[] {
  if (!channels) return []

  return channels
    .filter(
      channel =>
        isChannelType(channel, 'Digital') || isChannelType(channel, 'Telefone')
    )
    .map(channel => {
      if (channel.whatsappLink) return channel.whatsappLink
      if (channel.value && channel.channelType) {
        return `${channel.channelType}: ${channel.value}`
      }
      return channel.value ?? channel.titulo ?? ''
    })
    .filter(Boolean)
}

function mapArticleStatusToPublished(articleStatus?: string): number {
  if (articleStatus === 'Draft') return 0
  // MuleSoft often returns null for published services exposed on the public API
  return 1
}

function isoToUnixSeconds(iso?: string): number | undefined {
  if (!iso) return undefined
  const ms = Date.parse(iso)
  return Number.isNaN(ms) ? undefined : Math.floor(ms / 1000)
}

export function mapServiceListItemToServiceDocument(
  item: ModelsCartaServiceSummary,
  categoryName?: string
): ModelsServiceDocument {
  return {
    id: item.serviceCatalogId ?? item.articleId ?? item.slug,
    slug: item.slug,
    title: item.name,
    description: item.summary ?? '',
    category: categoryName,
    status: item.articleStatus === 'Draft' ? 0 : 1,
  }
}

export function mapSubthemeToSubcategory(
  subtheme: ModelsCartaSubtheme,
  categoryName?: string
): AppSubcategory {
  return {
    name: subtheme.name,
    slug: subtheme.slug,
    count: subtheme.publishedServices,
    popularity_score: subtheme.publishedServices,
    category: categoryName,
  }
}

export function mapThemeToCategory(
  theme: ModelsCartaTheme,
  getIconForCategory: (name: string) => ReactNode
): Category {
  const name = theme.name ?? ''
  const themeSlug =
    theme.slug ?? normalizeCategoryName(name).replace(/\s+/g, '-')
  return {
    name,
    icon: getIconForCategory(name),
    categorySlug: normalizeCategoryName(name),
    themeSlug,
    relevanciaMedia: theme.publishedServices ?? 0,
    quantidadeServicos: theme.publishedServices ?? 0,
  }
}

export function mapServiceDetailToPrefRioService(
  detail: ClientsCartaServiceDetail
): ModelsPrefRioService {
  const orgUnit = detail.responsibleOrgUnitShortName
    ? `${detail.responsibleOrgUnit ?? ''} (${detail.responsibleOrgUnitShortName})`.trim()
    : detail.responsibleOrgUnit

  const buttons: ModelsButton[] | undefined = detail.buttons?.map(button => ({
    titulo: button.title,
    descricao: button.description,
    url_service: button.url,
    ordem: button.order,
    is_enabled: button.enabled !== false,
  }))

  return {
    id: detail.serviceCatalogId ?? detail.articleId ?? detail.slug,
    slug: detail.slug,
    slug_history: detail.slugHistory,
    nome_servico: detail.name ?? '',
    resumo: detail.info?.summary ?? '',
    descricao_completa: detail.info?.fullDescription ?? '',
    custo_servico: detail.info?.cost ?? '',
    tempo_atendimento: detail.info?.serviceDeadline ?? '',
    tema_geral: detail.themeName ?? '',
    sub_categoria: detail.subthemeName,
    orgao_gestor: orgUnit ? [orgUnit] : [],
    instrucoes_solicitante: detail.howToRequest?.instructions,
    resultado_solicitacao: detail.howToRequest?.serviceResult ?? '',
    documentos_necessarios: detail.howToRequest?.requiredDocs,
    servico_nao_cobre: detail.howToRequest?.exclusions ?? undefined,
    publico_especifico: detail.info?.targetAudience,
    legislacao_relacionada: detail.legislation
      ?.map(item => item.titulo ?? '')
      .filter(Boolean),
    canais_presenciais: mapChannelsToPresenciais(detail.channels),
    canais_digitais: mapChannelsToDigitais(detail.channels),
    buttons,
    is_free: detail.info?.isFree,
    status: mapArticleStatusToPublished(detail.articleStatus),
    last_update: isoToUnixSeconds(detail.lastModifiedDate),
    created_at: isoToUnixSeconds(detail.createdDate),
    published_at: isoToUnixSeconds(detail.lastPublishedDate),
    autor: '',
  }
}
