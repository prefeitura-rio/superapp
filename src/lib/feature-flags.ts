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
