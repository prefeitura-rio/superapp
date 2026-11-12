export const PREVIEW_WINDOW_NAME = 'prefrio-preview'
export const PREVIEW_READY_TYPE = 'prefrio-preview-ready'
export const PREVIEW_DATA_TYPE = 'prefrio-preview-data'
export const PREVIEW_ERROR_TYPE = 'prefrio-preview-error'
export const PREVIEW_READY_RETRY_MS = 300
export const PREVIEW_READY_TIMEOUT_MS = 5_000
export const PREVIEW_MAX_BODY_BYTES = 1_000_000

const PREVIEW_NONCE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const PREVIEW_ERROR_CODES = [
  'payload_too_large',
  'invalid_payload',
  'timeout',
  'rate_limited',
] as const

export type PreviewErrorCode = (typeof PREVIEW_ERROR_CODES)[number]

export interface PreviewReadyMessage {
  type: typeof PREVIEW_READY_TYPE
  nonce: string
}

export interface PreviewDataMessage {
  type: typeof PREVIEW_DATA_TYPE
  nonce: string
  payload: unknown
}

export interface PreviewErrorMessage {
  type: typeof PREVIEW_ERROR_TYPE
  nonce: string
  code: PreviewErrorCode
}

export function parseSalesforcePreviewOrigins(
  raw: string | undefined
): string[] {
  if (!raw) return []

  const origins: string[] = []
  for (const part of raw.split(',')) {
    const candidate = part.trim()
    if (!candidate || origins.includes(candidate)) continue

    try {
      const url = new URL(candidate)
      const isHttp = url.protocol === 'https:' || url.protocol === 'http:'
      if (!isHttp || url.origin !== candidate) continue
      origins.push(url.origin)
    } catch {
      // Ignore values that are not absolute origins.
    }
  }

  return origins
}

export function isPreviewNonce(value: string): boolean {
  return PREVIEW_NONCE.test(value)
}

/** Hash of `/servicos/preview#<uuid>`. Returns null when it is not a UUID. */
export function readPreviewNonce(hash: string): string | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  let value = raw.trim()
  if (!value) return null

  try {
    value = decodeURIComponent(value).trim()
  } catch {
    return null
  }

  return isPreviewNonce(value) ? value : null
}

export function isPreviewDataMessage(
  data: unknown
): data is PreviewDataMessage {
  if (!data || typeof data !== 'object') return false
  const record = data as Record<string, unknown>
  return (
    record.type === PREVIEW_DATA_TYPE &&
    typeof record.nonce === 'string' &&
    isPreviewNonce(record.nonce) &&
    'payload' in record
  )
}

/**
 * Lightning Web Security wraps LWC objects in Proxy, and postMessage cannot
 * structured-clone them. Salesforce may send the same envelope as a JSON
 * string. Strings over the body cap are ignored without parsing.
 */
export function readPreviewDataMessage(
  data: unknown
): PreviewDataMessage | null {
  let value = data
  if (typeof value === 'string') {
    if (value.length > PREVIEW_MAX_BODY_BYTES) return null
    try {
      value = JSON.parse(value)
    } catch {
      return null
    }
  }
  return isPreviewDataMessage(value) ? value : null
}

export function previewErrorMessage(
  nonce: string,
  code: PreviewErrorCode
): PreviewErrorMessage {
  return { type: PREVIEW_ERROR_TYPE, nonce, code }
}
