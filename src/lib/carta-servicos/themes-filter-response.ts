import type { PaginationMeta } from '@/http-pref-rio-carta-servicos/models/paginationMeta'
import type { ServiceFilteredItem } from '@/http-pref-rio-carta-servicos/models/serviceFilteredItem'
import type { Theme } from '@/http-pref-rio-carta-servicos/models/theme'

/** Shape returned by GET /themes?filter_category= (MuleSoft runtime). */
export type CartaServicosThemesWithFilterResponse = {
  filtered_category?: {
    name?: string
    slug?: string
    page?: number
    per_page?: number
    total_services?: number
    services?: ServiceFilteredItem[]
  }
  meta?: PaginationMeta
  /** All themes (same as unfiltered list). */
  data?: Theme[]
}

export function getFilteredCategoryServices(
  payload: unknown
): CartaServicosThemesWithFilterResponse['filtered_category'] | null {
  if (payload === null || payload === undefined) {
    return null
  }

  let body: unknown = payload
  if (typeof payload === 'string') {
    const trimmed = payload.trim()
    if (!trimmed.startsWith('{')) return null
    try {
      body = JSON.parse(trimmed)
    } catch {
      return null
    }
  }

  if (typeof body !== 'object' || body === null) {
    return null
  }

  const filtered = (body as CartaServicosThemesWithFilterResponse)
    .filtered_category
  if (!filtered || !Array.isArray(filtered.services)) {
    return null
  }

  return filtered
}
