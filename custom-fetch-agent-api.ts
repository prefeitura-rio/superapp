import { cookies } from 'next/headers'

// NOTE: Supports cases where `content-type` is other than `json`
const getBody = <T>(c: Response | Request): Promise<T> => {
  const contentType = c.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    return c.json()
  }

  if (contentType?.includes('application/pdf')) {
    return c.blob() as Promise<T>
  }

  return c.text() as Promise<T>
}

// NOTE: Update just base url
const getUrl = (contextUrl: string): string => {
  const baseUrl = process.env.AGENT_API_BASE_URL

  if (!baseUrl) {
    throw new Error('AGENT_API_BASE_URL environment variable is not set.')
  }

  // Ensure baseUrl ends with '/' and contextUrl doesn't start with '/'
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const normalizedContextUrl = contextUrl.startsWith('/')
    ? contextUrl.slice(1)
    : contextUrl

  // Construct the URL using contextUrl as the path relative to baseUrl.
  const requestUrl = new URL(normalizedContextUrl, normalizedBaseUrl)

  return requestUrl.toString()
}

const getHeaders = async (headers?: HeadersInit): Promise<HeadersInit> => {
  const cookieStore = await cookies()
  const access_token = cookieStore.get('access_token')?.value

  if (!access_token) {
    console.warn('[CUSTOM_FETCH_AGENT_API] No access token found in cookies')
  }

  // Check if Content-Type is already set in headers
  const hasContentType =
    headers && typeof headers === 'object' && 'Content-Type' in headers

  return {
    ...headers,
    ...(access_token && { Authorization: `Bearer ${access_token}` }),
    // Don't override Content-Type if it's already set in headers
    ...(hasContentType ? {} : { 'Content-Type': 'application/json' }),
  }
}

export const customFetchAgentApi = async <T>(
  url: string,
  options: RequestInit
): Promise<T> => {
  const requestUrl = getUrl(url)
  const requestHeaders = await getHeaders(options.headers)

  const requestInit: RequestInit = {
    ...options,
    headers: requestHeaders,
  }

  const response = await fetch(requestUrl, requestInit)
  const data = await getBody<T>(response)

  return { status: response.status, data, headers: response.headers } as T
}
