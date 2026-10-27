/**
 * Feature flag to enable/disable hardcoded external search links
 * Default: disabled (false)
 * Set NEXT_PUBLIC_ENABLE_HARDCODED_SEARCH_LINKS=true to enable
 */
export const ENABLE_HARDCODED_SEARCH_LINKS =
  process.env.NEXT_PUBLIC_ENABLE_HARDCODED_SEARCH_LINKS === 'true'

/**
 * Uses app-catalogo Carta de Serviços endpoints instead of app-busca-search
 * for categories, subcategories, service lists and service detail.
 * Default: disabled — production stays on busca-search until explicitly enabled.
 * Set CARTA_SERVICOS_API_ENABLED=true to enable (server-only).
 * Debts and the temporary "Mais acessados" composition: docs/carta-servicos-catalogo.md.
 */
export const CARTA_SERVICOS_API_ENABLED =
  process.env.CARTA_SERVICOS_API_ENABLED === 'true'

/**
 * Preview of a Carta de Serviços draft opened from Salesforce Lightning.
 * Default: disabled. Set PREVIEW_CARTA_SERVICOS_ENABLED=true to expose
 * /servicos/preview and POST /api/preview/servicos. Server-only.
 * Independent of CARTA_SERVICOS_API_ENABLED.
 */
export function isPreviewCartaServicosEnabled(): boolean {
  return process.env.PREVIEW_CARTA_SERVICOS_ENABLED === 'true'
}
