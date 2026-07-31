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
  const baseUrl = process.env.BASE_API_URL_PREF_RIO_CHAMADOS_PUBLICO

  if (!baseUrl) {
    throw new Error(
      'BASE_API_URL_PREF_RIO_CHAMADOS_PUBLICO environment variable is not set.'
    )
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

const getHeaders = (headers?: HeadersInit): HeadersInit => {
  const hasContentType =
    headers && typeof headers === 'object' && 'Content-Type' in headers

  return {
    ...headers,
    ...(hasContentType ? {} : { 'Content-Type': 'application/json' }),
  }
}

export const customFetchPrefRioChamadosPublico = async <T>(
  url: string,
  options: RequestInit
): Promise<T> => {
  const requestUrl = getUrl(url)
  const requestHeaders = getHeaders(options.headers)

  const requestInit: RequestInit = {
    ...options,
    headers: requestHeaders,
  }

  const response = await fetch(requestUrl, requestInit)
  const data = await getBody<T>(response)

  return { status: response.status, data, headers: response.headers } as T
}
