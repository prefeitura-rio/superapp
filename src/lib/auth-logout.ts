import type { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE_CONFIG } from './auth-cookie-config'

const KEYCLOAK_LOGOUT_TIMEOUT_MS = 5000

const AUTH_COOKIE_NAMES = ['access_token', 'refresh_token'] as const

/**
 * Resultado da revogação do refresh token no Keycloak, para telemetria.
 * Nenhum resultado impede o logout local.
 */
export type KeycloakRevokeResult =
  | 'revoked'
  | 'rejected'
  | 'error'
  | 'missing_credentials'

export async function logoutFromKeycloak(
  refreshToken: string
): Promise<KeycloakRevokeResult> {
  const logoutUrl = `${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/logout`
  const clientId = process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID
  const clientSecret = process.env.IDENTIDADE_CARIOCA_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error('Missing Keycloak client ID or secret')
    return 'missing_credentials'
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
      return 'rejected'
    }
    return 'revoked'
  } catch (e) {
    console.error('Error logging out from Keycloak:', e)
    return 'error'
  }
}

/**
 * Apaga os cookies de sessão com os mesmos atributos usados para criá-los
 * (`AUTH_COOKIE_CONFIG`). Se um dia o `domain` for ativado lá, a remoção
 * continua batendo com o cookie original; com atributos diferentes o
 * navegador manteria o cookie antigo.
 */
export function clearAuthCookies(response: NextResponse): NextResponse {
  for (const name of AUTH_COOKIE_NAMES) {
    response.cookies.set(name, '', { ...AUTH_COOKIE_CONFIG, maxAge: 0 })
  }
  return response
}

/**
 * `true` quando o navegador está só pré-carregando a URL (prefetch,
 * prerender, sugestões da barra de endereço), e não navegando de fato.
 * Endpoints de logout por GET não devem ter efeito nesses casos.
 */
export function isSpeculativeRequest(request: NextRequest): boolean {
  const secPurpose = request.headers.get('sec-purpose')?.toLowerCase() ?? ''
  const purpose = request.headers.get('purpose')?.toLowerCase() ?? ''
  const xMoz = request.headers.get('x-moz')?.toLowerCase() ?? ''
  return (
    secPurpose.includes('prefetch') ||
    secPurpose.includes('prerender') ||
    purpose === 'prefetch' ||
    xMoz === 'prefetch'
  )
}

/**
 * URL do logout do Keycloak por navegação de topo. Ao contrário do
 * `logoutFromKeycloak`, encerra a sessão SSO pelo cookie do Keycloak, então
 * funciona mesmo depois que o refresh token expirou.
 *
 * Depois do logout o Keycloak leva o navegador a `postLogoutRedirectUri`, que
 * por padrão é a home. O destino vem sempre do ambiente (home ou logout do
 * Gov.br), nunca da requisição. `null` quando o Keycloak ou o destino não
 * estão configurados no ambiente.
 *
 * A versão atual do Keycloak aceita `post_logout_redirect_uri` sem
 * `id_token_hint`. A partir do Keycloak 18, sem `id_token_hint` o Keycloak
 * exige `client_id`, só aceita URIs cadastradas em "Valid post logout redirect
 * URIs" e mostra uma tela de confirmação antes de sair. Antes desse upgrade, é
 * preciso passar a enviar o `id_token_hint` e cadastrar a home e o logout do
 * Gov.br nessas URIs (ver `docs/logout-sincronizado-1746.md`).
 */
export function buildKeycloakLogoutUrl(
  postLogoutRedirectUri?: string
): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL?.trim()
  const redirectUri =
    postLogoutRedirectUri ?? process.env.NEXT_PUBLIC_HOME_URL?.trim()
  if (!baseUrl || !redirectUri) return null

  const params = new URLSearchParams()
  const clientId = process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID
  if (clientId) params.set('client_id', clientId)
  params.set('post_logout_redirect_uri', redirectUri)

  return `${baseUrl}/logout?${params.toString()}`
}
