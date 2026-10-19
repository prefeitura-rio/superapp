import { jwtDecode } from 'jwt-decode'
import { cookies } from 'next/headers'

/**
 * Por onde o cidadão entrou na sessão atual: `govbr` (provedor externo, via Keycloak) ou
 * `identidade-carioca` (usuário e senha do próprio Keycloak). `null` quando o token não diz.
 *
 * Importa para a reautenticação do requerimento de parcelamento: ela valida a senha da conta
 * **Identidade Carioca** por password grant, e quem entrou pelo gov.br pode não ter essa senha —
 * em produção o login vai direto ao gov.br (`kc_idp_hint=govbr`).
 *
 * ⚠️ O Keycloak só põe o provedor no token se houver mapper configurado no client scope
 * (claim `identity_provider`, a partir da nota de sessão de mesmo nome), e login local não
 * tem a nota. Sem o mapper, ou em login local, este helper devolve `null` e a tela mostra a
 * orientação genérica — que vale para todos.
 */
export type ProvedorLogin = 'govbr' | 'identidade-carioca' | null

/** Claims em que o provedor pode vir, conforme o mapper configurado no realm. */
const CLAIMS_PROVEDOR = ['identity_provider', 'idp', 'identityProvider']

export function provedorDoToken(token: Record<string, unknown>): ProvedorLogin {
  for (const claim of CLAIMS_PROVEDOR) {
    const valor = token[claim]
    if (typeof valor !== 'string' || valor.trim() === '') continue

    return valor.toLowerCase().includes('gov') ? 'govbr' : 'identidade-carioca'
  }

  return null
}

export async function getProvedorLogin(): Promise<ProvedorLogin> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return null

  try {
    return provedorDoToken(jwtDecode<Record<string, unknown>>(token))
  } catch {
    return null
  }
}

/**
 * Console de conta do Keycloak ("Minha conta Identidade Carioca"), onde o cidadão define ou troca
 * a senha. Derivado da base OIDC configurada — `.../realms/<realm>/protocol/openid-connect` vira
 * `.../realms/<realm>/account` —, para seguir o ambiente sem variável nova.
 */
export function urlContaIdentidadeCarioca(): string | null {
  const base = process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL
  if (!base) return null

  return base.replace(/\/protocol\/openid-connect\/?$/, '/account')
}
