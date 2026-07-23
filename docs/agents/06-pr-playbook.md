# 06 — Playbook de PR (PMs / Claude Code)

Checklist para transformar um pedido de alto nível (ex.: Jira) em um PR seguro neste repositório.

## 1. Entender o escopo

- [ ] A feature é **só UI/portal**? Se precisa de endpoint novo, migration, RBAC ou tela admin → outro repo (`app-go-api`, `portal-interno`, Heimdall). Documente a dependência; não invente backend aqui.
- [ ] Ler [00-overview.md](00-overview.md) e o domínio em [04-domains.md](04-domains.md).

## 2. Ler a fonte de verdade certa

- [ ] Doc Next.js em `node_modules/next/dist/docs/` para routing, data fetching, caching, etc.
- [ ] Temáticos: [01-architecture](01-architecture.md), [02-auth](02-auth.md), [03-apis-orval](03-apis-orval.md), [05-code-style](05-code-style.md).
- [ ] Docs de domínio existentes em `docs/` (MEI, busca, cursos…).

## 3. Localizar onde implementar

- [ ] Página no route group certo (`logged-in` vs `logged-in-out`).
- [ ] Se pública: atualizar `publicRoutes` em `src/middleware.ts`.
- [ ] Componentes de domínio em `src/app/components/`; shared UI em `src/components/`.
- [ ] Cliente Orval correto (`http-courses`, `http`, `http-app-catalogo`, …) — ver [03-apis-orval.md](03-apis-orval.md).

## 4. Decisões técnicas padrão

- [ ] RSC por padrão; `'use client'` só se necessário.
- [ ] Auth: cookies Keycloak existentes — sem next-auth, sem Heimdall.
- [ ] Feature flag: se a superfície for gateada, seguir padrão `NEXT_PUBLIC_FEATURE_FLAG`.
- [ ] Forms: RHF + Zod; listagens interativas: TanStack Query.
- [ ] UI: componentes shadcn em `src/components/ui/`; só Tailwind em `className` (sem inline style); escala (`p-3`) > `p-[12px]`; cores via tokens de `src/app/globals.css`.
- [ ] Ícones: checar `src/assets/icons`; se usar Lucide, **mencionar na PR** que não há ícone correspondente no design system.

## 5. O que NÃO incluir no PR

- Regeneração Orval “por precaução” ou troca permanente de `orval.config.ts` sem pedido.
- Refactors amplos fora do ticket.
- Secrets / `.env` com credenciais.
- Mudanças em `node_modules` ou locks não relacionados.

## 6. Verificar antes de abrir o PR

```bash
npm run format
npm run lint
npm run typecheck
npm run test:run
# e2e se a feature tocar fluxos críticos:
# npm run test:e2e
```

- [ ] Diff focado no pedido.
- [ ] Descrição do PR: o quê / por quê; links Jira; menção a dependências em outros repos se houver.
- [ ] Screenshots ou notas de QA se for UI visível.

## 7. Pedidos típicos de Jira → onde olhar

| Pedido (exemplo) | Começar em |
|------------------|------------|
| Nova página de serviço / curso | `src/app/(app)/(logged-in-out)/servicos/`, `http-courses/` |
| Ajuste de inscrição / certificado | `src/app/components/courses/`, docs de certificado |
| Vaga / currículo / candidatura | rotas `/servicos/trabalho`, feature flag empregos |
| Proposta MEI | `/servicos/mei`, [`../mei.md`](../mei.md) |
| Busca / recomendações | `/busca`, `http-app-catalogo/` |
| Carteira / documento | `(logged-in)/carteira/` |
| Perfil / endereço | `src/actions/`, `http/` (RMI) |
| Login / sessão | [02-auth.md](02-auth.md) — cuidado alto |
