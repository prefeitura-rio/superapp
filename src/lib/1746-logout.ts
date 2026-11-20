/**
 * Logout local do 1746 (Salesforce), chamado em segundo plano pelo "Sair" do
 * Pref.Rio (`useLogout`).
 *
 * O 1746 roda num subdomínio do Pref.Rio, então as duas aplicações são o mesmo
 * site e o cookie de sessão do Salesforce vai na requisição mesmo nos
 * navegadores que bloqueiam cookies de terceiros. A resposta é opaca
 * (`no-cors`), e basta: o Salesforce encerra a sessão ao receber a requisição,
 * sem depender do JS da página de logout.
 */

/**
 * URL do logout do 1746, ou `null` quando o 1746 não está configurado no
 * ambiente.
 */
export function build1746LogoutUrl(): string | null {
  return process.env.NEXT_PUBLIC_1746_LOGOUT_URL?.trim() || null
}

/**
 * Origem do logout do 1746, liberada no `connect-src` da CSP. `null` quando o
 * 1746 não está configurado ou a URL é inválida.
 */
export function get1746LogoutOrigin(): string | null {
  const url = build1746LogoutUrl()
  if (!url) return null

  try {
    return new URL(url).origin
  } catch {
    return null
  }
}
