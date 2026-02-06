/**
 * Configuração centralizada e segura para cookies de autenticação
 * Garante consistência entre OAuth callback e refresh de tokens
 *
 * IMPORTANTE: Estas configurações seguem as best practices de segurança
 * e atendem aos requisitos de navegadores modernos (Chrome 80+, Safari 13+)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
 * @see https://web.dev/samesite-cookies-explained/
 */

/**
 * Durações dos tokens (em segundos)
 * IMPORTANTE: Devem corresponder às configurações REAIS do Keycloak
 *
 * Keycloak Staging/Produção atual:
 * - Access Token Lifespan: ~10 horas (35854s)
 * - Refresh Token Lifespan: 30 minutos (1800s)
 *
 * CRÍTICO: Se o cookie expirar antes do token JWT, o navegador
 * deleta o cookie e o usuário é deslogado mesmo com token válido!
 */
export const ACCESS_TOKEN_MAX_AGE = 10 * 60 * 60 // 10 horas (igual Keycloak)
export const REFRESH_TOKEN_MAX_AGE = 30 * 60 // 30 minutos (igual Keycloak)

/**
 * Configuração base compartilhada entre access e refresh tokens
 *
 * - httpOnly: Previne acesso via JavaScript (proteção contra XSS)
 * - secure: Garante transmissão apenas via HTTPS em produção
 * - sameSite: 'lax' protege contra CSRF mantendo navegabilidade
 * - path: '/' torna o cookie disponível em todas as rotas
 */
export const AUTH_COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  // NOTA: Descomente a linha abaixo se precisar compartilhar cookies entre subdomínios
  // domain: '.rio.gov.br',
} as const

/**
 * Retorna configuração completa para access_token cookie
 * Inclui maxAge para persistência entre sessões do navegador
 */
export const getAccessTokenCookieConfig = () => ({
  ...AUTH_COOKIE_CONFIG,
  maxAge: ACCESS_TOKEN_MAX_AGE,
})

/**
 * Retorna configuração completa para refresh_token cookie
 * Usa maxAge mais longo para permitir refresh automático
 */
export const getRefreshTokenCookieConfig = () => ({
  ...AUTH_COOKIE_CONFIG,
  maxAge: REFRESH_TOKEN_MAX_AGE,
})
