# 01 — Arquitetura do superapp

## App Router — route groups

Tudo sob `src/app/(app)/`:

| Group | Auth | Exemplos |
|-------|------|----------|
| `(logged-in)/` | Exige sessão | `/carteira`, `/meu-perfil` |
| `(logged-in-out)/` | Mista (pública + logada) | `/`, `/busca`, `/servicos/*`, `/faq`, `/ouvidoria` |
| `(logged-out)/` | Fluxos de sessão | `/sessao-expirada`, `/autenticacao-necessaria/*` |

A lista canônica de rotas públicas está em `src/middleware.ts` (`publicRoutes`). Rotas não listadas exigem autenticação.

## Onde colocar código

| Pasta | Uso |
|-------|-----|
| `src/app/(app)/...` | Páginas e layouts (RSC por padrão) |
| `src/app/components/` | UI de domínio (cursos, empregos, MEI, carteira, banners…) |
| `src/components/` | Shared: `ui/` (shadcn), cookie consent, queue gate, providers de UI |
| `src/app/api/` | Route Handlers / BFF (auth, proxies, health) |
| `src/actions/` | Server Actions (perfil, cursos, MEI, pets…) |
| `src/http*` | Clientes Orval gerados — **não** editar à mão salvo regeneração |
| `src/lib/` | Auth cookies, JWT, DAL/cache, telemetria, utils |
| `src/hooks/`, `src/providers/`, `src/constants/`, `src/helpers/` | Suporte |
| `src/mocks/`, `src/test/` | MSW e setup de testes |

## Padrões de dados

- **Server Components / Server Actions** para fetch no servidor quando possível.
- **TanStack Query** no client para listas/detalhes interativos (cursos, empregos, perfil) — ver `src/providers/query-client-provider.tsx`.
- Wrappers de cache server-side: `src/lib/dal.ts`.
- Forms: React Hook Form + Zod.

## BFF vs chamada direta

- Preferir clientes Orval no server (cookies → Bearer via mutator).
- Usar `src/app/api/` quando o client precisa de um endpoint same-origin, refresh, ou proxy controlado.
- Não duplicar lógica de negócio que já existe na API Go.

## Docs relacionadas

- Auth: [02-auth.md](02-auth.md)
- APIs: [03-apis-orval.md](03-apis-orval.md)
- Domínios: [04-domains.md](04-domains.md)
- Cache/SSR cursos: [`../cursos-home-cache-ssr-tanstack.md`](../cursos-home-cache-ssr-tanstack.md)
