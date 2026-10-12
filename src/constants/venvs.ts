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
