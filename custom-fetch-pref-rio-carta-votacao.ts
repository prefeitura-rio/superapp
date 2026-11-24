/**
 * Mutator do client da votação de artigos da Carta (`src/http-pref-rio-carta-votacao`).
 *
 * Só roda no servidor: injeta um token de client credentials do Salesforce, que nunca
 * pode chegar ao browser. Base URL, token URL e credencial ficam em configuração, para
 * que a ida da rota ao MuleSoft seja só troca de env.
 *
 * O token de client credentials do Salesforce não traz `expires_in`. Ele fica em cache
 * por processo e é renovado uma única vez quando a plataforma responde
 * `401 INVALID_SESSION_ID`.
 */

const REQUEST_TIMEOUT_MS = 10_000

let cachedToken: string | null = null
let pendingToken: Promise<string> | null = null

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} environment variable is not set.`)
  return value
}

const getUrl = (contextUrl: string): string => {
  const baseUrl = requireEnv('SALESFORCE_VOTACAO_API_URL')
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const normalizedContextUrl = contextUrl.startsWith('/')
    ? contextUrl.slice(1)
    : contextUrl

  return new URL(normalizedContextUrl, normalizedBaseUrl).toString()
}

async function requestToken(): Promise<string> {
  const response = await fetch(requireEnv('SALESFORCE_VOTACAO_TOKEN_URL'), {
    method: 'POST',
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: requireEnv('SALESFORCE_VOTACAO_CLIENT_ID'),
      client_secret: requireEnv('SALESFORCE_VOTACAO_CLIENT_SECRET'),
    }),
  })

  const body = (await response.json().catch(() => null)) as {
    access_token?: string
    error?: string
  } | null

  if (!response.ok || !body?.access_token) {
    throw new Error(
      `Salesforce token request failed: HTTP ${response.status} ${body?.error ?? ''}`.trim()
    )
  }

  return body.access_token
}

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken
  if (!pendingToken) {
    pendingToken = requestToken()
      .then(token => {
        cachedToken = token
        return token
      })
      .finally(() => {
        pendingToken = null
      })
  }
  return pendingToken
}

function parseJsonText(text: string): unknown {
  const trimmed = text.trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return text
  try {
    return JSON.parse(trimmed)
  } catch {
    return text
  }
}

/** O Apex responde `Content-Type: application/octetstream`; o corpo é lido como texto. */
async function getBody(response: Response): Promise<unknown> {
  const text = await response.text()
  return text ? parseJsonText(text) : null
}

export function isInvalidSessionError(status: number, data: unknown): boolean {
  return (
    status === 401 &&
    Array.isArray(data) &&
    data.some(
      item =>
        typeof item === 'object' &&
        item !== null &&
        (item as { errorCode?: unknown }).errorCode === 'INVALID_SESSION_ID'
    )
  )
}

async function send(url: string, options: RequestInit, token: string) {
  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${token}`)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store',
    signal: options.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  return {
    status: response.status,
    data: await getBody(response),
    headers: response.headers,
  }
}

export const customFetchPrefRioCartaVotacao = async <T>(
  url: string,
  options: RequestInit
): Promise<T> => {
  const requestUrl = getUrl(url)

  const first = await send(requestUrl, options, await getToken())
  if (!isInvalidSessionError(first.status, first.data)) return first as T

  cachedToken = null
  const retried = await send(requestUrl, options, await getToken())
  return retried as T
}

/** Só para testes. */
export function resetPrefRioCartaVotacaoTokenCache() {
  cachedToken = null
  pendingToken = null
}
