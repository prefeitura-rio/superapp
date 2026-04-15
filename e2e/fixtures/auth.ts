import type { BrowserContext } from '@playwright/test'

function getBaseUrl(): URL {
  const port = process.env.PORT ?? '3000'
  const raw = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`
  return new URL(raw)
}

export function hasE2EAuth(): boolean {
  const t = process.env.E2E_ACCESS_TOKEN
  return typeof t === 'string' && t.length > 0
}

/**
 * Injeta o cookie de consentimento de cookies para suprimir o banner
 * CookieConsent durante os testes. Pode ser chamada independentemente
 * para contextos não autenticados.
 */
export async function applyE2ECookieConsent(
  context: BrowserContext
): Promise<void> {
  const { hostname, protocol } = getBaseUrl()
  const domain = hostname === 'localhost' ? 'localhost' : hostname

  await context.addCookies([
    {
      name: 'cookieConsent',
      value: 'true',
      domain,
      path: '/',
      httpOnly: true,
      secure: protocol === 'https:',
      sameSite: 'Lax',
    },
  ])
}

/**
 * Sets cookies expected by middleware / getUserInfoFromToken.
 * Also injects the cookie consent cookie to suppress the banner.
 */
export async function applyE2EAuthCookies(
  context: BrowserContext
): Promise<void> {
  const token = process.env.E2E_ACCESS_TOKEN
  if (!token) return

  const { hostname, protocol } = getBaseUrl()
  const domain = hostname === 'localhost' ? 'localhost' : hostname

  await context.addCookies([
    {
      name: 'access_token',
      value: token,
      domain,
      path: '/',
      httpOnly: false,
      secure: protocol === 'https:',
      sameSite: 'Lax',
    },
  ])

  const refresh = process.env.E2E_REFRESH_TOKEN
  if (refresh) {
    await context.addCookies([
      {
        name: 'refresh_token',
        value: refresh,
        domain,
        path: '/',
        httpOnly: false,
        secure: protocol === 'https:',
        sameSite: 'Lax',
      },
    ])
  }

  // Suprime o banner de cookie consent em todos os testes autenticados
  await applyE2ECookieConsent(context)
}
