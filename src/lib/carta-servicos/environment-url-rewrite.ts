import {
  isSalesforceServicesEnabled,
  isServiceUrlHmlRewriteEnabled,
} from '@/lib/feature-flags'

/**
 * PALLIATIVE, for specific cases only.
 *
 * The Salesforce database was populated from production, so some service
 * links (e.g. "Acessar serviço" buttons) point to production gateways even
 * when running in staging/localhost. This module rewrites those links to their
 * homologation equivalents so the homologation flow can be tested.
 *
 * The proper fix is to correct the data at the source (Salesforce). If the
 * number of manual entries in {@link URL_OVERRIDES} grows, do not keep
 * maintaining this: fix the Carta de Serviços registry instead.
 *
 * Only active when `FEATURE_SALESFORCE=true` AND `REWRITE_SERVICE_URLS_TO_HML=true`.
 * Never set the second one in production.
 */

/** Production host -> homologation host. Hosts must be lowercase. */
const HOST_MAP: Readonly<Record<string, string>> = {
  'gateway-idrio.apps.rio.gov.br': 'gateway-idrio-hom.apps.rio.gov.br',
  'services-carioca.rio.rj.gov.br': 'services-carioca-hml.rio.rj.gov.br',
  'acesso.processo.rio': 'acessohom.processo.rio',
  'jeap.rio.rj.gov.br': 'jhom.rio.rj.gov.br',
}

const GATEWAY_PROD_HOST = 'gateway-idrio.apps.rio.gov.br'
const GATEWAY_SERVICE_PARAM = 'urlServico'
const MAX_NESTING_DEPTH = 3

/**
 * Full production URL -> full homologation URL, for services whose path also
 * changes between environments (a host swap is not enough). Keys are compared
 * without fragment and trailing slash, with the host in lowercase.
 */
const URL_OVERRIDES: Readonly<Record<string, string>> = {
  'https://services-carioca.rio.rj.gov.br/group/guest/alvara-de-licenca-para-estabelecimento':
    'https://services-carioca-hml.rio.rj.gov.br/group/guest/alvara-consulta-previa-de-local',
}

export function shouldRewriteServiceUrls(): boolean {
  return isSalesforceServicesEnabled() && isServiceUrlHmlRewriteEnabled()
}

function overrideKey(url: URL): string {
  const copy = new URL(url.toString())
  copy.hash = ''
  return copy.toString().replace(/\/$/, '')
}

/** Returns the rewritten URL, or `null` when nothing needs to change. */
function rewriteParsedUrl(url: URL, depth: number): URL | null {
  const override = URL_OVERRIDES[overrideKey(url)]
  if (override) return new URL(override)

  const hostname = url.hostname.toLowerCase()
  let changed = false

  if (hostname === GATEWAY_PROD_HOST && depth < MAX_NESTING_DEPTH) {
    const inner = url.searchParams.get(GATEWAY_SERVICE_PARAM)
    if (inner) {
      const rewrittenInner = rewriteString(inner, depth + 1)
      if (rewrittenInner !== inner) {
        url.searchParams.set(GATEWAY_SERVICE_PARAM, rewrittenInner)
        changed = true
      }
    }
  }

  const mappedHost = HOST_MAP[hostname]
  if (mappedHost) {
    url.hostname = mappedHost
    changed = true
  }

  return changed ? url : null
}

function rewriteString(value: string, depth: number): string {
  const trimmed = value.trim()
  if (!/^https?:\/\//i.test(trimmed)) return value

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return value
  }

  return rewriteParsedUrl(parsed, depth)?.toString() ?? value
}

/**
 * Returns the homologation equivalent of a production service URL, or the
 * input untouched when the rewrite is disabled, the value is not an http(s)
 * URL (relative, `mailto:`, `tel:`, `#preview`, invalid) or the host is not mapped.
 */
export function rewriteServiceUrlForEnvironment<T extends string | undefined>(
  url: T
): T {
  if (!url || !shouldRewriteServiceUrls()) return url
  return rewriteString(url, 0) as T
}
