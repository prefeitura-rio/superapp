/**
 * URLs do logout encadeado (aplicação → Keycloak → Gov.br).
 *
 * Os logouts do Keycloak e do Gov.br precisam acontecer em navegação de
 * primeiro nível: num iframe oculto, navegadores que bloqueiam cookies de
 * terceiros (Brave, Safari) não enviam o cookie de sessão e ela continua ativa.
 */

export const GOVBR_LOGOUT_ROUTE = '/api/auth/logout?sso=govbr'

/**
 * URL de retorno após o logout do Gov.br (`post_logout_redirect_uri`).
 * Mantém exatamente o valor usado até aqui, que é o cadastrado no Gov.br.
 */
export function buildGovbrPostLogoutRedirectUri(): string {
  return `${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/auth?client_id=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI}&response_type=code`
}

/**
 * URL do endpoint de logout do Gov.br, ou `null` quando o Gov.br não está
 * configurado no ambiente.
 */
export function buildGovbrLogoutUrl(): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_GOVBR_BASE_URL?.trim()
  if (!baseUrl) return null

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return `${normalizedBase}logout?post_logout_redirect_uri=${encodeURIComponent(buildGovbrPostLogoutRedirectUri())}`
}

/**
 * Primeiro destino do navegador depois de a aplicação apagar os cookies.
 *
 * Passa pelo logout de navegador do Keycloak, que encerra a sessão SSO pelo
 * cookie dele mesmo quando o `refresh_token` da aplicação já expirou (sem isso,
 * a volta ao `/auth` do Keycloak logaria de novo o usuário anterior), e segue
 * para o logout do Gov.br. Sem Gov.br configurado, termina em `homeUrl`.
 */
export function buildLogoutRedirectChain(homeUrl: string): string {
  const finalUrl = buildGovbrLogoutUrl() ?? homeUrl
  const keycloakBaseUrl =
    process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL?.trim()
  if (!keycloakBaseUrl) return finalUrl

  return `${keycloakBaseUrl}/logout?redirect_uri=${encodeURIComponent(finalUrl)}`
}
