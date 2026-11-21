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
| Logout SSO (303 → Keycloak), destino do "Sair" do Pref.Rio e do 1746 | `src/app/api/auth/sso-logout/route.ts` |
| Helpers de logout no servidor | `src/lib/auth-logout.ts` |
| "Sair" no client (1746 + gov.br em segundo plano → `sso-logout`) | `src/hooks/use-logout.ts`, `src/lib/1746-logout.ts`, `src/lib/govbr-logout.ts` |
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

## Docs detalhadas

- [`../pt-br/README.pt.md`](../pt-br/README.pt.md) — fluxo de auth
- [`../en-us/REFRESH_TOKEN_STRATEGY.md`](../en-us/REFRESH_TOKEN_STRATEGY.md) — refresh no middleware
- [`../LOGIN_TRACKING.md`](../LOGIN_TRACKING.md) — analytics de login
- [`../logout-sincronizado-1746.md`](../logout-sincronizado-1746.md) — logout sincronizado Pref.Rio ↔ 1746 (Salesforce)
