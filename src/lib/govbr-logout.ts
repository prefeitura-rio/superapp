/**
 * URL do logout do Gov.br.
 *
 * O Gov.br só devolve o navegador para o `post_logout_redirect_uri` se essa
 * URL estiver cadastrada no campo "URL de Log Out" da credencial da
 * Identidade Carioca no Gov.br, e hoje ela não está: numa navegação de
 * primeiro nível o usuário fica em `servicos.acesso.gov.br`. Por isso o
 * "Sair" (`useLogout`) depende do navegador:
 *
 * - Google Chrome: o logout do Gov.br roda num iframe oculto, invisível para o
 *   usuário, que volta para a home. Limitação conhecida: com cookies de
 *   terceiros bloqueados (aba anônima, configuração do usuário), o cookie do
 *   Gov.br não vai ao iframe e a sessão de lá continua ativa.
 * - Outros navegadores (Safari, Firefox, Brave, Edge, Samsung Internet,
 *   Chrome no iOS): bloqueiam ou podem bloquear cookies de terceiros, então o
 *   logout do Gov.br vai por navegação de topo, depois do Keycloak
 *   (`/api/auth/sso-logout/govbr`). O usuário termina no Gov.br, deslogado.
 *
 * Quando a "URL de Log Out" for cadastrada no Gov.br, todos os navegadores
 * podem usar a navegação de topo e voltar para a home, sem iframe.
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
