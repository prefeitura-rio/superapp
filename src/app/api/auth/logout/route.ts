import { clearAuthCookies, logoutFromKeycloak } from '@/lib/auth-logout'
import { withSpan } from '@/lib/telemetry'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * `GET /api/auth/logout`: encerra a sessão no Keycloak, apaga os cookies e
 * responde 204. Os cookies da aplicação são apagados em qualquer caso, mesmo
 * com o Keycloak indisponível, para a sessão anterior nunca ficar presa na
 * aplicação. O logout do 1746 e do Gov.br fica a cargo do cliente
 * (`useLogout`).
 */
export async function GET(request: NextRequest) {
  return withSpan('api.auth.logout', async span => {
    const refreshToken = request.cookies.get('refresh_token')?.value
    span.setAttribute('auth.logout.had_refresh_token', !!refreshToken)
    if (refreshToken) {
      span.setAttribute(
        'auth.logout.keycloak_revoke',
        await logoutFromKeycloak(refreshToken)
      )
    }

    return clearAuthCookies(
      new NextResponse(null, {
        status: 204,
        headers: { 'Cache-Control': 'no-store' },
      })
    )
  })
}
