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
    const response = await fetch(logoutUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
      signal: AbortSignal.timeout(KEYCLOAK_LOGOUT_TIMEOUT_MS),
    })
    if (!response.ok) {
      console.error(`Keycloak logout failed with status ${response.status}`)
    }
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

/**
 * `GET /api/auth/logout`: encerra a sessão no Keycloak, apaga os cookies e
 * responde 204. Os cookies da aplicação são apagados em qualquer caso, mesmo
 * com o Keycloak indisponível, para a sessão anterior nunca ficar presa na
 * aplicação. O logout do Gov.br fica a cargo do cliente (`useLogout`).
 */
export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value
  if (refreshToken) {
    await logoutFromKeycloak(refreshToken)
  }

  return clearAuthCookies(new NextResponse(null, { status: 204 }))
}
