/**
 * Feature flag to enable/disable hardcoded external search links
 * Default: disabled (false)
 * Set NEXT_PUBLIC_ENABLE_HARDCODED_SEARCH_LINKS=true to enable
 */
export const ENABLE_HARDCODED_SEARCH_LINKS =
  process.env.NEXT_PUBLIC_ENABLE_HARDCODED_SEARCH_LINKS === 'true'

/**
 * Preview of a Carta de Serviços draft opened from Salesforce Lightning.
 * Default: disabled. Set PREVIEW_CARTA_SERVICOS_ENABLED=true to expose
 * /servicos/preview and POST /api/preview/servicos. Server-only.
 * Independent of NEXT_PUBLIC_FEATURE_SALESFORCE.
 */
export function isPreviewCartaServicosEnabled(): boolean {
  return process.env.PREVIEW_CARTA_SERVICOS_ENABLED === 'true'
}
