import {
  buildKeycloakLogoutUrl,
  clearAuthCookies,
  isSpeculativeRequest,
  logoutFromKeycloak,
} from '@/lib/auth-logout'
import { withSpan } from '@/lib/telemetry'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * `GET /api/auth/sso-logout`: ponto final compartilhado do logout sincronizado.
 * Apaga os cookies da aplicação, revoga o refresh token se ainda existir e
 * redireciona (303) para o logout do Keycloak por navegação de topo, que
 * encerra a sessão SSO e devolve o usuário à home. A query string é ignorada
 * de propósito, para este endpoint nunca se tornar um open redirect.
 *
 * Pré-carregamentos do navegador (prefetch/prerender) recebem 503 sem efeito
 * nenhum, para o usuário não ser deslogado sem ter clicado em "Sair". Tem de
 * ser um status fora de 2xx: o Chrome guarda um prefetch 2xx (inclusive 204)
 * e o reaproveita na navegação real, que então não chegaria aqui. Com 503 ele
 * descarta o prefetch e faz a requisição de verdade no clique.
 *
 * Chamado pelo "Sair" do Pref.Rio (`useLogout`) e pelo "Sair" do 1746.
 */
export async function GET(request: NextRequest) {
  return withSpan('api.auth.sso_logout', async span => {
    if (isSpeculativeRequest(request)) {
      span.setAttribute('auth.logout.speculative', true)
      return new NextResponse(null, {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      })
    }

    const refreshToken = request.cookies.get('refresh_token')?.value
    span.setAttribute('auth.logout.had_refresh_token', !!refreshToken)
    if (refreshToken) {
      span.setAttribute(
        'auth.logout.keycloak_revoke',
        await logoutFromKeycloak(refreshToken)
      )
    }

    const keycloakLogoutUrl = buildKeycloakLogoutUrl()
    span.setAttribute(
      'auth.logout.redirect_target',
      keycloakLogoutUrl ? 'keycloak' : 'home'
    )

    const homeUrl = process.env.NEXT_PUBLIC_HOME_URL?.trim()
    const destination =
      keycloakLogoutUrl ?? (homeUrl || new URL('/', request.url).toString())

    const response = clearAuthCookies(NextResponse.redirect(destination, 303))
    response.headers.set('Cache-Control', 'no-store')
    return response
  })
}
