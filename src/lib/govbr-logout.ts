/**
 * URLs do logout encadeado (aplicação → Keycloak → Gov.br).
 *
 * O logout do Gov.br precisa acontecer numa navegação de primeiro nível: num
 * iframe oculto, navegadores que bloqueiam cookies de terceiros (Brave,
 * Safari) não enviam o cookie de sessão do Gov.br e a sessão continua ativa.
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
