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
}
