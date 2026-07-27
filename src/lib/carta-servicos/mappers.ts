import type { ModelsButton } from '@/http-busca-search/models/modelsButton'
import type { ModelsPrefRioService } from '@/http-busca-search/models/modelsPrefRioService'
import type { ModelsServiceDocument } from '@/http-busca-search/models/modelsServiceDocument'
import type { Channel } from '@/http-pref-rio-carta-servicos/models/channel'
import { ChannelType } from '@/http-pref-rio-carta-servicos/models/channelType'
import type { ServiceDetail } from '@/http-pref-rio-carta-servicos/models/serviceDetail'
import type { ServiceFilteredItem } from '@/http-pref-rio-carta-servicos/models/serviceFilteredItem'
import type { ServiceListItem } from '@/http-pref-rio-carta-servicos/models/serviceListItem'
import type { Subtheme } from '@/http-pref-rio-carta-servicos/models/subtheme'
import type { Theme } from '@/http-pref-rio-carta-servicos/models/theme'
import { normalizeCategoryName } from '@/lib/carta-servicos/normalize-category-name'
import type { AppSubcategory } from '@/lib/carta-servicos/types'
import type { Category } from '@/lib/categories'
import type { ReactNode } from 'react'

function mapChannelsToPresenciais(channels?: Channel[]): string[] {
  if (!channels) return []

  return channels
    .filter(channel => channel.type === ChannelType.Presencial)
    .map(channel => channel.endereco ?? channel.titulo ?? '')
    .filter(Boolean)
}

function mapChannelsToDigitais(channels?: Channel[]): string[] {
  if (!channels) return []

  return channels
    .filter(
      channel =>
        channel.type === ChannelType.Digital ||
        channel.type === ChannelType.Telefone
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

function mapArticleStatusToPublished(
  articleStatus?: ServiceDetail['articleStatus']
): number {
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
  item: ServiceListItem,
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

export function mapServiceFilteredItemToServiceDocument(
  item: ServiceFilteredItem,
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
  subtheme: Subtheme,
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
  theme: Theme,
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
  detail: ServiceDetail
): ModelsPrefRioService {
  const orgUnit = detail.responsibleOrgUnitShortName
    ? `${detail.responsibleOrgUnit ?? ''} (${detail.responsibleOrgUnitShortName})`.trim()
    : detail.responsibleOrgUnit

  const buttons: ModelsButton[] | undefined = detail.buttons?.map(button => ({
    titulo: button.title,
    descricao: button.description,
    url_service: button.url,
    ordem: button.order,
    is_enabled: true,
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
