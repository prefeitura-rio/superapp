/**
 * Feature flag to enable/disable hardcoded external search links
 * Default: disabled (false)
 * Set NEXT_PUBLIC_ENABLE_HARDCODED_SEARCH_LINKS=true to enable
 */
export const ENABLE_HARDCODED_SEARCH_LINKS =
  process.env.NEXT_PUBLIC_ENABLE_HARDCODED_SEARCH_LINKS === 'true'
