/**
 * `NEXT_PUBLIC_FEATURE_FLAG` is a comma-separated list of enabled features.
 * When the value is `'false'` (or absent), all features are treated as enabled
 * (staging / local). In production builds, only listed features are on.
 */
export function isFeatureEnabled(feature: string): boolean {
  const flag = process.env.NEXT_PUBLIC_FEATURE_FLAG ?? 'false'
  if (flag === 'false') return true
  return flag
    .split(',')
    .map(s => s.trim())
    .includes(feature)
}

/**
 * Controls Salesforce/MuleSoft-backed services and citizen-support surfaces.
 * Keep this as a strict boolean kill switch so an unset flag is safely
 * disabled in production.
 *
 * Server-side only (`FEATURE_SALESFORCE`). Value is read at runtime from
 * `process.env`, so changes in Infisical take effect after a pod restart
 * without requiring a new build or deploy.
 */
export function isSalesforceServicesEnabled(): boolean {
  return process.env.FEATURE_SALESFORCE === 'true'
}

/**
 * LOCAL/TEST ONLY. Rewrites production service URLs coming from the Carta de
 * Serviços (Salesforce data is a copy of production) to their homologation
 * equivalents. See `src/lib/carta-servicos/environment-url-rewrite.ts`.
 *
 * Strict boolean: only the exact value `'true'` enables it, so an unset
 * variable is safely disabled (production must never set it). It only takes
 * effect together with `FEATURE_SALESFORCE=true`.
 *
 * Server-side only (`REWRITE_SERVICE_URLS_TO_HML`). Read at runtime from
 * `process.env`.
 */
export function isServiceUrlHmlRewriteEnabled(): boolean {
  return process.env.REWRITE_SERVICE_URLS_TO_HML === 'true'
}

/**
 * Controls whether the "Solicitações" section cards appear on the home page.
 * Independent of `FEATURE_SALESFORCE`: requires both flags to be `'true'` to
 * show the section. Allows hiding the home block while keeping the full
 * Salesforce integration active (routes, API, search, banner).
 *
 * Server-side only (`FEATURE_HOME_SOLICITACOES`). Value is read at runtime from
 * `process.env`, so changes in Infisical take effect after a pod restart
 * without requiring a new build or deploy.
 */
export function isHomeSolicitacoesEnabled(): boolean {
  return process.env.FEATURE_HOME_SOLICITACOES === 'true'
}

/**
 * Controls the home banner carousel v3 (welcome banner + jobs + courses).
 * Off: the home keeps the previous suggestion banners (mobile scroll list and
 * desktop swiper), exactly as before the carousel was introduced.
 *
 * Strict boolean: an unset flag is safely disabled (production).
 *
 * Server-side only (`FEATURE_HOME_BANNERS_V3`). Read at runtime from
 * `process.env` by the home Server Component, so changes in Infisical take
 * effect after a pod restart without requiring a new build or deploy.
 */
export function isHomeBannersV3Enabled(): boolean {
  return process.env.FEATURE_HOME_BANNERS_V3 === 'true'
}

/**
 * Controls the legacy 1746 (SGRC) history served by app-rmi: the "abertas até
 * 26/11/2026" option in Minhas Solicitações and the lookup of `RIO-12345678-9`
 * protocols. Off: those surfaces show only Salesforce data, the SGRC routes
 * answer 404 without calling the RMI, and the wallet keeps the legacy
 * "Cuidados com a Cidade" card.
 *
 * Only takes effect together with `FEATURE_SALESFORCE=true` (the screens do not
 * exist without it). Strict boolean: an unset flag is safely disabled.
 *
 * Server-side only (`FEATURE_SGRC_HISTORICO`). Value is read at runtime from
 * `process.env`, so changes in Infisical take effect after a pod restart
 * without requiring a new build or deploy.
 */
export function isSgrcHistoricoEnabled(): boolean {
  return process.env.FEATURE_SGRC_HISTORICO === 'true'
}

/**
 * `NEXT_PUBLIC_ACCESSIBILITY_ENABLED` turns the accessibility plugin on only
 * when it is exactly `'true'`. Builds receive the value as a string, so a plain
 * truthiness check would also enable the plugin for `'false'` (production).
 */
export function isAccessibilityPluginEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ACCESSIBILITY_ENABLED === 'true'
}

/**
 * `NEXT_PUBLIC_VLIBRAS_ENABLED` turns the VLibras widget on only when it is
 * exactly `'true'`. Builds receive the value as a string, so a plain
 * truthiness check would also enable the widget for `'false'` (production).
 */
export function isVLibrasEnabled(): boolean {
  return process.env.NEXT_PUBLIC_VLIBRAS_ENABLED === 'true'
}
