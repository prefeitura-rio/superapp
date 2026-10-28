import { buildGovbrLogoutUrl } from '@/lib/govbr-logout'
import { type NextRequest, NextResponse } from 'next/server'

const KEYCLOAK_LOGOUT_TIMEOUT_MS = 5000

async function logoutFromKeycloak(refreshToken: string): Promise<void> {
  const logoutUrl = `${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/logout`
  const clientId = process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID
  const clientSecret = process.env.IDENTIDADE_CARIOCA_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error('Missing Keycloak client ID or secret')
    return
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  })
  try {
    await fetch(logoutUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
      signal: AbortSignal.timeout(KEYCLOAK_LOGOUT_TIMEOUT_MS),
    })
  } catch (e) {
    console.error('Error logging out from Keycloak:', e)
  }
}

function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.set('access_token', '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
  })
  response.cookies.set('refresh_token', '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
  })
  return response
}

function buildHomeUrl(request: NextRequest): string {
  return process.env.NEXT_PUBLIC_HOME_URL || new URL('/', request.url).href
}

/**
 * `GET /api/auth/logout`: encerra a sessão no Keycloak, apaga os cookies e
 * responde 204.
 *
 * `GET /api/auth/logout?sso=govbr`: faz o mesmo e redireciona (303) o
 * navegador ao logout do Gov.br numa navegação de primeiro nível, que não
 * depende de cookies de terceiros; sem Gov.br configurado, vai para a home.
 * Os cookies da aplicação são apagados em qualquer caso, mesmo com o Keycloak
 * indisponível, para a sessão anterior nunca ficar presa na aplicação.
 */
export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value
  if (refreshToken) {
    await logoutFromKeycloak(refreshToken)
  }

  if (request.nextUrl.searchParams.get('sso') !== 'govbr') {
    return clearAuthCookies(new NextResponse(null, { status: 204 }))
  }

  const target = buildGovbrLogoutUrl() ?? buildHomeUrl(request)
  const response = NextResponse.redirect(target, 303)
  response.headers.set('Cache-Control', 'no-store')
  return clearAuthCookies(response)
}
