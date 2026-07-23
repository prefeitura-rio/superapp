<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# pref.rio (superapp) — contexto para agentes

Portal do cidadão da Prefeitura do Rio ([pref.rio](https://pref.rio)). Este repositório é o frontend Next.js do cidadão — **não** o backoffice ([portal-interno](https://github.com/prefeitura-rio/portal-interno)).

## Stack (fonte de verdade: `package.json`)

- Next.js **16** (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui (Radix)
- TanStack Query v5, React Hook Form + Zod
- Orval (clientes OpenAPI → TypeScript)
- Biome (lint/format), Vitest + Playwright
- OpenTelemetry

## Docs Next.js (dual pointer)

A training data está desatualizada. Use **uma** destas fontes (nesta ordem):

1. **Local (após `npm install`):** `node_modules/next/dist/docs/` — docs empacotadas da versão instalada (Next 16).
2. **Remoto (CI / Claude Code no GitHub / sem `node_modules`):**
   - Índice LLM: [https://nextjs.org/docs/llms.txt](https://nextjs.org/docs/llms.txt)
   - Docs App Router: [https://nextjs.org/docs/app](https://nextjs.org/docs/app)
   - Guia AI agents: [https://nextjs.org/docs/app/guides/ai-agents](https://nextjs.org/docs/app/guides/ai-agents)

Agentes invocados via Jira → GitHub em geral **não** têm `node_modules` até o workflow instalar deps — nesse caso use sempre o ponteiro remoto.

## Antes de implementar

1. Ler a doc Next.js relevante (dual pointer acima).
2. Abrir o arquivo temático em `docs/agents/` que cobre a tarefa.
3. Para o ecossistema (outros serviços), usar [00-overview.md](docs/agents/00-overview.md) e os links GitHub — **não** assumir pastas irmãs no disco (`../app-go-api`, etc.). Este repo no GitHub é standalone.

## Índice — `docs/agents/`

| Arquivo | Quando ler |
|---------|------------|
| [00-overview.md](docs/agents/00-overview.md) | Papel do superapp vs outros projetos; links GitHub; o que **não** mudar aqui |
| [01-architecture.md](docs/agents/01-architecture.md) | Rotas, pastas, BFF, Server Actions |
| [02-auth.md](docs/agents/02-auth.md) | Keycloak, cookies, middleware, rotas públicas |
| [03-apis-orval.md](docs/agents/03-apis-orval.md) | Clientes `http*`, mutators, regenerar Orval |
| [04-domains.md](docs/agents/04-domains.md) | Cursos, empregos, MEI, busca, carteira, perfil, feature flags |
| [05-code-style.md](docs/agents/05-code-style.md) | Convenções de código e UI |
| [06-pr-playbook.md](docs/agents/06-pr-playbook.md) | Checklist para PRs de alto nível (PMs / Claude Code) |

## Regras de ouro

- Preferir React Server Components; `'use client'` só quando necessário (Web APIs, interatividade).
- Auth = cookies JWT do Keycloak (`access_token` / `refresh_token`). **Não** usar next-auth (a dependência existe, mas não é o padrão do app).
- Superapp **não** usa Heimdall (sem RBAC no lado do cidadão).
- Dados de API: usar o cliente Orval certo em `src/http*` — não inventar fetch ad-hoc se o client já existe.
- Não regenerar Orval nem editar specs OpenAPI sem necessidade explícita da tarefa.
- Mudanças de API, RBAC ou backoffice **não** pertencem a este repo — abrir/documentar issue ou PR no GitHub do serviço correspondente.
- UI: shadcn (`src/components/ui/`) + Tailwind classes; sem CSS inline salvo necessidade real; escala Tailwind (`p-3`) > arbitrary (`p-[12px]`); cores via tokens em `src/app/globals.css`.
- Ícones: `src/assets/icons` primeiro; se não houver, Lucide + avisar na PR que falta ícone no design system.
- Formatação/lint: Biome (`npm run lint` / `npm run format`). Typecheck: `npm run typecheck`.
