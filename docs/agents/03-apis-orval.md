# 03 — APIs e Orval

## Clientes gerados

| Pasta | Backend (GitHub) | Mutator (raiz do repo) | Base URL (env) |
|-------|------------------|------------------------|----------------|
| `src/http/` | [app-rmi](https://github.com/prefeitura-rio/app-rmi) | `custom-fetch.ts` | `BASE_API_URL_RMI` / variantes `NEXT_PUBLIC_*` |
| `src/http-courses/` | [app-go-api](https://github.com/prefeitura-rio/app-go-api) | `custom-fetch-course.ts` | `COURSES_BASE_API_URL` |
| `src/http-busca-search/` | [app-busca-search](https://github.com/prefeitura-rio/app-busca-search) | `custom-fetch-busca-search.ts` | `BASE_API_URL_APP_BUSCA_SEARCH` |
| `src/http-app-catalogo/` | [app-catalogo](https://github.com/prefeitura-rio/app-catalogo) | `custom-fetch-app-catalogo.ts` | `BASE_API_URL_APP_CATALOGO` |
| `src/http-agent-api/` | [superapp-agent-api](https://github.com/prefeitura-rio/superapp-agent-api) | `custom-fetch-agent-api.ts` | `AGENT_API_BASE_URL` |

Os mutators injetam `Authorization: Bearer` a partir dos cookies de sessão.

## Orval — config ativa única

[`orval.config.ts`](../../orval.config.ts) aponta para **um** target por vez (hoje: app-go-api → `src/http-courses/`).

Para regenerar outro client: editar `input` / `target` / `schemas` / `baseUrl` / mutator conforme a receita em [`../orval-apis.md`](../orval-apis.md), rodar Orval, e **não** commititar mudanças de config “trocada” sem combinar com o time.

## Regras

- Preferir funções geradas em `src/http*` em vez de `fetch` manual.
- Não editar arquivos gerados à mão; regenere a partir da OpenAPI.
- Spec OpenAPI do `app-go-api` vive no repo Go (`docs/swagger.yaml`); mudanças de contrato = PR em [app-go-api](https://github.com/prefeitura-rio/app-go-api), depois regenerar o client aqui.
- Caching server-side: ver `src/lib/dal.ts`.
- Proxies browser-facing: `src/app/api/`.

## Quando o código da API não está no checkout

No Jira / Claude Code no GitHub, só o `superapp` está clonado. Nesse caso:

1. Use o client Orval e tipos já gerados em `src/http*`.
2. Se precisar inspecionar a API, abra o repo GitHub correspondente (tabela acima) ou a OpenAPI raw — não invente shape de response.
3. Se faltar endpoint, documente a dependência no PR com link para o outro repo — não invente backend neste repositório.

## Docs relacionadas

- [`../orval-apis.md`](../orval-apis.md) — receitas por API
- [`../integracao-busca-api.md`](../integracao-busca-api.md)
- Overview: [00-overview.md](00-overview.md)
