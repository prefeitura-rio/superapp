import type { ModelsPrefRioService } from '@/http-busca-search/models/modelsPrefRioService'
import type { ModelsSubcategory } from '@/http-busca-search/models/modelsSubcategory'

/** Subcategory with optional API slug (Carta de Serviços uses slug-based lookups). */
export type AppSubcategory = ModelsSubcategory & {
  slug?: string
}

export interface ServiceTicketFlags {
  allowTicketSubmission?: boolean
  allowsAnonymity?: boolean
  activeCategoryConfigId?: string
}

export interface PrefRioServiceWithFlags extends ModelsPrefRioService {
  ticketFlags?: ServiceTicketFlags
  /** `data.articleId` da Carta (Id da versão). Só existe com `FEATURE_SALESFORCE`. */
  articleId?: string
}

/** Artigo que recebe o voto "Este conteúdo foi útil?". */
export interface ServiceRatingTarget {
  slug: string
  articleId: string
}

/** Carta de Serviços publishes HTML. app-busca-search still publishes markdown. */
export type ServiceContentFormat = 'html' | 'markdown'
