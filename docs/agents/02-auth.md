# 02 — Autenticação (Keycloak / Identidade Carioca)

## Modelo

Auth **custom** OAuth2/OIDC contra Identidade Carioca (Keycloak). Cookies httpOnly:

- `access_token`
- `refresh_token`

**Não use next-auth** para features novas. A dependência `next-auth` no `package.json` **não** é o padrão do app (não há uso em `src/`).

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
| Refresh / logout | `src/app/api/auth/refresh/route.ts`, `src/app/api/auth/logout/route.ts` |
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

## Docs detalhadas

- [`../pt-br/README.pt.md`](../pt-br/README.pt.md) — fluxo de auth
- [`../en-us/REFRESH_TOKEN_STRATEGY.md`](../en-us/REFRESH_TOKEN_STRATEGY.md) — refresh no middleware
- [`../LOGIN_TRACKING.md`](../LOGIN_TRACKING.md) — analytics de login
