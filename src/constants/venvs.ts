/**
 * Feature flag to enable/disable hardcoded external search links
 * Default: disabled (false)
 * Set NEXT_PUBLIC_ENABLE_HARDCODED_SEARCH_LINKS=true to enable
 */
export const ENABLE_HARDCODED_SEARCH_LINKS =
  process.env.NEXT_PUBLIC_ENABLE_HARDCODED_SEARCH_LINKS === 'true'

/**
 * Uses Pref.Rio Carta de Serviços API (MuleSoft/Salesforce) instead of
 * app-busca-search for categories, subcategories and service detail.
 * Default: disabled — production stays on busca-search until explicitly enabled.
 * Set CARTA_SERVICOS_API_ENABLED=true to enable (server-only).
 */
export const CARTA_SERVICOS_API_ENABLED =
  process.env.CARTA_SERVICOS_API_ENABLED === 'true'
