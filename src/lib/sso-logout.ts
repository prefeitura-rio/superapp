import { type NextRequest, NextResponse } from 'next/server'
import {
  buildKeycloakLogoutUrl,
  clearAuthCookies,
  isSpeculativeRequest,
  logoutFromKeycloak,
} from './auth-logout'
import { buildGovbrLogoutUrl } from './govbr-logout'
import { withSpan } from './telemetry'

/**
 * Para onde o navegador vai depois do logout do Keycloak:
 *
 * - `home`: a home do Pref.Rio (`GET /api/auth/sso-logout`).
 * - `govbr`: o logout do Gov.br por navegação de topo
 *   (`GET /api/auth/sso-logout/govbr`). Sem Gov.br configurado, a home.
 */
export type SsoLogoutFinalTarget = 'home' | 'govbr'

/**
 * Corpo compartilhado dos endpoints de SSO logout. Apaga os cookies da
 * aplicação, revoga o refresh token se ainda existir e redireciona (303) para
 * o logout do Keycloak por navegação de topo, que encerra a sessão SSO e segue
 * para o destino final (`finalTarget`). Sem Keycloak configurado, vai direto
 * para o destino final.
 *
 * Os destinos vêm só do ambiente; a query string é ignorada de propósito, para
 * os endpoints nunca se tornarem open redirect.
 *
 * Pré-carregamentos do navegador (prefetch/prerender) recebem 503 sem efeito
 * nenhum, para o usuário não ser deslogado sem ter clicado em "Sair". Tem de
 * ser um status fora de 2xx: o Chrome guarda um prefetch 2xx (inclusive 204)
 * e o reaproveita na navegação real, que então não chegaria aqui. Com 503 ele
 * descarta o prefetch e faz a requisição de verdade no clique.
 */
export async function handleSsoLogout(
  request: NextRequest,
  finalTarget: SsoLogoutFinalTarget
): Promise<NextResponse> {
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

    const govbrLogoutUrl =
      finalTarget === 'govbr' ? buildGovbrLogoutUrl() : null
    span.setAttribute(
      'auth.logout.final_target',
      govbrLogoutUrl ? 'govbr' : 'home'
    )

    const keycloakLogoutUrl = buildKeycloakLogoutUrl(
      govbrLogoutUrl ?? undefined
    )
    span.setAttribute(
      'auth.logout.redirect_target',
      keycloakLogoutUrl ? 'keycloak' : govbrLogoutUrl ? 'govbr' : 'home'
    )

    const homeUrl = process.env.NEXT_PUBLIC_HOME_URL?.trim()
    const destination =
      keycloakLogoutUrl ??
      govbrLogoutUrl ??
      (homeUrl || new URL('/', request.url).toString())

    const response = clearAuthCookies(NextResponse.redirect(destination, 303))
    response.headers.set('Cache-Control', 'no-store')
    return response
  })
}
