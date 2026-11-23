import { handleSsoLogout } from '@/lib/sso-logout'
import type { NextRequest } from 'next/server'

/**
 * `GET /api/auth/sso-logout`: ponto final compartilhado do logout sincronizado.
 * Apaga os cookies da aplicação, revoga o refresh token se ainda existir e
 * redireciona (303) para o logout do Keycloak por navegação de topo, que
 * encerra a sessão SSO e devolve o usuário à home. A query string é ignorada
 * de propósito, para este endpoint nunca se tornar um open redirect.
 * Pré-carregamentos recebem 503 sem efeito (ver `handleSsoLogout`).
 *
 * Chamado pelo "Sair" do Pref.Rio no Google Chrome (`useLogout`) e pelo "Sair"
 * do 1746. Nos outros navegadores o "Sair" do Pref.Rio usa
 * `/api/auth/sso-logout/govbr`.
 */
export async function GET(request: NextRequest) {
  return handleSsoLogout(request, 'home')
}
