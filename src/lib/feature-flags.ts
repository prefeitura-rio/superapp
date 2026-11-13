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
 */
export function isSalesforceServicesEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FEATURE_SALESFORCE === 'true'
}

/**
 * The SGRC history ("Chamados antigos") has no real integration yet: the only
 * data source is the fixed mock in `src/lib/chamados/mock-sgrc.ts`, which is
 * the same for every citizen. It is served only when the explicit chamados
 * mock mode is on (`NEXT_PUBLIC_USE_MOCK_CHAMADOS === 'true'`, off in staging
 * and production builds), never to real citizens.
 */
export function isSgrcHistoryMockEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_CHAMADOS === 'true'
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
