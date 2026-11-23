import { handleSsoLogout } from '@/lib/sso-logout'
import type { NextRequest } from 'next/server'

/**
 * `GET /api/auth/sso-logout/govbr`: o mesmo que `/api/auth/sso-logout`, mas o
 * Keycloak, em vez de voltar para a home, segue para o logout do Gov.br por
 * navegação de topo (app → Keycloak → Gov.br).
 *
 * Usado pelo "Sair" do Pref.Rio fora do Google Chrome (`useLogout`): nesses
 * navegadores o iframe oculto não leva o cookie do Gov.br e a sessão de lá
 * sobreviveria. Como a URL de retorno do Pref.Rio não está cadastrada no
 * Gov.br, o usuário termina em `servicos.acesso.gov.br`, deslogado. O destino
 * vem só do ambiente e a query string é ignorada (nunca é open redirect). Sem
 * Gov.br configurado, termina na home como o `/api/auth/sso-logout`.
 */
export async function GET(request: NextRequest) {
  return handleSsoLogout(request, 'govbr')
}
