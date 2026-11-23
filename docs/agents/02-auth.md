# 02 — Autenticação (Keycloak / Identidade Carioca)

## Modelo

Auth **custom** OAuth2/OIDC contra Identidade Carioca (Keycloak). Cookies httpOnly:

- `access_token`
- `refresh_token`

**Não use next-auth.** Auth é o fluxo Keycloak em cookies; não há camada Auth.js.

Heimdall **não** entra no fluxo do cidadão neste portal.

## Arquivos âncora

| Concern | Path |
|---------|------|
| Middleware (rotas públicas, JWT expiry, refresh, CSP, flags) | `src/middleware.ts` |
| Config de cookies | `src/lib/auth-cookie-config.ts` |
| JWT expiry | `src/lib/jwt-utils.ts` |
| Refresh no middleware | `src/lib/middleware-helpers.ts`, `src/lib/token-refresh.ts` |
| URLs de login | `src/constants/url.ts` |
| Callback OAuth → cookies | `src/app/api/auth/callback/keycloak/route.ts` |
| Refresh | `src/app/api/auth/refresh/route.ts` |
| Logout local (204) | `src/app/api/auth/logout/route.ts` |
| Logout SSO (303 → Keycloak → home), destino do "Sair" do Pref.Rio no Chrome e do 1746 | `src/app/api/auth/sso-logout/route.ts` |
| Logout SSO + gov.br (303 → Keycloak → logout do gov.br), destino do "Sair" do Pref.Rio fora do Chrome | `src/app/api/auth/sso-logout/govbr/route.ts` |
| Helpers de logout no servidor | `src/lib/auth-logout.ts`, `src/lib/sso-logout.ts` (corpo das duas rotas de SSO logout) |
| "Sair" no client (Chrome: 1746 + iframe gov.br → `sso-logout`; outros: 1746 → `sso-logout/govbr`) | `src/hooks/use-logout.ts`, `src/lib/is-google-chrome.ts`, `src/lib/1746-logout.ts`, `src/lib/govbr-logout.ts` |
| Ler usuário do JWT | `src/lib/user-info.ts` |
| Refresh no client | `src/components/token-refresh-provider.tsx`, `src/hooks/useTokenRefresh.ts` |

## Rotas públicas (resumo)

Definidas em `src/middleware.ts`: `/`, `/faq`, `/busca/*`, `/servicos/*`, `/ouvidoria/*`, `/sessao-expirada`, políticas de cookies, manifest, e alguns fluxos de “auth necessária”.

Tudo o mais (ex.: `/carteira`, `/meu-perfil`) exige token válido; expirado → refresh ou redirect para login / sessão expirada.

## O que fazer / não fazer

**Fazer**

- Reusar helpers e route handlers de auth existentes.
- Respeitar `publicRoutes` ao criar páginas novas (adicionar à lista se a rota for pública).
- Manter cookies httpOnly; não espelhar tokens em `localStorage`.

**Não fazer**

- Introduzir next-auth / Auth.js como nova camada.
- Chamar Heimdall `users/me` no superapp.
- Bypassar middleware com “páginas protegidas” só no client.
- Fazer `/api/auth/sso-logout` aceitar URL de retorno por query string (viraria open redirect) ou removê-lo: o "Sair" do 1746 depende dele.
- Mudar o destino de `/api/auth/sso-logout` para o gov.br: o 1746 espera voltar à home. A variante com gov.br é `/api/auth/sso-logout/govbr`, e o destino dela vem só do ambiente (`buildGovbrLogoutUrl`), nunca da requisição.
- Usar o User-Agent para decidir o logout do gov.br: Brave, Edge, Opera e Samsung Internet também têm `Chrome/` nele. Usar `isGoogleChrome` (ver [`../logout-sincronizado-1746.md`](../logout-sincronizado-1746.md) §2.3).

## Docs detalhadas

- [`../pt-br/README.pt.md`](../pt-br/README.pt.md) — fluxo de auth
- [`../en-us/REFRESH_TOKEN_STRATEGY.md`](../en-us/REFRESH_TOKEN_STRATEGY.md) — refresh no middleware
- [`../LOGIN_TRACKING.md`](../LOGIN_TRACKING.md) — analytics de login
- [`../logout-sincronizado-1746.md`](../logout-sincronizado-1746.md) — logout sincronizado Pref.Rio ↔ 1746 (Salesforce)
