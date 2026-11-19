/**
 * URL do logout do Gov.br, aberta num iframe oculto depois do logout da
 * aplicação e do Keycloak.
 *
 * O Gov.br só devolve o navegador para o `post_logout_redirect_uri` se essa
 * URL estiver cadastrada no campo "URL de Log Out" da credencial da
 * Identidade Carioca no Gov.br, e hoje ela não está: numa navegação de
 * primeiro nível o usuário ficaria em `servicos.acesso.gov.br`. Por isso o
 * logout do Gov.br fica no iframe, invisível para o usuário. A limitação
 * conhecida é que navegadores que bloqueiam cookies de terceiros (Brave,
 * Safari) não enviam o cookie do Gov.br ao iframe, e a sessão de lá continua
 * ativa.
 */

/**
 * URL de retorno após o logout do Gov.br (`post_logout_redirect_uri`).
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
