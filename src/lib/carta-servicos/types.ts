import type { ModelsSubcategory } from '@/http-busca-search/models/modelsSubcategory'

/** Subcategory with optional API slug (Carta de Serviços uses slug-based lookups). */
export type AppSubcategory = ModelsSubcategory & {
  slug?: string
}
