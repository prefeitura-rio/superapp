/**
 * Normalizes the `data` returned by the generated API clients, which may come
 * as raw text when the upstream does not label the body as JSON.
 *
 * Unlike a bare `JSON.parse`, an empty or non-JSON body yields `null` instead
 * of throwing `SyntaxError: Unexpected end of JSON input`.
 */
export function parseJsonBody<T = unknown>(data: unknown): T | null {
  if (typeof data !== 'string') {
    return (data ?? null) as T | null
  }

  if (data.trim() === '') {
    return null
  }

  try {
    return JSON.parse(data) as T
  } catch {
    return null
  }
}
