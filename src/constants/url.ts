// export const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = `${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/auth?client_id=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI}&response_type=code`
// Essa URL redireciona pra tela de login do Keycloak, com o gif animado
// Preferi não utilizar a tela de login do Keycloak por uma questão de UX. A opção de ir direto para o gov.br é mais intuitiva.

export const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = `${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/auth?client_id=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI}&response_type=code&kc_idp_hint=govbr`
// URL para redirecionamento direto ao gov.br (bypassing a tela de seleção do Keycloak)
export const REDIRECT_DIRECT_TO_GOVBR_ROUTE = `${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/auth?client_id=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI}&response_type=code&kc_idp_hint=govbr`

export const REDIRECT_WHEN_SESSION_EXPIRED_ROUTE = '/sessao-expirada'

/**
 * Builds authentication URL with optional return URL for post-login redirect
 * @param returnUrl - The URL to redirect to after successful authentication
 * @returns Complete authentication URL with encoded return URL as state parameter
 */
export function buildAuthUrl(returnUrl?: string): string {
  const baseUrl = `${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/auth`
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID!,
    redirect_uri: process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI!,
    response_type: 'code',
    kc_idp_hint: 'govbr',
  })

  // Add return URL as state parameter if provided
  if (returnUrl) {
    // Validate return URL to prevent open redirect vulnerabilities
    const isValidReturnUrl =
      returnUrl.startsWith('/') && !returnUrl.startsWith('//')
    if (isValidReturnUrl) {
      params.set('state', encodeURIComponent(returnUrl))
    }
  }

  return `${baseUrl}?${params.toString()}`
}
